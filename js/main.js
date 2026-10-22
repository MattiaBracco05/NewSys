// New Sys Impianti Elettrici - interactive layer
// Power-on boot, live meter, synthesised sounds, circuit hero, scroll wiring,
// services panel and smart home simulator.
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const safe = (fn, fallback = null) => { try { return fn(); } catch (e) { return fallback; } };
    const store = {
        get: (k, s = localStorage) => safe(() => s.getItem(k)),
        set: (k, v, s = localStorage) => safe(() => s.setItem(k, v))
    };
    const session = {
        get: (k) => safe(() => sessionStorage.getItem(k)),
        set: (k, v) => safe(() => sessionStorage.setItem(k, v))
    };

    const state = { mx: -9999, my: -9999, scrollY: window.scrollY, vh: window.innerHeight, load: 0.32 };
    window.addEventListener('pointermove', (e) => { state.mx = e.clientX; state.my = e.clientY; }, { passive: true });
    window.addEventListener('scroll', () => { state.scrollY = window.scrollY; }, { passive: true });

    const measureFns = [];
    const onMeasure = (fn) => { measureFns.push(fn); fn(); };
    const measure = () => { state.vh = window.innerHeight; measureFns.forEach((fn) => fn()); };
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);

    /* ------------------------------------------------------------------
       Sound: everything synthesised with Web Audio, no files
    ------------------------------------------------------------------ */
    const Sound = (() => {
        let ctx = null, master = null, humGain = null, humFilter = null, noiseBuf = null;
        let enabled = store.get('ns_sound') === '1';

        const ensure = () => {
            if (ctx) return true;
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return false;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.9;
            master.connect(ctx.destination);

            noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            const d = noiseBuf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

            // Mains hum: 50 Hz fundamental plus the 100/150 Hz buzz transformers make
            humFilter = ctx.createBiquadFilter();
            humFilter.type = 'lowpass';
            humFilter.frequency.value = 420;
            humGain = ctx.createGain();
            humGain.gain.value = 0;
            humFilter.connect(humGain).connect(master);
            [[50, 'sine', .5], [100, 'sawtooth', .18], [150, 'square', .05], [200, 'sawtooth', .05]].forEach(([f, type, g]) => {
                const o = ctx.createOscillator();
                o.type = type; o.frequency.value = f;
                const og = ctx.createGain(); og.gain.value = g;
                o.connect(og).connect(humFilter);
                o.start();
            });
            return true;
        };

        const noise = (dur, freq, q, gain, when = 0) => {
            const t = ctx.currentTime + when;
            const src = ctx.createBufferSource(); src.buffer = noiseBuf;
            const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
            const g = ctx.createGain();
            g.gain.setValueAtTime(gain, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            src.connect(bp).connect(g).connect(master);
            src.start(t); src.stop(t + dur + 0.02);
            return bp;
        };
        const tone = (type, f0, f1, dur, gain, when = 0) => {
            const t = ctx.currentTime + when;
            const o = ctx.createOscillator(); o.type = type;
            o.frequency.setValueAtTime(f0, t);
            if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
            const g = ctx.createGain();
            g.gain.setValueAtTime(gain, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            o.connect(g).connect(master);
            o.start(t); o.stop(t + dur + 0.02);
        };

        const fx = {
            clack: () => { noise(0.05, 2600, 1.2, 0.5); tone('sine', 140, 60, 0.12, 0.5); noise(0.03, 4200, 2, 0.25, 0.04); },
            click: () => { noise(0.03, 3200, 2, 0.3); tone('sine', 900, 500, 0.04, 0.08); },
            tick: () => tone('sine', 1500 + Math.random() * 500, 1200, 0.05, 0.05),
            zap: () => {
                const bp = noise(0.22, 1800, 4, 0.22);
                bp.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + 0.2);
                tone('sawtooth', 220, 1800, 0.12, 0.04);
            },
            siren: (dur = 3) => {
                const t = ctx.currentTime;
                const o = ctx.createOscillator(); o.type = 'square';
                const g = ctx.createGain(); g.gain.value = 0.05;
                for (let i = 0; i < dur * 2; i++) {
                    o.frequency.setValueAtTime(680, t + i * 0.5);
                    o.frequency.linearRampToValueAtTime(1100, t + i * 0.5 + 0.25);
                }
                g.gain.setValueAtTime(0.05, t + dur - 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, t + dur);
                o.connect(g).connect(master);
                o.start(t); o.stop(t + dur);
            }
        };

        const play = (name, ...args) => {
            if (!enabled || !ensure()) return;
            if (ctx.state === 'suspended') ctx.resume();
            fx[name](...args);
        };
        // One-shot that is allowed even with sound off (the boot lever)
        const playOnce = (name) => {
            if (store.get('ns_sound') === '0' || !ensure()) return;
            if (ctx.state === 'suspended') ctx.resume();
            fx[name]();
        };
        const setEnabled = (on) => {
            enabled = on;
            store.set('ns_sound', on ? '1' : '0');
            if (on && ensure()) ctx.resume();
            if (humGain) humGain.gain.setTargetAtTime(on ? 0.05 : 0, ctx.currentTime, on ? 0.5 : 0.1);
        };
        const setLoad = (kw) => {
            if (!ctx || !enabled) return;
            humFilter.frequency.setTargetAtTime(300 + clamp(kw, 0, 3) * 260, ctx.currentTime, 0.4);
            humGain.gain.setTargetAtTime(0.035 + clamp(kw, 0, 3) * 0.015, ctx.currentTime, 0.4);
        };
        document.addEventListener('visibilitychange', () => {
            if (!ctx) return;
            if (document.hidden) ctx.suspend(); else if (enabled) ctx.resume();
        });
        return { play, playOnce, setEnabled, setLoad, isEnabled: () => enabled };
    })();

    const soundBtn = $('[data-sound]');
    const syncSound = () => {
        const on = Sound.isEnabled();
        soundBtn.setAttribute('aria-pressed', String(on));
        soundBtn.setAttribute('aria-label', on ? 'Disattiva suoni' : 'Attiva suoni');
        soundBtn.innerHTML = on ? '<i class="fas fa-volume-high"></i>' : '<i class="fas fa-volume-xmark"></i>';
    };
    soundBtn.addEventListener('click', () => {
        Sound.setEnabled(!Sound.isEnabled());
        syncSound();
        Sound.play('click');
    });
    syncSound();
    // Browsers only start audio after a gesture: re-arm the hum on the first one
    if (Sound.isEnabled()) {
        const arm = () => { Sound.setEnabled(true); window.removeEventListener('pointerdown', arm); window.removeEventListener('keydown', arm); };
        window.addEventListener('pointerdown', arm);
        window.addEventListener('keydown', arm);
    }

    /* ------------------------------------------------------------------
       Boot: raise the main switch to power the site (once per session)
    ------------------------------------------------------------------ */
    const boot = $('#boot');
    const runReveal = [];
    const afterBoot = (fn) => runReveal.push(fn);
    let booted = false;
    const finishBoot = (flicker) => {
        if (booted) return;
        booted = true;
        session.set('ns_powered', '1');
        boot.classList.add('is-done');
        document.body.classList.remove('is-booting');
        if (flicker && !reduceMotion) {
            document.body.classList.add('power-flicker');
            setTimeout(() => document.body.classList.remove('power-flicker'), 1000);
        }
        setTimeout(() => { boot.hidden = true; }, 700);
        runReveal.forEach((fn) => fn());
    };

    if (session.get('ns_powered') || reduceMotion) {
        booted = true;
    } else {
        boot.hidden = false;
        document.body.classList.add('is-booting');
        const lever = $('.boot-lever', boot);
        const status = $('[data-boot-status]', boot);
        let powering = false;
        let drag = null;
        const powerOn = () => {
            if (powering) return;
            powering = true;
            lever.style.removeProperty('--lift');
            boot.classList.add('is-on');
            status.textContent = 'Tensione presente';
            Sound.playOnce('clack');
            $$('.boot-log span', boot).forEach((el, i) => setTimeout(() => el.classList.add('is-in'), 120 + i * 140));
            setTimeout(() => finishBoot(true), 900);
        };
        lever.addEventListener('pointerdown', (e) => {
            drag = { y: e.clientY, moved: false };
            lever.setPointerCapture(e.pointerId);
            lever.classList.add('is-dragging');
        });
        lever.addEventListener('pointermove', (e) => {
            if (!drag || powering) return;
            const lift = clamp(e.clientY - drag.y, -46, 0);
            if (Math.abs(lift) > 4) drag.moved = true;
            lever.style.setProperty('--lift', `${lift}px`);
            if (lift <= -40) powerOn();
        });
        const endDrag = () => {
            if (!drag) return;
            lever.classList.remove('is-dragging');
            if (!powering) lever.style.setProperty('--lift', '0px');
            setTimeout(() => { drag = null; }, 0);
        };
        lever.addEventListener('pointerup', endDrag);
        lever.addEventListener('pointercancel', endDrag);
        // A plain click/tap or Enter/Space also flips it
        lever.addEventListener('click', () => { if (!drag || !drag.moved) powerOn(); });
        $('.boot-skip', boot).addEventListener('click', () => finishBoot(false));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !booted) finishBoot(false); });
        lever.focus({ preventScroll: true });
    }

    /* ------------------------------------------------------------------
       Navigation
    ------------------------------------------------------------------ */
    const nav = $('#nav');
    const navToggle = $('.nav-toggle');
    const navLinks = $('#nav-links');
    navToggle.addEventListener('click', () => {
        const open = navToggle.getAttribute('aria-expanded') !== 'true';
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
        navLinks.classList.toggle('is-open', open);
    });
    $$('a', navLinks).forEach((a) => a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
    }));
    if ('IntersectionObserver' in window) {
        const linkFor = new Map($$('a', navLinks).map((a) => [a.getAttribute('href').slice(1), a]));
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                const link = linkFor.get(en.target.id);
                if (link && en.isIntersecting) {
                    $$('a', navLinks).forEach((a) => a.classList.toggle('is-active', a === link));
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        linkFor.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    }

    /* ------------------------------------------------------------------
       Reveal, decode headings, counters
    ------------------------------------------------------------------ */
    const GLYPHS = '01#%&$<>/\\=+*ΩµVAkW';
    const decode = (el) => {
        if (reduceMotion || el.dataset.decoded) return;
        el.dataset.decoded = '1';
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.nodeValue });
        const total = nodes.reduce((n, x) => n + x.text.length, 0);
        const dur = clamp(total * 28, 500, 1300);
        const start = performance.now();
        const frame = (now) => {
            const p = clamp((now - start) / dur, 0, 1);
            let idx = 0;
            nodes.forEach(({ node, text }) => {
                let out = '';
                for (let i = 0; i < text.length; i++, idx++) {
                    const ch = text[i];
                    out += (ch === ' ' || idx / total < p) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
                }
                node.nodeValue = out;
            });
            if (p < 1) requestAnimationFrame(frame);
            else nodes.forEach(({ node, text }) => { node.nodeValue = text; });
        };
        requestAnimationFrame(frame);
    };

    const countUp = (el) => {
        const to = Number(el.dataset.count);
        const from = Number(el.dataset.from || 0);
        if (reduceMotion) { el.textContent = to; return; }
        const start = performance.now();
        const frame = (now) => {
            const p = clamp((now - start) / 1400, 0, 1);
            el.textContent = Math.round(lerp(from, to, 1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    };

    const startReveal = () => {
        if (!('IntersectionObserver' in window)) {
            $$('.reveal').forEach((el) => el.classList.add('is-in'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (!en.isIntersecting) return;
                const el = en.target;
                el.classList.add('is-in');
                if (el.matches('[data-decode]')) decode(el);
                $$('[data-decode]', el).forEach(decode);
                $$('[data-count]', el).forEach(countUp);
                if (el.matches('[data-count]')) countUp(el);
                io.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        $$('.reveal').forEach((el) => io.observe(el));
    };
    if (booted) startReveal(); else afterBoot(startReveal);

    /* ------------------------------------------------------------------
       Magnetic buttons
    ------------------------------------------------------------------ */
    if (canHover && !reduceMotion) {
        $$('.magnetic').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.25;
                const y = (e.clientY - r.top - r.height / 2) * 0.3;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    /* ------------------------------------------------------------------
       Cursor sparks: small electric arcs when the pointer moves fast
    ------------------------------------------------------------------ */
    const Sparks = (() => {
        const canvas = $('#sparks');
        if (!canHover || reduceMotion) { canvas.remove(); return { draw() {} }; }
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let w = 0, h = 0;
        const bolts = [];
        let last = null;
        onMeasure(() => {
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        const jag = (x1, y1, x2, y2, rough) => {
            let pts = [[x1, y1], [x2, y2]];
            for (let k = 0; k < 4; k++) {
                const next = [pts[0]];
                for (let i = 0; i < pts.length - 1; i++) {
                    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
                    const len = Math.hypot(bx - ax, by - ay);
                    const nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
                    const off = (Math.random() - 0.5) * len * rough;
                    next.push([(ax + bx) / 2 + nx * off, (ay + by) / 2 + ny * off], pts[i + 1]);
                }
                pts = next;
            }
            return pts;
        };
        const add = (x1, y1, x2, y2, life = 1, rough = 0.6) => bolts.push({ pts: jag(x1, y1, x2, y2, rough), life });
        window.addEventListener('pointermove', (e) => {
            if (last) {
                const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
                if (d > 26 && bolts.length < 14) add(last.x, last.y, e.clientX, e.clientY, 0.8);
            }
            last = { x: e.clientX, y: e.clientY };
        }, { passive: true });
        window.addEventListener('pointerdown', (e) => {
            if (e.target.closest('input, textarea, select')) return;
            for (let i = 0; i < 5; i++) {
                const a = Math.random() * Math.PI * 2, r = 26 + Math.random() * 34;
                add(e.clientX, e.clientY, e.clientX + Math.cos(a) * r, e.clientY + Math.sin(a) * r, 1, 0.9);
            }
        });
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            for (let i = bolts.length - 1; i >= 0; i--) {
                const b = bolts[i];
                b.life -= 0.07;
                if (b.life <= 0) { bolts.splice(i, 1); continue; }
                ctx.beginPath();
                b.pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
                ctx.strokeStyle = `rgba(140, 210, 255, ${b.life * 0.35})`;
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.strokeStyle = `rgba(255, 255, 255, ${b.life})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
        };
        return { draw };
    })();

    /* ------------------------------------------------------------------
       Hero: procedural circuit board with current pulses, lit by the pointer
    ------------------------------------------------------------------ */
    const Circuit = (() => {
        const canvas = $('#hero-circuit');
        const hero = $('.hero');
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const base = document.createElement('canvas');
        const lit = document.createElement('canvas');
        let w = 0, h = 0, traces = [], pulses = [], visible = true, heroTop = 0;
        const G = 30;
        const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

        const build = () => {
            const r = hero.getBoundingClientRect();
            heroTop = r.top + window.scrollY;
            w = Math.round(r.width); h = Math.round(r.height);
            [canvas, base, lit].forEach((c) => { c.width = w * dpr; c.height = h * dpr; });
            const cols = Math.ceil(w / G), rows = Math.ceil(h / G);
            const count = Math.round((cols * rows) / 7);
            traces = [];
            for (let n = 0; n < count; n++) {
                let x = (Math.random() * cols) | 0, y = (Math.random() * rows) | 0;
                let d = (Math.random() * 8) | 0;
                const pts = [[x * G, y * G]];
                const steps = 3 + ((Math.random() * 5) | 0);
                for (let s = 0; s < steps; s++) {
                    // PCB style: mostly straight, occasional 45° turns
                    if (Math.random() < 0.5) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
                    const len = 1 + ((Math.random() * 4) | 0);
                    x += DIRS[d][0] * len; y += DIRS[d][1] * len;
                    pts.push([x * G, y * G]);
                }
                const cum = [0];
                for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
                traces.push({ pts, cum, len: cum[cum.length - 1] });
            }
            const paint = (c, stroke, pad, width) => {
                const g = c.getContext('2d');
                g.setTransform(dpr, 0, 0, dpr, 0, 0);
                g.clearRect(0, 0, w, h);
                g.lineWidth = width; g.lineJoin = 'round'; g.strokeStyle = stroke; g.fillStyle = pad;
                traces.forEach((t) => {
                    g.beginPath();
                    t.pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
                    g.stroke();
                    [t.pts[0], t.pts[t.pts.length - 1]].forEach(([px, py]) => {
                        g.beginPath(); g.arc(px, py, 3.2, 0, Math.PI * 2); g.fill();
                    });
                });
            };
            paint(base, 'rgba(90, 110, 255, .16)', 'rgba(90, 110, 255, .3)', 1.4);
            paint(lit, 'rgba(255, 196, 90, .9)', 'rgba(255, 220, 140, 1)', 1.8);
            pulses = Array.from({ length: Math.round(traces.length * 0.35) }, () => ({
                t: traces[(Math.random() * traces.length) | 0], s: Math.random(), v: 0.004 + Math.random() * 0.01
            }));
        };
        onMeasure(build);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
        }

        const pointAt = (t, dist) => {
            let i = 1;
            while (i < t.cum.length - 1 && t.cum[i] < dist) i++;
            const seg = t.cum[i] - t.cum[i - 1] || 1;
            const k = clamp((dist - t.cum[i - 1]) / seg, 0, 1);
            const [ax, ay] = t.pts[i - 1], [bx, by] = t.pts[i];
            return [lerp(ax, bx, k), lerp(ay, by, k)];
        };

        const draw = () => {
            if (!visible || document.hidden) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(base, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // pointer "torch" reveals the energised traces
            const px = state.mx, py = state.my + state.scrollY - heroTop;
            if (px > -100 && py > -100 && py < h + 100) {
                ctx.save();
                ctx.beginPath(); ctx.arc(px, py, 170, 0, Math.PI * 2); ctx.clip();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = 0.85;
                ctx.drawImage(lit, 0, 0);
                ctx.restore();
                const g = ctx.createRadialGradient(px, py, 0, px, py, 180);
                g.addColorStop(0, 'rgba(255, 179, 32, .14)');
                g.addColorStop(1, 'rgba(255, 179, 32, 0)');
                ctx.fillStyle = g;
                ctx.fillRect(px - 180, py - 180, 360, 360);
            }

            // current pulses travelling the traces
            ctx.lineCap = 'round';
            pulses.forEach((p) => {
                if (!reduceMotion) p.s += p.v;
                if (p.s > 1.15) { p.t = traces[(Math.random() * traces.length) | 0]; p.s = 0; }
                const head = clamp(p.s, 0, 1) * p.t.len;
                const tail = Math.max(0, head - 60);
                const a = pointAt(p.t, tail), b = pointAt(p.t, head);
                const grad = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
                grad.addColorStop(0, 'rgba(79, 216, 255, 0)');
                grad.addColorStop(1, 'rgba(160, 235, 255, .95)');
                ctx.strokeStyle = grad; ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(a[0], a[1]);
                for (let i = 1; i < p.t.pts.length; i++) {
                    if (p.t.cum[i] > tail && p.t.cum[i] < head) ctx.lineTo(p.t.pts[i][0], p.t.pts[i][1]);
                }
                ctx.lineTo(b[0], b[1]);
                ctx.stroke();
                if (p.s < 1) {
                    ctx.fillStyle = 'rgba(200, 245, 255, .9)';
                    ctx.beginPath(); ctx.arc(b[0], b[1], 2.2, 0, Math.PI * 2); ctx.fill();
                }
            });
        };
        return { draw };
    })();

    /* ------------------------------------------------------------------
       Live meter (voltage/frequency jitter, kW from the smart home)
    ------------------------------------------------------------------ */
    const liveEls = {
        volt: $$('[data-live="volt"]'), voltN: $('[data-live="volt-n"]'),
        hz: $$('[data-live="hz"]'), hzN: $('[data-live="hz-n"]'), kw: $('[data-live="kw"]')
    };
    let meterT = 0, shownKw = state.load;
    const updateMeter = (now) => {
        if (now - meterT < 220) return;
        meterT = now;
        const v = (230 + Math.sin(now / 1700) * 0.9 + (Math.random() - 0.5) * 0.6 - state.load * 0.4).toFixed(1);
        const f = (50 + Math.sin(now / 2300) * 0.015 + (Math.random() - 0.5) * 0.01).toFixed(2);
        shownKw = lerp(shownKw, state.load, 0.5);
        liveEls.volt.forEach((el) => { el.textContent = `${v} V`; });
        liveEls.hz.forEach((el) => { el.textContent = `${f} Hz`; });
        liveEls.voltN.textContent = v;
        liveEls.hzN.textContent = f;
        liveEls.kw.textContent = shownKw.toFixed(2);
    };

    /* ------------------------------------------------------------------
       Scroll wiring: the flat gets wired from the panel as you scroll
    ------------------------------------------------------------------ */
    const Wiring = (() => {
        const section = $('#cablaggio');
        const svgNS = 'http://www.w3.org/2000/svg';
        const cablesG = $('[data-cables]', section);
        const pointsG = $('[data-points]', section);
        const rooms = $$('[data-room-fill]', section);
        const walls = $$('.plan-walls path', section);
        const captions = $$('.wiring-captions p', section);
        const bar = $('.wiring-bar span', section);
        const out = { pct: $('[data-wire="pct"]'), m: $('[data-wire="m"]'), pts: $('[data-wire="pts"]'), tot: $('[data-wire="tot"]') };
        const stamp = $('.plan-stamp', section);
        const Q = [334, 352];
        // room index: 0 soggiorno, 1 cucina, 2 camera, 3 bagno, 4 studio
        const POINTS = [
            { x: 180, y: 130, room: 0, kind: 'light' }, { x: 62, y: 190, room: 0, kind: 'socket' }, { x: 298, y: 96, room: 0, kind: 'data' },
            { x: 440, y: 118, room: 1, kind: 'light' }, { x: 538, y: 70, room: 1, kind: 'socket' }, { x: 400, y: 176, room: 1, kind: 'socket' },
            { x: 150, y: 296, room: 2, kind: 'light' }, { x: 62, y: 344, room: 2, kind: 'socket' }, { x: 236, y: 250, room: 2, kind: 'socket' },
            { x: 325, y: 296, room: 3, kind: 'light' },
            { x: 475, y: 286, room: 4, kind: 'light' }, { x: 538, y: 344, room: 4, kind: 'socket' }, { x: 420, y: 346, room: 4, kind: 'data' }
        ];
        const SCALE = 0.085; // svg units -> metres of cable, for the readout
        const cables = POINTS.map((p) => {
            const d = p.y < 215
                ? `M${Q[0]} ${Q[1]}V210H${p.x}V${p.y}`
                : `M${Q[0]} ${Q[1]}V${p.y}H${p.x}`;
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', d);
            if (p.kind === 'data') path.style.stroke = 'var(--cyan)';
            cablesG.appendChild(path);
            const g = document.createElementNS(svgNS, 'g');
            if (p.kind === 'light') {
                g.innerHTML = `<circle class="halo" cx="${p.x}" cy="${p.y}" r="34"/><circle cx="${p.x}" cy="${p.y}" r="7"/>`;
            } else {
                g.innerHTML = `<rect x="${p.x - 6}" y="${p.y - 5}" width="12" height="10" rx="2"/>`;
            }
            pointsG.appendChild(g);
            return { path, g, p, len: 0, on: false };
        });
        const wallLens = [];
        onMeasure(() => {
            cables.forEach((c) => {
                c.len = c.path.getTotalLength();
                c.path.style.strokeDasharray = c.len;
            });
            walls.forEach((wp, i) => { wallLens[i] = wp.getTotalLength(); wp.style.strokeDasharray = wallLens[i]; });
        });
        const totalLen = () => cables.reduce((n, c) => n + c.len, 0);
        out.tot.textContent = POINTS.length;

        let top = 0, height = 1, smooth = 0, lastCaption = -1;
        onMeasure(() => {
            const r = section.getBoundingClientRect();
            top = r.top + window.scrollY;
            height = Math.max(1, section.offsetHeight - state.vh);
        });

        const render = (p) => {
            // walls 0 → .16
            const pw = clamp(p / 0.16, 0, 1);
            walls.forEach((wp, i) => { wp.style.strokeDashoffset = wallLens[i] * (1 - pw); });
            // cables .16 → .66 one after another (overlapping)
            const n = cables.length;
            let laid = 0;
            cables.forEach((c, i) => {
                const s = 0.16 + (i / n) * 0.42;
                const t = clamp((p - s) / 0.12, 0, 1);
                c.path.style.strokeDashoffset = c.len * (1 - t);
                laid += c.len * t;
            });
            // points + rooms .64 → .9
            let lit = 0;
            cables.forEach((c, i) => {
                const on = p >= 0.64 + (i / n) * 0.24;
                if (on !== c.on) {
                    c.on = on;
                    c.g.classList.toggle('is-on', on);
                    if (on) Sound.play('tick');
                }
                if (on) lit++;
            });
            rooms.forEach((r, ri) => r.classList.toggle('is-lit', cables.some((c) => c.on && c.p.room === ri)));
            stamp.classList.toggle('is-in', p >= 0.92);

            bar.style.transform = `scaleX(${p})`;
            out.pct.textContent = Math.round(clamp(laid / (totalLen() || 1), 0, 1) * 100);
            out.m.textContent = Math.round(laid * SCALE);
            out.pts.textContent = lit;

            let active = 0;
            captions.forEach((cap, i) => { if (p >= Number(cap.dataset.at)) active = i; });
            if (active !== lastCaption) {
                captions.forEach((cap, i) => cap.classList.toggle('is-active', i === active));
                lastCaption = active;
            }
        };

        const update = () => {
            const target = clamp((state.scrollY - top) / height, 0, 1);
            const prev = smooth;
            smooth = reduceMotion ? target : lerp(smooth, target, 0.14);
            if (Math.abs(smooth - target) < 0.0005) smooth = target;
            if (prev !== smooth || lastCaption < 0) render(smooth);
        };
        return { update };
    })();

    /* ------------------------------------------------------------------
       Services: the electrical panel
    ------------------------------------------------------------------ */
    const SERVICES = {
        elettrici: {
            icon: 'fa-plug', tag: 'Linea 1 · Civile e terziario', title: 'Impianti elettrici',
            text: 'Realizziamo impianti elettrici per il settore civile, terziario e industriale, curando ogni dettaglio per un risultato a regola d\'arte: dalla piccola unità abitativa ai condomini, fino a un nuovo stabilimento seguito dall\'inizio alla fine.',
            list: ['Impianti civili e condominiali', 'Impianti industriali', 'Illuminazione interna ed esterna', 'Automazione cancelli'],
            prefill: 'Impianti Elettrici'
        },
        clima: {
            icon: 'fa-temperature-half', tag: 'Linea 2 · Comfort', title: 'Impianti di climatizzazione',
            text: 'Ogni ambiente ha esigenze diverse. Ti aiutiamo a scegliere la soluzione giusta per il comfort tutto l\'anno: climatizzazione, ricambio d\'aria controllato e impianti di riscaldamento.',
            list: ['Climatizzazione', 'VMC (ricambio d\'aria)', 'Impianti di riscaldamento'],
            prefill: 'Impianti di Climatizzazione', extra: ['#domotica', 'Prova il clima']
        },
        energia: {
            icon: 'fa-solar-panel', tag: 'Linea 3 · Energia', title: 'Impianti fotovoltaici',
            text: 'Produci la tua energia e consumala quando ti serve. Installiamo impianti fotovoltaici e sistemi di accumulo per abbattere i costi in bolletta e aumentare l\'autonomia energetica.',
            list: ['Installazione impianti fotovoltaici', 'Impianti di accumulo per fotovoltaico'],
            prefill: 'Impianti Fotovoltaici', extra: ['#consulenza', 'Come lavoriamo']
        },
        domotica: {
            icon: 'fa-house-signal', tag: 'Linea 4 · Smart home', title: 'Impianti di domotica',
            text: 'Più comfort, sicurezza ed efficienza, con un occhio al risparmio energetico. Progettiamo impianti domotici su misura per ogni esigenza, da gestire comodamente anche dallo smartphone.',
            list: ['Gestione domotica di luci e tapparelle', 'Controllo dei carichi', 'Gestione di tutto l\'impianto da smartphone', 'Creazione di scenari per semplificare la vita quotidiana'],
            prefill: 'Impianti di Domotica', extra: ['#domotica', 'Provala ora']
        },
        sicurezza: {
            icon: 'fa-shield-halved', tag: 'Linea 5 · Protezione', title: 'Sorveglianza e antifurto',
            text: 'Impianti di sicurezza attiva e passiva ad alta tecnologia per il settore civile, industriale e commerciale: soluzioni personalizzate per prevenire e inibire ogni tentativo di effrazione.',
            list: ['Impianti antintrusione', 'Impianti antincendio', 'Impianti di videosorveglianza (TVCC)'],
            prefill: 'Impianti di Sorveglianza e Antifurti', extra: ['#domotica', 'Prova l\'allarme']
        },
        reti: {
            icon: 'fa-satellite-dish', tag: 'Linea 6 · Connettività', title: 'Reti dati e impianti TV',
            text: 'Connessione veloce e segnale TV stabile in ogni stanza. Realizziamo reti dati in rame e fibra ottica e impianti d\'antenna per il digitale terrestre e il satellitare, per case, condomini e aziende.',
            list: ['Reti LAN e cablaggio strutturato', 'Reti in fibra ottica', 'Antenne per il digitale terrestre', 'Parabole e impianti satellitari'],
            prefill: 'Reti Dati e Impianti TV'
        }
    };
    const Panel = (() => {
        const main = $('[data-main]');
        const breakers = $$('[data-service]');
        const led = $('[data-panel-led]');
        const screen = $('[data-display]');
        let mainOn = false, current = null;

        const idle = (title, sub, icon = 'fa-power-off') => {
            screen.innerHTML = `<div class="display-idle"><i class="fas ${icon}"></i><p>${title}</p><small>${sub}</small></div>`;
        };
        const show = (key) => {
            const s = SERVICES[key];
            const extra = s.extra ? `<a href="${s.extra[0]}" class="btn btn-ghost">${s.extra[1]}</a>` : '';
            screen.innerHTML = `
                <div class="svc">
                    <div class="svc-head"><span class="svc-icon"><i class="fas ${s.icon}"></i></span><div><small>${s.tag}</small><h3>${s.title}</h3></div></div>
                    <p>${s.text}</p>
                    <ul>${s.list.map((l) => `<li>${l}</li>`).join('')}</ul>
                    <div class="svc-actions"><a href="#contatti" class="btn btn-primary" data-prefill="${s.prefill}">Richiedi un preventivo</a>${extra}</div>
                </div>`;
        };
        const render = () => {
            main.setAttribute('aria-pressed', String(mainOn));
            led.classList.toggle('is-on', mainOn);
            breakers.forEach((b) => b.setAttribute('aria-pressed', String(mainOn && b.dataset.service === current)));
            if (!mainOn) idle('Linea spenta', 'Alza una levetta del quadro');
            else if (!current) idle('Tensione presente', 'Scegli un servizio dal quadro', 'fa-bolt');
            else show(current);
        };
        main.addEventListener('click', () => {
            mainOn = !mainOn;
            if (!mainOn) current = null;
            Sound.play('clack');
            render();
        });
        const select = (key, sound = true) => {
            if (mainOn && current === key) current = null;
            else { mainOn = true; current = key; }
            if (sound) { Sound.play('clack'); if (current) Sound.play('zap'); }
            render();
            // stacked layout: the display sits under the panel, bring it into view
            if (current && window.innerWidth <= 1020) {
                setTimeout(() => screen.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }), 250);
            }
        };
        breakers.forEach((b) => b.addEventListener('click', () => select(b.dataset.service)));
        $$('[data-open-service]').forEach((a) => a.addEventListener('click', () => {
            mainOn = true; current = a.dataset.openService; render();
        }));
        render();
    })();

    // Any "request" button can preselect the service in the contact form
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-prefill]');
        if (!btn) return;
        const sel = $('[data-contact] select[name="servizio"]');
        if (sel) sel.value = btn.dataset.prefill;
    });

    /* ------------------------------------------------------------------
       Smart home simulator
    ------------------------------------------------------------------ */
    const Home = (() => {
        const stage = $('[data-home]');
        const ROOMS = ['soggiorno', 'cucina', 'camera', 'bagno', 'garage'];
        const LABEL = { soggiorno: 'Soggiorno', cucina: 'Cucina', camera: 'Camera', bagno: 'Bagno', garage: 'Garage' };
        // reference house: 6 kW meter, 8 kWp PV, 10 kWh battery
        const METER_KW = 6, PV_PEAK = 8 * 0.8, BATT_KWH = 10;
        const MODE_LABEL = { off: 'Spento', heat: 'Riscalda', cool: 'Raffresca' };
        const s = { lights: Object.fromEntries(ROOMS.map((r) => [r, false])), mode: 'off', lastMode: 'heat', temp: 22, hour: 12, alarm: 'off' };
        const roomEls = Object.fromEntries($$('[data-room]', stage).map((el) => [el.dataset.room, el]));
        const switchesBox = $('[data-light-switches]');
        const tip = $('[data-home-tip]');
        const modeBtns = $$('[data-clima-mode]');
        const tempIn = $('[data-temp]');
        const hourIn = $('[data-hour]');
        const alarmBtn = $('[data-alarm]');
        const intrudeBtn = $('[data-intrude]');
        const sun = $('[data-sun]');
        const moon = $('[data-moon]');
        const solar = $('[data-solar]');
        const skyTop = $('[data-sky-top]');
        const skyBottom = $('[data-sky-bottom]');
        const starsG = $('[data-stars]');
        const cctvHead = $('[data-cctv-head]');
        const energy = $('.energy');
        const eOut = {
            load: $('[data-e="load"]'), prod: $('[data-e="prod"]'), grid: $('[data-e="grid"]'),
            gridLabel: $('[data-e="grid-label"]'), bar: $('[data-e="bar"]'),
            batt: $('[data-e="batt"]'), battLabel: $('[data-e="batt-label"]'),
            meter: $('[data-e="meter"]'), meterLabel: $('[data-e="meter-label"]')
        };
        const out = { temp: $('[data-temp-out]'), hour: $('[data-hour-out]'), alarm: $('[data-alarm-out]') };
        const scenes = $$('[data-scene]');

        // stars
        const svgNS = 'http://www.w3.org/2000/svg';
        for (let i = 0; i < 46; i++) {
            const c = document.createElementNS(svgNS, 'circle');
            c.setAttribute('cx', (Math.random() * 800).toFixed(1));
            c.setAttribute('cy', (Math.random() * 240).toFixed(1));
            c.setAttribute('r', (Math.random() * 1.3 + 0.3).toFixed(2));
            starsG.appendChild(c);
        }

        const switches = ROOMS.map((r) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'light-switch';
            b.textContent = LABEL[r];
            b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', () => { toggleLight(r); });
            switchesBox.appendChild(b);
            return [r, b];
        });
        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'light-switch';
        allBtn.textContent = 'Tutte';
        allBtn.addEventListener('click', () => {
            const anyOff = ROOMS.some((r) => !s.lights[r]);
            ROOMS.forEach((r) => { s.lights[r] = anyOff; });
            interacted(); Sound.play('click'); render();
        });
        switchesBox.appendChild(allBtn);

        const interacted = (keepScene) => {
            tip.classList.add('is-hidden');
            if (!keepScene) scenes.forEach((b) => b.classList.remove('is-active'));
        };
        const toggleLight = (r) => {
            s.lights[r] = !s.lights[r];
            interacted(); Sound.play('click'); render();
        };
        Object.entries(roomEls).forEach(([r, el]) => {
            el.addEventListener('click', () => toggleLight(r));
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLight(r); }
            });
        });
        const setMode = (m) => { s.mode = m; if (m !== 'off') s.lastMode = m; };
        modeBtns.forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.climaMode); interacted(); Sound.play('click'); render(); }));
        tempIn.addEventListener('input', () => { s.temp = Number(tempIn.value); if (s.mode === 'off') setMode(s.lastMode); interacted(); render(); });
        hourIn.addEventListener('input', () => { s.hour = Number(hourIn.value); interacted(true); render(); });
        alarmBtn.addEventListener('click', () => {
            s.alarm = s.alarm === 'off' ? 'armed' : 'off';
            interacted(); Sound.play(s.alarm === 'armed' ? 'zap' : 'click'); render();
        });
        let alarmTimer = 0;
        intrudeBtn.addEventListener('click', () => {
            if (s.alarm !== 'armed') return;
            s.alarm = 'triggered';
            ROOMS.forEach((r) => { s.lights[r] = true; });
            tip.textContent = 'Intrusione rilevata! Luci accese e notifica inviata allo smartphone';
            tip.classList.remove('is-hidden');
            Sound.play('siren', 3);
            render();
            clearTimeout(alarmTimer);
            alarmTimer = setTimeout(() => {
                s.alarm = 'armed';
                tip.classList.add('is-hidden');
                render();
            }, 3200);
        });
        const SCENES = {
            rientro: () => { ROOMS.forEach((r) => { s.lights[r] = r === 'soggiorno' || r === 'cucina'; }); setMode(s.lastMode); s.alarm = 'off'; },
            esco: () => { ROOMS.forEach((r) => { s.lights[r] = false; }); setMode('off'); s.alarm = 'armed'; },
            notte: () => { ROOMS.forEach((r) => { s.lights[r] = false; }); setMode('off'); s.alarm = 'armed'; s.hour = 23; hourIn.value = 23; }
        };
        scenes.forEach((b) => b.addEventListener('click', () => {
            SCENES[b.dataset.scene]();
            interacted();
            b.classList.add('is-active');
            Sound.play('zap');
            render();
        }));

        const mix = (a, b, t) => {
            const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
            const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
            return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], t)).toString(16).padStart(2, '0')).join('');
        };
        const fmtHour = (h) => {
            const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60);
            return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        };

        const pvAt = (h) => (h >= 6 && h <= 20 ? Math.sin(Math.PI * (h - 6) / 14) : 0) * PV_PEAK;
        // typical family day: 2 kW in the evening (cooking, appliances, clima), 0.5 kW otherwise
        const typicalAt = (h) => (h >= 18 && h < 23 ? 2 : 0.5);
        // battery charge at hour h, replaying a typical day from midnight:
        // it runs empty before dawn, the house draws a little from the grid, then the sun recharges it
        const socAt = (h) => {
            let soc = 0.2;
            for (let t = 0; t < h; t += 0.25) {
                soc = clamp(soc + (pvAt(t) - typicalAt(t)) * 0.25 / BATT_KWH, 0, 1);
            }
            return soc;
        };

        const render = () => {
            ROOMS.forEach((r) => roomEls[r].classList.toggle('is-on', s.lights[r]));
            switches.forEach(([r, b]) => b.setAttribute('aria-pressed', String(s.lights[r])));
            allBtn.setAttribute('aria-pressed', String(ROOMS.every((r) => s.lights[r])));

            modeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.climaMode === s.mode)));
            tempIn.value = s.temp;
            out.temp.textContent = s.mode === 'off' ? MODE_LABEL.off : `${MODE_LABEL[s.mode]} · ${s.temp} °C`;
            stage.classList.toggle('is-clima', s.mode !== 'off');
            stage.classList.toggle('is-cool', s.mode === 'cool');
            stage.classList.toggle('is-heat', s.mode === 'heat');

            // sun, sky, solar production
            const h = s.hour;
            const elev = h >= 6 && h <= 20 ? Math.sin(Math.PI * (h - 6) / 14) : -0.3;
            const day = clamp(elev * 1.8, 0, 1);
            const dusk = h >= 5 && h <= 21 ? clamp(1 - Math.abs(elev) * 3.2, 0, 1) : 0;
            skyTop.setAttribute('stop-color', mix('070b24', '2f6fd8', day));
            skyBottom.setAttribute('stop-color', mix(mix('141a45', '9cc8ff', day), 'ff7a45', dusk * 0.75));
            starsG.style.opacity = String(1 - day);
            const sx = 60 + ((h - 6) / 14) * 680, sy = 300 - Math.max(elev, -0.3) * 250;
            sun.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
            sun.style.opacity = elev > -0.05 ? '1' : '0';
            const mh = (h + 12) % 24;
            const melev = mh >= 6 && mh <= 20 ? Math.sin(Math.PI * (mh - 6) / 14) : -0.3;
            moon.setAttribute('transform', `translate(${(60 + ((mh - 6) / 14) * 680).toFixed(1)} ${(300 - melev * 230).toFixed(1)})`);
            moon.style.opacity = melev > 0 && day < 0.5 ? '1' : '0';
            const prod = pvAt(h);
            solar.classList.toggle('is-producing', prod > 0.2);
            out.hour.textContent = fmtHour(h);

            // alarm
            stage.classList.toggle('is-armed', s.alarm !== 'off');
            stage.classList.toggle('is-triggered', s.alarm === 'triggered');
            alarmBtn.setAttribute('aria-pressed', String(s.alarm !== 'off'));
            intrudeBtn.disabled = s.alarm !== 'armed';
            out.alarm.textContent = s.alarm === 'off' ? 'Disinserito' : s.alarm === 'armed' ? 'Inserito' : 'ALLARME';

            // energy balance: fridge + stand-by, LED lights, heat pump, alarm
            const lightsOn = ROOMS.filter((r) => s.lights[r]).length;
            const hvac = s.mode === 'heat' ? 0.6 + (s.temp - 16) * 0.12 : s.mode === 'cool' ? 0.6 + (30 - s.temp) * 0.12 : 0;
            const load = 0.3 + lightsOn * 0.05 + hvac + (s.alarm !== 'off' ? 0.02 : 0);
            const soc = socAt(h);
            const net = prod - load;
            // the battery charges only on surplus and takes all of it: the grid gets energy only once it is full
            const battFlow = net > 0
                ? (soc < 1 ? net : 0)
                : (soc > 0 ? net : 0);
            const grid = battFlow - net;
            eOut.load.textContent = load.toFixed(2);
            eOut.prod.textContent = prod.toFixed(2);
            eOut.batt.textContent = Math.round(soc * 100);
            eOut.battLabel.textContent = battFlow > 0.01 ? 'Batteria in carica' : battFlow < -0.01 ? 'Batteria in uso' : 'Batteria';
            eOut.grid.textContent = Math.abs(grid).toFixed(2);
            eOut.gridLabel.textContent = grid >= 0 ? 'Dalla rete' : 'In rete';
            eOut.meterLabel.textContent = grid >= 0 ? 'Prelievo dal contatore' : 'Immissione in rete';
            eOut.meter.textContent = grid >= 0 ? `${grid.toFixed(1)} / ${METER_KW} kW` : `${(-grid).toFixed(1)} kW`;
            energy.classList.toggle('is-export', grid < 0);
            eOut.bar.style.width = `${clamp(grid >= 0 ? (grid / METER_KW) * 100 : (-grid / PV_PEAK) * 100, 2, 100)}%`;
            state.load = grid;
            Sound.setLoad(Math.max(0, grid));
        };

        // CCTV sweep, only while armed and on screen
        let visible = false;
        if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(stage);
        const tick = (now) => {
            if (!visible || s.alarm === 'off' || reduceMotion) return;
            cctvHead.setAttribute('transform', `rotate(${(Math.sin(now / 900) * 12 - 4).toFixed(2)})`);
        };
        render();
        return { tick };
    })();

    /* ------------------------------------------------------------------
       Process steps: the line charges up while scrolling
    ------------------------------------------------------------------ */
    const Steps = (() => {
        const list = $('[data-steps]');
        const items = $$('.step', list);
        let lastP = -1;
        const update = () => {
            const r = list.getBoundingClientRect();
            if (r.bottom < 0 || r.top > state.vh) return;
            const p = clamp((state.vh * 0.7 - r.top) / (r.height || 1), 0, 1);
            if (Math.abs(p - lastP) < 0.002) return;
            lastP = p;
            list.style.setProperty('--fill', `${(p * 100).toFixed(1)}%`);
            items.forEach((el, i) => el.classList.toggle('is-lit', p >= i / (items.length - 1) - 0.02));
        };
        return { update };
    })();

    /* ------------------------------------------------------------------
       Contact form: no backend, composes an email in the user's mail app
    ------------------------------------------------------------------ */
    (() => {
        const form = $('[data-contact]');
        const status = $('[data-form-status]');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let ok = true;
            $$('[required]', form).forEach((f) => {
                const valid = f.type === 'checkbox' ? f.checked : f.checkValidity() && f.value.trim() !== '';
                (f.type === 'checkbox' ? f.closest('label') : f).classList.toggle('is-invalid', !valid);
                if (!valid) ok = false;
            });
            if (!ok) {
                status.textContent = 'Controlla i campi evidenziati.';
                status.className = 'form-status is-error';
                return;
            }
            const d = Object.fromEntries(new FormData(form));
            const subject = `Richiesta informazioni - ${d.servizio}`;
            const body = [
                `Nome: ${d.nome}`, `Email: ${d.email}`, `Telefono: ${d.telefono || '-'}`, `Servizio: ${d.servizio}`, '', d.messaggio
            ].join('\n');
            window.location.href = `mailto:newsysimpianti@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            status.textContent = 'Si sta aprendo il tuo programma di posta con la richiesta già compilata.';
            status.className = 'form-status is-ok';
            Sound.play('zap');
        });
        form.addEventListener('input', (e) => e.target.classList.remove('is-invalid'));
        form.addEventListener('change', (e) => { if (e.target.type === 'checkbox') e.target.closest('label').classList.remove('is-invalid'); });
    })();

    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

    /* ------------------------------------------------------------------
       Main loop
    ------------------------------------------------------------------ */
    const loop = (now) => {
        nav.classList.toggle('is-scrolled', state.scrollY > 30);
        Circuit.draw();
        Sparks.draw();
        Wiring.update();
        Steps.update();
        Home.tick(now);
        updateMeter(now);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
})();
