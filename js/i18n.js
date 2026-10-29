// New Sys Impianti Elettrici - language switch (Italian / English)
// The page is written in Italian. In English every text node and label is looked up in the
// dictionary below; a MutationObserver translates what main.js writes later on, so the
// interactive parts need no changes. Switching back restores the Italian originals.
(() => {
    'use strict';

    const EN = {
        // head
        'New Sys Impianti Elettrici | Elettricisti a Revello (CN)': 'New Sys Electrical Systems | Electricians in Revello (CN)',
        'New Sys Impianti Elettrici: impianti elettrici civili e industriali, climatizzazione, efficientamento energetico, domotica, videosorveglianza e antifurto a Cuneo e provincia. Dal 2008.':
            'New Sys: residential and industrial electrical systems, air conditioning, energy efficiency, home automation, video surveillance and alarms in Cuneo and its province. Since 2008.',

        // boot
        'Impianto in standby': 'System on standby',
        'Tensione presente': 'Power on',
        'Diamo corrente al sito': 'Powering up the site',
        'Interruttore generale: accendi subito': 'Main switch: power on now',
        'Test differenziale ........': 'RCD test ..................',
        'Messa a terra .............': 'Earthing ..................',
        'Isolamento linee ..........': 'Line insulation ...........',

        // nav
        'Navigazione principale': 'Main navigation',
        'New Sys, torna all\'inizio': 'New Sys, back to top',
        'Apri il menu': 'Open menu',
        'Chiudi il menu': 'Close menu',
        'Chiudi la scheda': 'Close the card',
        'Lingua': 'Language',
        'Servizi': 'Services',
        'Casa smart': 'Smart home',
        'Chi siamo': 'About us',
        'Contatti': 'Contact',

        // hero
        'LINEA ATTIVA': 'LIVE LINE',
        'DAL 2008': 'SINCE 2008',
        'Forniamo installazioni, aggiornamenti e manutenzione': 'Installation, upgrades and maintenance',
        'Lavori a regola d\'arte,': 'Expert workmanship,',
        'affidabili nel tempo.': 'built to last.',
        'Impianti elettrici civili e industriali, climatizzazione, domotica e sicurezza a Cuneo e provincia. Prezzi concorrenziali, materiali di alta qualità e tecnologie all\'avanguardia: per noi sono una garanzia.':
            'Residential and industrial electrical systems, air conditioning, home automation and security in Cuneo and its province. Competitive prices, high-quality materials and cutting-edge technology: that is our guarantee.',
        'Scopri i servizi': 'Explore our services',
        'Richiedi informazioni': 'Get in touch',
        'Scorri per cablare': 'Scroll to wire up',

        // ticker and shared service names
        'Impianti elettrici': 'Electrical systems',
        'Climatizzazione': 'Air conditioning',
        'Fotovoltaico': 'Solar PV',
        'Domotica': 'Home automation',
        'Videosorveglianza': 'Video surveillance',
        'Antifurto': 'Alarm',
        'Reti LAN': 'LAN networks',
        'Videocitofoni': 'Video intercoms',

        // wiring
        'Come nasce un impianto: dal progetto al collaudo': 'How a system comes to life: from design to final testing',
        'Planimetria di un appartamento che viene cablata dal quadro elettrico fino a ogni stanza': 'Floor plan of an apartment being wired from the electrical panel to every room',
        'SOGGIORNO': 'LIVING ROOM',
        'CUCINA': 'KITCHEN',
        'CAMERA': 'BEDROOM',
        'BAGNO': 'BATHROOM',
        'STUDIO': 'STUDY',
        'COLLAUDO SUPERATO ✓': 'TEST PASSED ✓',
        'CABLAGGIO': 'WIRING',
        'CAVO POSATO': 'CABLE LAID',
        'PUNTI ATTIVI': 'LIVE POINTS',
        'Sopralluogo': 'Site survey',
        'Si parte dalla planimetria.': 'It all starts with the floor plan.',
        'Progetto e posa': 'Design and installation',
        'Ogni linea al suo posto, dal quadro a ogni stanza.': 'Every line in its place, from the panel to every room.',
        'Accensione': 'Power-up',
        'Luci, prese, dati: tutto in funzione.': 'Lights, sockets, data: everything up and running.',
        'Collaudo': 'Final testing',
        'Materiali certificati, lavoro a regola d\'arte.': 'Certified materials, expert workmanship.',

        // services panel
        'Il quadro dei servizi': 'Our service panel',
        'Ogni interruttore è un servizio. Alza una levetta per accendere la linea e scoprire cosa possiamo fare per te.':
            'Every breaker is a service. Flip a switch to power the line and see what we can do for you.',
        'Quadro elettrico dei servizi': 'Electrical panel of our services',
        'Generale': 'Main',
        'GENERALE OFF': 'MAIN OFF',
        'Generale OFF': 'Main OFF',
        'In tensione': 'Live',
        'Multimetro': 'Multimeter',
        'Elettrici': 'Electrical',
        'Clima ed energia': 'Climate & energy',
        'Domotica e automazione': 'Smart home & automation',
        'Sicurezza': 'Security',
        'Reti e TV': 'Networks & TV',
        'Linea spenta': 'Line off',
        'Alza una levetta del quadro': 'Flip a switch on the panel',
        'Scegli un servizio dal quadro': 'Pick a service from the panel',
        'Richiedi un preventivo': 'Request a quote',
        'Realizziamo impianti elettrici per il settore civile, terziario e industriale, curando ogni dettaglio per un risultato a regola d\'arte: dalla piccola unità abitativa ai condomini, fino a un nuovo stabilimento seguito dall\'inizio alla fine.':
            'We build electrical systems for residential, commercial and industrial buildings, taking care of every detail for a job done right: from a small apartment to whole condominiums, up to a new factory followed from start to finish.',
        'Impianti civili e condominiali': 'Residential and condominium systems',
        'Impianti industriali': 'Industrial systems',
        'Quadri industriali': 'Industrial control panels',
        'Illuminazione interna ed esterna': 'Indoor and outdoor lighting',
        'Impianti di clima ed energia': 'Climate and energy systems',
        'Comfort tutto l\'anno e bollette più leggere. Ti aiutiamo a scegliere climatizzazione, ricambio d\'aria e riscaldamento giusti per ogni ambiente, e a produrre la tua energia con fotovoltaico e accumulo per consumarla quando ti serve.':
            'Year-round comfort and lighter bills. We help you choose the right air conditioning, ventilation and heating for every room, and produce your own energy with solar panels and storage so you can use it when you need it.',
        'VMC (ricambio d\'aria)': 'Mechanical ventilation (MVHR)',
        'Impianti di riscaldamento': 'Heating systems',
        'Impianti fotovoltaici': 'Solar PV systems',
        'Sistemi di accumulo': 'Battery storage',
        'Impianti di domotica e automazione': 'Smart home and automation systems',
        'Più comfort, sicurezza ed efficienza, con un occhio al risparmio energetico. Progettiamo impianti domotici su misura, da gestire comodamente anche dallo smartphone, e automatizziamo accessi e passaggi di casa e azienda.':
            'More comfort, security and efficiency, with an eye on energy savings. We design tailor-made home automation systems you can easily run from your smartphone, and we automate gates and entrances for homes and businesses.',
        'Luci e tapparelle domotiche': 'Smart lights and shutters',
        'Controllo dei carichi': 'Load management',
        'Tutto l\'impianto da smartphone': 'The whole system on your smartphone',
        'Scenari per la vita quotidiana': 'Scenes for everyday life',
        'Cancelli automatici': 'Automatic gates',
        'Portoni sezionali da garage': 'Sectional garage doors',
        'Dissuasori a scomparsa': 'Retractable bollards',
        'Impianti di sicurezza': 'Security systems',
        'Sorveglianza e antifurto': 'Surveillance and alarms',
        'Impianti di sicurezza attiva e passiva ad alta tecnologia per il settore civile, industriale e commerciale: soluzioni personalizzate per prevenire e inibire ogni tentativo di effrazione.':
            'High-tech active and passive security systems for homes, industry and retail: tailored solutions to prevent and deter any break-in attempt.',
        'Impianti antintrusione': 'Intrusion alarm systems',
        'Impianti antincendio': 'Fire alarm systems',
        'Videosorveglianza (TVCC)': 'Video surveillance (CCTV)',
        'Impianti di reti e TV': 'Network and TV systems',
        'Reti dati e impianti TV': 'Data networks and TV systems',
        'Connessione veloce e segnale TV stabile in ogni stanza. Realizziamo reti dati in rame e fibra ottica, copertura Wi-Fi dentro e fuori casa e impianti d\'antenna per il digitale terrestre e il satellitare, per case, condomini e aziende.':
            'Fast connections and a stable TV signal in every room. We build copper and fibre-optic data networks, Wi-Fi coverage indoors and outdoors, and aerial systems for digital terrestrial and satellite TV, for homes, condominiums and businesses.',
        'Reti LAN e cablaggio strutturato': 'LAN and structured cabling',
        'Reti in fibra ottica': 'Fibre-optic networks',
        'Wi-Fi indoor e outdoor con access point': 'Indoor and outdoor Wi-Fi with access points',
        'Armadi rack': 'Rack cabinets',
        'Antenne per il digitale terrestre': 'Digital terrestrial TV aerials',
        'Parabole e impianti satellitari': 'Satellite dishes and systems',

        // smart home
        'Prendi il controllo della casa': 'Take control of the house',
        'Una casa con impianto elettrico, clima, fotovoltaico, domotica, TVCC e antifurto firmati New Sys. Da un pannello gestisci luci e sicurezza, dall\'altro guardi come si muove l\'energia tra fotovoltaico, batteria e rete.':
            'A house with electrical, climate, solar, home automation, CCTV and alarm systems by New Sys. One panel runs lights and security; the other shows how energy flows between solar panels, battery and grid.',
        'Casa interattiva in sezione con cinque stanze, pannelli solari, telecamere e sensori di movimento': 'Interactive cross-section of a house with five rooms, solar panels, cameras and motion sensors',
        'GARAGE': 'GARAGE',
        'Luce camera': 'Bedroom light',
        'Luce bagno': 'Bathroom light',
        'Luce soggiorno': 'Living room light',
        'Luce cucina': 'Kitchen light',
        'Luce garage': 'Garage light',
        'Soggiorno': 'Living room',
        'Cucina': 'Kitchen',
        'Camera': 'Bedroom',
        'Bagno': 'Bathroom',
        'Tocca una stanza per accendere la luce': 'Tap a room to switch the light on',
        'Intrusione rilevata! Luci accese e notifica inviata allo smartphone': 'Intrusion detected! Lights on and a notification sent to your smartphone',
        'Luce del garage accesa: si spegne da sola tra poco': 'Garage light on: it switches itself off shortly',
        'Pannelli di controllo della casa': 'House control panels',
        'Luci e sicurezza': 'Lights and security',
        'Energia e clima': 'Energy and climate',
        'Scenari': 'Scenes',
        'Entro in casa': 'Coming home',
        'Esco di casa': 'Leaving home',
        'Luci': 'Lights',
        'Disinserito': 'Disarmed',
        'Inserito': 'Armed',
        'ALLARME': 'ALARM',
        'Inserisci': 'Arm',
        'Simula intrusione': 'Simulate intrusion',
        'Scenari domotici in grado di interfacciarsi con antifurto, climatizzazione e molto altro': 'Smart scenes that work with the alarm, air conditioning and much more',
        'Luci domotiche controllabili da remoto tramite APP o con assistenti vocali': 'Smart lights you can control remotely via app or voice assistants',
        'TVCC: registrazione 24/7 con possibilità di pre-allarme': 'CCTV: 24/7 recording with a pre-alarm option',
        'Sensori IR attivi con l\'antifurto inserito': 'IR sensors active while the alarm is armed',
        'Ora del giorno': 'Time of day',
        'Flussi di energia': 'Energy flows',
        'Batteria': 'Battery',
        'In carica': 'Charging',
        'In uso': 'In use',
        'Consumo casa': 'Home load',
        'Dalla rete': 'From the grid',
        'Immessa in rete': 'To the grid',
        'Clima': 'Climate',
        'Spento': 'Off',
        'Riscalda': 'Heat',
        'Raffresca': 'Cool',
        'Temperatura impostata': 'Set temperature',
        'Prelievo dal contatore': 'Drawn from the meter',
        'Immissione in rete': 'Fed into the grid',
        'Contatore 6 kW': '6 kW meter',
        'Fotovoltaico 8 kWp': '8 kWp solar PV',
        'Accumulo 10 kWh': '10 kWh storage',
        'Simulazione indicativa di una villetta': 'Indicative simulation of a detached house',

        // about
        'Elettricisti esperti, servizi di qualità': 'Expert electricians, quality service',
        'Dal 2008 New Sys si occupa dell\'installazione e della manutenzione di impianti elettrici civili e industriali: dall\'elettrico all\'antintrusione, dal fotovoltaico alla quadristica industriale, fino a videocitofoni, reti LAN e automazione.':
            'Since 2008 New Sys has installed and maintained residential and industrial electrical systems: from wiring to intrusion alarms, from solar PV to industrial control panels, all the way to video intercoms, LAN networks and automation.',
        'Operiamo a Cuneo e provincia e interveniamo per manutenzioni e riparazioni anche fuori zona. Il nostro obiettivo è sempre lo stesso: impianti all\'avanguardia, materiali certificati e manodopera qualificata.':
            'We work in Cuneo and its province, and we also handle maintenance and repairs outside the area. Our goal never changes: cutting-edge systems, certified materials and skilled workmanship.',
        'Elettrico': 'Electrical',
        'Impianti civili': 'Residential systems',
        'Riscaldamento': 'Heating',
        'Efficientamento energetico': 'Energy efficiency',
        'Antintrusione': 'Intrusion alarms',
        'Antincendio': 'Fire alarms',
        'Domotica e reti': 'Automation and networks',
        'Cancelli e portoni automatici': 'Automatic gates and doors',
        'Reti di distribuzione TV': 'TV distribution networks',
        'Anno di fondazione': 'Year founded',
        'Tipologie di impianti': 'Types of systems',
        'Materiali certificati': 'Certified materials',
        'Cuneo e provincia': 'Cuneo and province',

        // brands
        'I marchi più installati': 'Our most installed brands',
        'Filtra i marchi per categoria': 'Filter brands by category',
        'Tutti': 'All',
        'Reti e automazione': 'Networks and automation',

        // process
        'Consulenza tecnica: i passaggi del lavoro': 'Technical consulting: the steps of the job',
        'Ti seguiamo in ogni passaggio': 'We are with you every step of the way',
        'Oltre a realizzare il lavoro, ti accompagniamo passo dopo passo: così capisci cosa stiamo facendo e ne apprezzi tutti i vantaggi.':
            'Beyond doing the work, we guide you step by step, so you understand what we are doing and get the most out of it.',
        'Primo contatto': 'First contact',
        'Ci racconti l\'esigenza, ti diamo le prime indicazioni.': 'You tell us what you need, we give you initial advice.',
        'Verifichiamo ambienti, impianto esistente e documentazione.': 'We check the rooms, the existing system and the paperwork.',
        'Proposta': 'Proposal',
        'Progetto tecnico-economico chiaro, con prezzi concorrenziali.': 'A clear technical and financial plan, at competitive prices.',
        'Realizzazione': 'Installation',
        'Installazione con materiali certificati e personale qualificato.': 'Installed with certified materials by qualified staff.',
        'Collaudo e assistenza': 'Testing and support',
        'Verifica finale, certificazione e manutenzione nel tempo.': 'Final checks, certification and ongoing maintenance.',
        'SOPRALLUOGO': 'SURVEY',
        'CONFORME ✓': 'COMPLIANT ✓',

        // contact
        'Accendiamo il tuo progetto': 'Let\'s power up your project',
        'Compila il modulo o chiamaci: il nostro staff ti risponde nel minor tempo possibile.': 'Fill in the form or give us a call: our team will get back to you as soon as possible.',
        'Vieni a trovarci': 'Visit us',
        'Cellulare': 'Mobile',
        'Tel. e Fax': 'Phone and fax',
        'Nome': 'Name',
        'Telefono': 'Phone',
        'Servizio': 'Service',
        'Seleziona servizio': 'Select a service',
        'Impianti Elettrici': 'Electrical systems',
        'Impianti di Climatizzazione': 'Air conditioning systems',
        'Impianti Fotovoltaici': 'Solar PV systems',
        'Domotica e Automazione': 'Smart home & automation',
        'Impianti di Sorveglianza e Antifurti': 'Surveillance and alarm systems',
        'Reti Dati e Impianti TV': 'Data networks and TV systems',
        'Consulenza tecnica': 'Technical consulting',
        'Messaggio': 'Message',
        'Invia richiesta': 'Send request',
        'Controlla i campi evidenziati.': 'Please check the highlighted fields.',
        'Si sta aprendo il tuo programma di posta con la richiesta già compilata.': 'Your email app is opening with the request already filled in.',

        // footer and meter
        'Prezzi concorrenziali e alta qualità di materiali e tecnologie garantiscono lavori a regola d\'arte e affidabili nel tempo.':
            'Competitive prices and high-quality materials and technology guarantee expert workmanship built to last.',
        'Impianti di climatizzazione': 'Air conditioning systems',
        'P.IVA 03238000040': 'VAT no. 03238000040',
        'Informativa privacy': 'Privacy policy',
        'Contatore': 'Meter',
        'Attiva suoni': 'Turn sound on',
        'Disattiva suoni': 'Turn sound off'
    };
    // blocks with inline markup, swapped as a whole (data-i18n="key")
    const EN_HTML = {
        privacy: 'I have read the <a href="https://www.newsysimpiantielettrici.it/privacy/" target="_blank" rel="noopener">privacy policy</a> and consent to the processing of my data.'
    };
    const PATTERNS = [
        [/^Linea (\d+)$/, (m) => `Line ${m[1]}`],
        [/^Mostra (.+)$/, (m) => `Show ${lookup(m[1]) || m[1]}`]
    ];

    const lookup = (core) => {
        if (core in EN) return EN[core];
        for (const [re, fn] of PATTERNS) { const m = core.match(re); if (m) return fn(m); }
        // "Linea 3 · Domotica", "02 · Accensione", "Riscalda · 22 °C": translate each part
        if (core.includes(' · ')) {
            const parts = core.split(' · ');
            const out = parts.map((p) => lookup(p) || p);
            if (out.some((p, i) => p !== parts[i])) return out.join(' · ');
        }
        return null;
    };
    const swap = (text, find) => {
        const core = text.replace(/\s+/g, ' ').trim();
        if (!core) return text;
        const hit = find(core);
        if (hit == null) return text;
        const [, lead, , trail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
        return lead + hit + trail;
    };
    const translate = (text) => swap(text, lookup);
    // English copied around by main.js (the decode effect, the process caption) maps back to Italian
    const IT = {};
    Object.entries(EN).forEach(([it, en]) => { if (!(en in IT)) IT[en] = it; });
    const original = (text) => swap(text, (core) => (core in IT ? IT[core] : null));

    const KEY = 'ns_lang';
    const saved = (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })();
    let lang = saved === 'it' || saved === 'en' ? saved : (/^it\b/i.test(navigator.language || 'it') ? 'it' : 'en');

    // every node remembers its Italian text and what was last written into it, so text that main.js
    // replaces later is picked up as the new original
    const texts = new WeakMap();
    const setText = (node) => {
        const cur = node.nodeValue;
        const rec = texts.get(node);
        const it = rec && rec.shown === cur ? rec.it : original(cur);
        const out = lang === 'en' ? translate(it) : it;
        if (out !== cur) node.nodeValue = out;
        texts.set(node, { it, shown: out });
    };
    const ATTRS = ['aria-label', 'alt', 'title', 'placeholder'];
    const attrs = new WeakMap();
    const setAttr = (el, name) => {
        const cur = el.getAttribute(name);
        if (cur == null) return;
        const map = attrs.get(el) || {};
        const rec = map[name];
        const it = rec && rec.shown === cur ? rec.it : original(cur);
        const out = lang === 'en' ? translate(it) : it;
        if (out !== cur) el.setAttribute(name, out);
        map[name] = { it, shown: out };
        attrs.set(el, map);
    };
    const htmlBlocks = new WeakMap();
    const setHtml = (el) => {
        if (!htmlBlocks.has(el)) htmlBlocks.set(el, el.innerHTML);
        const html = lang === 'en' && EN_HTML[el.dataset.i18n] ? EN_HTML[el.dataset.i18n] : htmlBlocks.get(el);
        if (el.innerHTML !== html) el.innerHTML = html;
    };

    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT)$/;
    const skipped = (node) => {
        const el = node.nodeType === 1 ? node : node.parentElement;
        return !el || SKIP.test(el.nodeName) || !!el.closest('[data-i18n], [data-no-i18n]');
    };
    const walk = (root) => {
        if (root.nodeType === 3) { if (!skipped(root)) setText(root); return; }
        if (root.nodeType !== 1) return;
        if (root.matches('[data-i18n]')) { setHtml(root); return; }
        if (skipped(root)) return;
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) if (!skipped(tw.currentNode)) setText(tw.currentNode);
        [root, ...root.querySelectorAll('*')].forEach((el) => {
            if (el.matches('[data-i18n]')) setHtml(el);
            else ATTRS.forEach((a) => { if (el.hasAttribute(a)) setAttr(el, a); });
        });
    };

    const meta = document.querySelector('meta[name="description"]');
    const metaIt = meta && meta.content;
    const apply = () => {
        document.documentElement.lang = lang;
        walk(document.documentElement);
        if (meta) meta.content = lang === 'en' ? translate(metaIt) : metaIt;
        document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    };

    let busy = false;
    const observer = new MutationObserver((list) => {
        if (busy) return;
        busy = true;
        list.forEach((m) => {
            if (m.type === 'characterData') { if (!skipped(m.target)) setText(m.target); }
            else if (m.type === 'attributes') { if (!skipped(m.target)) setAttr(m.target, m.attributeName); }
            else m.addedNodes.forEach(walk);
        });
        observer.takeRecords();
        busy = false;
    });

    const setLang = (next) => {
        if (next === lang) return;
        lang = next;
        try { localStorage.setItem(KEY, lang); } catch (e) { /* private mode */ }
        apply();
        observer.takeRecords();
        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    };
    document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

    apply();
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    window.I18N = { get lang() { return lang; }, setLang };
})();
