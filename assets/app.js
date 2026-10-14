/* Repair Academy v2 */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');

  /* ---------- utilidades ---------- */
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    }
    for (const x of kids.flat()) {
      if (x == null || x === false) continue;
      e.append(x.nodeType ? x : document.createTextNode(x));
    }
    return e;
  }
  const toText = (html) => html ? (new DOMParser().parseFromString(html, 'text/html').body.textContent || '').trim() : '';
  const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//.test(u)) ? u : null;
  const pick = (o, order) => {
    if (!o) return null;
    if (typeof o === 'string') return safeUrl(o);
    for (const k of order) if (o[k]) return safeUrl(o[k]);
    return null;
  };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignorar */ } }
  };
  const PHONE_SVG = '<svg viewBox="0 0 48 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="4" width="32" height="56" rx="7"/><path d="M20 54h8"/></svg>';
  function placeholder(label) {
    const d = h('div', { class: 'ph', role: 'img', 'aria-label': label || 'Imagen no disponible' });
    d.innerHTML = PHONE_SVG;
    d.append(h('span', {}, label || 'Sin foto'));
    return d;
  }
  function img(src, alt, cls, w, hh) {
    if (!src) return placeholder('Sin foto');
    const i = h('img', { src, alt: alt || '', class: cls || '', loading: 'lazy', decoding: 'async', width: w, height: hh, referrerpolicy: 'no-referrer' });
    i.addEventListener('error', () => i.replaceWith(placeholder('Imagen no disponible')), { once: true });
    return i;
  }

  /* ---------- tema ---------- */
  const themeBtn = $('#themeBtn');
  const sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  let theme = store.get('ra:theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  function applyTheme() { document.documentElement.dataset.theme = theme; themeBtn.innerHTML = theme === 'dark' ? sun : moon; }
  themeBtn.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; store.set('ra:theme', theme); applyTheme(); });
  applyTheme();

  /* ---------- clasificación y ranking de guías ---------- */
  const CATS = [
    ['battery', 'Batería', /battery|bater[ií]a/i],
    ['screen', 'Pantalla', /screen|display|lcd|oled|digitizer|pantalla/i],
    ['camera', 'Cámaras', /camera|c[aá]mara/i],
    ['charge', 'Puerto de carga', /lightning|charging|dock connector|usb-?c|puerto/i],
    ['speaker', 'Sonido', /speaker|microphone|earpiece|altavoz|micr[oó]fono/i],
    ['haptic', 'Taptic Engine', /taptic|vibrat/i],
    ['glass', 'Cristal trasero', /back glass|rear glass|rear case|housing|back cover|cristal trasero/i],
    ['board', 'Placa lógica', /logic board|motherboard|placa/i],
    ['buttons', 'SIM y botones', /sim|button|bot[oó]n|power|volume|home|mute|switch/i],
    ['other', 'Otras', /./]
  ];
  const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c[0], c[1]]));
  const NEG = /message|notification|health|software|reset|troubleshoot|diagnos|calibrat|mensaje|aviso/i;
  const MINOR = /protector|case|mod\b|sticker|decal/i;
  const DIFF = { 'very easy': 'Muy fácil', easy: 'Fácil', moderate: 'Moderado', difficult: 'Difícil', 'very difficult': 'Muy difícil' };
  const TYPE = { replacement: 'Reemplazo', repair: 'Reparación', disassembly: 'Desmontaje', teardown: 'Teardown', technique: 'Técnica', maintenance: 'Mantenimiento', installation: 'Instalación' };

  function catOf(g) {
    const subj = g.subject || '';
    for (const [id, , re] of CATS) if (id !== 'other' && re.test(subj)) return id;
    for (const [id, , re] of CATS) if (id !== 'other' && re.test(g.title || '')) return id;
    return 'other';
  }
  function normGuide(g) {
    const flags = (g.flags || []).map((f) => (typeof f === 'string' ? f : f && f.flagid) || '');
    const o = {
      id: g.guideid, title: g.title || g.subject || 'Guía ' + g.guideid, subject: g.subject || '',
      type: String(g.type || '').toLowerCase(), difficulty: String(g.difficulty || '').toLowerCase(),
      image: pick(g.image, ['standard', 'medium', 'large', 'thumbnail']), flags
    };
    o.cat = catOf(g);
    o.archived = flags.some((f) => /ARCHIVED|IN_PROGRESS|TEMPORARY/i.test(f));
    o.starred = flags.some((f) => /STARRED/i.test(f));
    let s = 0;
    if (o.type === 'replacement') s += 40;
    else if (o.type === 'repair') s += 25;
    else if (/teardown|technique|disassembly/.test(o.type)) s -= 15;
    if (/replacement|reemplazo/i.test(o.title)) s += 25;
    if (o.cat !== 'other') s += 20;
    if (o.starred) s += 20;
    if (o.image) s += 10;
    if (o.archived) s -= 100;
    if (NEG.test(o.title)) s -= 50;
    if (MINOR.test(o.title)) s -= 30;
    o.score = s;
    return o;
  }
  const bestOf = (list, cat) => list.filter((g) => g.cat === cat && !g.archived && g.score > 0).sort((a, b) => b.score - a.score)[0] || null;

  /* ---------- estado ---------- */
  let cleanup = null;
  let selectedCat = null;
  let modelsCache = null;
  const SYMPTOMS = [
    ['Se descarga muy rápido', 'battery'], ['Pantalla rota', 'screen'], ['No carga', 'charge'],
    ['No se oye / no me oyen', 'speaker'], ['Cámara borrosa', 'camera'], ['Botón o SIM con fallas', 'buttons']
  ];
  const era = (m) => {
    const n = (m.match(/iPhone (\d+)/) || [])[1];
    if (n) return +n >= 14 ? 'Recientes (iPhone 14 en adelante)' : +n >= 11 ? 'iPhone 11 a 13' : 'iPhone 8 y anteriores';
    if (/X/.test(m)) return 'iPhone 11 a 13'.replace('11 a 13', 'X, XR y XS');
    return 'iPhone SE';
  };

  function skeleton(n) { return h('div', { class: 'grid' }, Array.from({ length: n }, () => h('div', { class: 'card sk' }, h('div', { class: 'skeleton img-sk' }), h('div', { class: 'skeleton line' }), h('div', { class: 'skeleton line short' })))); }
  function errorBox(msg, retry) {
    return h('div', { class: 'state' }, h('h2', {}, 'Algo salió mal'), h('p', {}, msg), h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: retry }, 'Reintentar'), h('a', { class: 'btn', href: '#/' }, 'Volver al inicio')));
  }
  function setTitle(t) { document.title = t ? t + ' — Repair Academy' : 'Repair Academy — Guías visuales para reparar iPhone'; }

  /* ---------- HOME ---------- */
  async function home() {
    setTitle('');
    const hero = h('section', { class: 'hero' },
      h('p', { class: 'eyebrow' }, 'Guías visuales · En español'),
      h('h1', {}, 'Repara tu iPhone con cada paso a la vista.'),
      h('p', { class: 'lead' }, 'Elige tu modelo, encuentra la reparación correcta y sigue fotos reales, herramientas y advertencias de seguridad.'));
    const symWrap = h('div', { class: 'sym' }, h('p', { class: 'label' }, '¿Qué le pasa a tu iPhone?'),
      h('div', { class: 'chips' }, SYMPTOMS.map(([t, c]) => h('button', { class: 'chip' + (selectedCat === c ? ' on' : ''), type: 'button', 'aria-pressed': selectedCat === c, onclick: () => { selectedCat = selectedCat === c ? null : c; home(); } }, t))),
      selectedCat ? h('p', { class: 'hint' }, 'Ahora elige tu modelo para abrir la guía de ' + CAT_LABEL[selectedCat].toLowerCase() + '.') : null);
    const list = h('div', { id: 'models' }, skeleton(8));
    app.replaceChildren(hero, symWrap, list);
    try {
      modelsCache = modelsCache || await API.models();
      renderModels(list, $('#q').value);
    } catch (e) { list.replaceChildren(errorBox('No pudimos cargar el catálogo.', home)); }
  }

  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { io.unobserve(en.target); en.target._load && en.target._load(); }
  }, { rootMargin: '200px' }) : null;

  function modelCard(m) {
    const media = h('div', { class: 'media' }, placeholder('Cargando'));
    const meta = h('p', { class: 'meta' }, ' ');
    const a = h('a', { class: 'card', href: '#/m/' + encodeURIComponent(m) + (selectedCat ? '?c=' + selectedCat : '') }, media, h('div', { class: 'body' }, h('h3', {}, m), meta));
    a._load = async () => {
      try {
        const w = await API.wiki(m);
        const url = pick(w.image, ['standard', 'medium', 'large', 'thumbnail']);
        media.replaceChildren(url ? img(url, 'iPhone: ' + m, '', 400, 300) : placeholder('Sin foto'));
        const n = (w.guides || []).map(normGuide).filter((g) => !g.archived).length;
        meta.textContent = n ? n + (n === 1 ? ' guía' : ' guías') : 'Sin guías disponibles';
      } catch (e) { media.replaceChildren(placeholder('Sin foto')); meta.textContent = 'Toca para abrir'; }
    };
    if (io) io.observe(a); else a._load();
    return a;
  }
  function renderModels(box, query) {
    const q = (query || '').toLowerCase().trim();
    let list = modelsCache;
    if (q) { const toks = q.split(/\s+/).filter((t) => !CATS.some((c) => c[2].test(t) && c[0] !== 'other')); list = modelsCache.filter((m) => toks.every((t) => m.toLowerCase().includes(t))); }
    if (!list.length) { box.replaceChildren(h('div', { class: 'state' }, h('h2', {}, 'Sin resultados'), h('p', {}, 'Prueba con “iPhone 12”, “iPhone 11 Pro” o “iPhone SE”.'))); return; }
    const groups = new Map();
    list.forEach((m) => { const g = era(m); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(m); });
    box.replaceChildren(...[...groups].map(([g, ms]) => h('section', { class: 'group' }, h('h2', {}, g), h('div', { class: 'grid' }, ms.map(modelCard)))));
  }

  /* ---------- MODELO ---------- */
  async function modelView(model, cat) {
    setTitle(model);
    const box = h('div', {}, skeleton(6));
    app.replaceChildren(crumbs([['Inicio', '#/'], [model]]), h('h1', { class: 'page' }, model), box);
    let w;
    try { w = await API.wiki(model); } catch (e) { box.replaceChildren(errorBox('No pudimos cargar las guías de ' + model + '.', () => modelView(model, cat))); return; }
    const all = (w.guides || []).filter((g) => g && g.guideid).map(normGuide);
    let showAll = false, filter = cat && CAT_LABEL[cat] ? cat : 'all', text = '';
    const heroImg = pick(w.image, ['large', 'standard', 'medium']);
    const summary = toText(w.contents_rendered || w.description || '').slice(0, 240);
    const render = () => {
      const visible = all.filter((g) => showAll || !g.archived);
      const present = CATS.filter((c) => visible.some((g) => g.cat === c[0]));
      const best = present.filter((c) => c[0] !== 'other').map((c) => bestOf(all, c[0])).filter(Boolean);
      const head = h('section', { class: 'model-head' }, heroImg ? img(heroImg, 'iPhone: ' + model, 'model-img', 480, 360) : null, h('div', {}, summary ? h('p', { class: 'lead' }, summary + (summary.length >= 240 ? '…' : '')) : h('p', { class: 'lead' }, 'Selecciona una reparación para ver fotos, herramientas y pasos.'), h('p', { class: 'meta' }, visible.length + ' guías · datos de iFixit')));
      const rec = best.length ? h('section', {}, h('h2', {}, 'Reparaciones recomendadas'), h('div', { class: 'grid' }, best.map((g) => guideCard(g, true)))) : null;
      const chips = h('div', { class: 'chips' }, [['all', 'Todas']].concat(present.map((c) => [c[0], c[1]])).map(([id, l]) => h('button', { class: 'chip' + (filter === id ? ' on' : ''), type: 'button', 'aria-pressed': filter === id, onclick: () => { filter = id; render(); } }, l)));
      const search = h('input', { class: 'inline-search', type: 'search', placeholder: 'Filtrar guías…', value: text, 'aria-label': 'Filtrar guías', oninput: (e) => { text = e.target.value; renderList(); } });
      const toggle = h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: showAll, onchange: (e) => { showAll = e.target.checked; render(); } }), ' Incluir guías archivadas o en progreso');
      const listBox = h('div', { class: 'grid', id: 'glist' });
      function renderList() {
        const q = text.toLowerCase();
        const items = visible.filter((g) => (filter === 'all' || g.cat === filter) && (!q || (g.title + ' ' + g.subject).toLowerCase().includes(q))).sort((a, b) => b.score - a.score);
        listBox.replaceChildren(...(items.length ? items.map((g) => guideCard(g, false)) : [h('div', { class: 'state' }, h('p', {}, 'No hay guías con ese filtro.'))]));
      }
      box.replaceChildren(head, rec, h('section', {}, h('h2', {}, 'Todas las guías'), chips, h('div', { class: 'row tools' }, search, toggle), listBox));
      renderList();
    };
    if (!all.length) { box.replaceChildren(h('div', { class: 'state' }, h('h2', {}, 'Sin guías todavía'), h('p', {}, 'iFixit aún no tiene guías publicadas para este modelo.'), h('a', { class: 'btn', href: '#/' }, 'Elegir otro modelo'))); return; }
    render();
  }
  function guideCard(g, featured) {
    const badges = h('div', { class: 'badges' }, featured ? h('span', { class: 'badge accent' }, CAT_LABEL[g.cat]) : h('span', { class: 'badge' }, CAT_LABEL[g.cat]), g.type && TYPE[g.type] ? h('span', { class: 'badge' }, TYPE[g.type]) : null, g.starred ? h('span', { class: 'badge ok' }, 'Destacada') : null, g.archived ? h('span', { class: 'badge warn' }, 'Archivada') : null);
    return h('a', { class: 'card', href: '#/g/' + g.id }, h('div', { class: 'media' }, img(g.image, g.title, '', 400, 300)), h('div', { class: 'body' }, badges, h('h3', {}, g.title), g.difficulty ? h('p', { class: 'meta' }, 'Dificultad: ' + (DIFF[g.difficulty] || g.difficulty)) : null));
  }
  function crumbs(items) {
    return h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, items.map((it, i) => [i ? h('span', { 'aria-hidden': 'true' }, '/') : null, it[1] ? h('a', { href: it[1] }, it[0]) : h('span', { 'aria-current': 'page' }, it[0])]));
  }

  /* ---------- GUÍA ---------- */
  const fmtTime = (g) => {
    const a = g.time_required_min, b = g.time_required_max;
    const f = (s) => s >= 3600 ? Math.round(s / 360) / 10 + ' h' : Math.round(s / 60) + ' min';
    if (a && b) return a === b ? f(a) : f(a) + ' – ' + f(b);
    return null;
  };
  const bulletClass = (b) => /red|caution/.test(b) ? 'warn' : /orange|yellow|reminder/.test(b) ? 'rem' : /blue|note/.test(b) ? 'note' : '';

  async function guideView(id) {
    app.replaceChildren(skeleton(1));
    let g;
    try { g = await API.guide(id); } catch (e) { app.replaceChildren(errorBox('No pudimos cargar esta guía.', () => guideView(id))); return; }
    const title = g.title || 'Guía';
    setTitle(title);
    const steps = (g.steps || []).map((s, i) => {
      const media = s.media && s.media.type === 'image' && Array.isArray(s.media.data) ? s.media.data : [];
      return {
        n: i + 1, title: toText(s.title) || 'Paso ' + (i + 1),
        lines: (s.lines || []).map((l) => ({ t: toText(l.text_rendered) || l.text_raw || '', level: l.level || 0, cls: bulletClass(String(l.bullet || '')) })).filter((l) => l.t),
        pics: media.map((m) => ({ big: pick(m, ['large', 'medium', 'original', 'huge']), full: pick(m, ['huge', 'original', 'large']), thumb: pick(m, ['thumbnail', 'mini', 'medium']) })).filter((p) => p.big)
      };
    });
    const doneKey = 'ra:done:' + id;
    const done = new Set(store.get(doneKey) || []);
    let cur = 0;
    const english = g._requestedLang === 'en' || g.langid === 'en';
    const model = g.category || '';
    const hero = pick(g.image, ['large', 'standard', 'medium']);
    const time = fmtTime(g);
    const author = g.author && g.author.username;
    const head = h('section', { class: 'guide-head' },
      hero ? img(hero, title, 'guide-hero', 720, 540) : null,
      h('div', {}, h('div', { class: 'badges' }, g.type && TYPE[String(g.type).toLowerCase()] ? h('span', { class: 'badge accent' }, TYPE[String(g.type).toLowerCase()]) : null, english ? h('span', { class: 'badge warn' }, 'Texto original en inglés') : h('span', { class: 'badge ok' }, 'En español')),
        h('h1', { class: 'page' }, title),
        h('dl', { class: 'facts' },
          g.difficulty ? [h('dt', {}, 'Dificultad'), h('dd', {}, DIFF[String(g.difficulty).toLowerCase()] || g.difficulty)] : null,
          time ? [h('dt', {}, 'Tiempo'), h('dd', {}, time)] : null,
          [h('dt', {}, 'Pasos'), h('dd', {}, String(steps.length))],
          author ? [h('dt', {}, 'Autor'), h('dd', {}, author)] : null)));
    const intro = toText(g.introduction_rendered || g.introduction_raw);
    const toolList = (g.tools || []).map((t) => ({ name: t.text || t.title || t.type || 'Herramienta', url: safeUrl(t.url), th: pick(t, ['thumbnail']) || pick(t.image, ['thumbnail', 'mini']), qty: t.quantity, note: toText(t.notes) }));
    const partList = (g.parts || []).map((t) => ({ name: t.text || t.title || t.type || 'Pieza', url: safeUrl(t.url), th: pick(t, ['thumbnail']) || pick(t.image, ['thumbnail', 'mini']), qty: t.quantity, note: toText(t.notes) }));
    const items = (arr, key) => arr.length ? h('ul', { class: 'items' }, arr.map((t, i) => h('li', {}, h('label', {}, h('input', { type: 'checkbox', 'aria-label': 'Tengo ' + t.name }), t.th ? img(t.th, '', 'th', 56, 56) : null, h('span', {}, t.url ? h('a', { href: t.url, target: '_blank', rel: 'noopener noreferrer' }, t.name) : t.name, t.qty && t.qty > 1 ? ' ×' + t.qty : '', t.note ? h('small', {}, t.note) : null))))) : h('p', { class: 'meta' }, 'La guía no indica ' + key + '.');
    const safety = h('aside', { class: 'safety', role: 'note' }, h('h3', {}, 'Antes de empezar'), h('ul', {}, h('li', {}, 'Apaga el iPhone y desconecta cualquier cable.'), h('li', {}, 'Una batería hinchada o dañada es peligrosa: no la perfores ni la dobles.'), h('li', {}, 'Calienta el adhesivo solo lo necesario y usa guantes si es cristal roto.'), h('li', {}, 'Guarda los tornillos ordenados por paso.')));
    const overview = h('section', { class: 'overview' }, intro ? h('p', { class: 'lead' }, intro) : null, safety,
      h('div', { class: 'two' }, h('div', {}, h('h2', {}, 'Herramientas'), items(toolList, 'herramientas')), h('div', {}, h('h2', {}, 'Piezas'), items(partList, 'piezas'))));

    /* visor de pasos */
    const stage = h('section', { class: 'stage', 'aria-live': 'polite' });
    const side = h('ol', { class: 'steplist', 'aria-label': 'Lista de pasos' });
    const bar = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(steps.length) }, h('i'));
    function paintSide() { side.replaceChildren(...steps.map((s, i) => h('li', {}, h('button', { type: 'button', class: (i === cur ? 'cur ' : '') + (done.has(i) ? 'done' : ''), 'aria-current': i === cur ? 'step' : null, onclick: () => go(i) }, h('b', {}, String(s.n)), h('span', {}, s.title))))); }
    function paintBar() { bar.firstChild.style.width = (steps.length ? done.size / steps.length * 100 : 0) + '%'; bar.setAttribute('aria-valuenow', String(done.size)); }
    function go(i) { cur = Math.max(0, Math.min(steps.length - 1, i)); paintStep(); paintSide(); }
    function paintStep() {
      const s = steps[cur];
      let picIdx = 0;
      const main = h('div', { class: 'pic' });
      const thumbs = h('div', { class: 'thumbs' });
      const showPic = (k) => {
        picIdx = k;
        const p = s.pics[k];
        const im = img(p.big, s.title + ' (' + (k + 1) + ' de ' + s.pics.length + ')', '', 900, 675);
        im.classList.add('zoom');
        im.addEventListener('click', () => openLb(p.full || p.big, s.title));
        main.replaceChildren(im, s.pics.length > 1 ? h('span', { class: 'count' }, (k + 1) + ' / ' + s.pics.length) : null);
        [...thumbs.children].forEach((b, j) => b.classList.toggle('on', j === k));
      };
      if (s.pics.length) {
        s.pics.forEach((p, k) => thumbs.append(h('button', { type: 'button', 'aria-label': 'Foto ' + (k + 1), onclick: () => showPic(k) }, img(p.thumb || p.big, '', '', 80, 60))));
        showPic(0);
      } else main.replaceChildren(h('div', { class: 'ph wide' }, h('span', {}, 'Este paso no incluye foto. Sigue las indicaciones escritas.')));
      stage.replaceChildren(
        h('div', { class: 'stage-top' }, h('p', { class: 'eyebrow' }, 'Paso ' + s.n + ' de ' + steps.length), h('button', { class: 'btn small', type: 'button', onclick: toggleWorkshop }, stage.classList.contains('workshop') ? 'Salir del modo taller' : 'Modo taller')),
        h('h2', {}, s.title), main, s.pics.length > 1 ? thumbs : null,
        h('ul', { class: 'lines' }, s.lines.map((l) => h('li', { class: l.cls, style: l.level ? 'margin-left:' + Math.min(l.level, 3) * 20 + 'px' : null }, l.t))),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: done.has(cur), onchange: (e) => { e.target.checked ? done.add(cur) : done.delete(cur); store.set(doneKey, [...done]); paintBar(); paintSide(); } }), ' Paso completado'),
        h('div', { class: 'nav' }, h('button', { class: 'btn', type: 'button', disabled: cur === 0, onclick: () => go(cur - 1) }, '← Anterior'), h('button', { class: 'btn primary', type: 'button', disabled: cur === steps.length - 1, onclick: () => go(cur + 1) }, 'Siguiente →')));
    }
    function toggleWorkshop() {
      const on = stage.classList.toggle('workshop');
      document.body.classList.toggle('lock', on);
      if (on && stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      paintStep();
    }
    const conclusion = toText(g.conclusion_rendered || g.conclusion_raw);
    const source = h('footer', { class: 'source' }, h('p', {}, 'Fuente original: ', g.url ? h('a', { href: safeUrl(g.url) || '#', target: '_blank', rel: 'noopener noreferrer' }, 'iFixit') : 'iFixit', author ? ' · Autor: ' + author : '', ' · Licencia CC BY-NC-SA 3.0. Texto adaptado a esta interfaz; las fotos pertenecen a sus autores.'));
    app.replaceChildren(crumbs([['Inicio', '#/'], model ? [model, '#/m/' + encodeURIComponent(model)] : ['Guía'], [title]]), head, overview,
      steps.length ? h('section', { class: 'steps' }, h('div', { class: 'steps-head' }, h('h2', {}, 'Paso a paso'), bar), h('div', { class: 'steps-body' }, side, stage)) : h('div', { class: 'state' }, h('p', {}, 'Esta guía no tiene pasos publicados.')),
      conclusion ? h('section', {}, h('h2', {}, 'Al terminar'), h('p', {}, conclusion)) : null, source);
    if (steps.length) { paintSide(); paintStep(); paintBar(); }
    const onKey = (e) => { if (/INPUT|TEXTAREA/.test(e.target.tagName) || $('#lb').open) return; if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'Escape' && stage.classList.contains('workshop')) toggleWorkshop(); };
    document.addEventListener('keydown', onKey);
    cleanup = () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('lock'); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lb');
  function openLb(src, cap) { $('#lbImg').src = src; $('#lbImg').alt = cap || ''; $('#lbCap').textContent = cap || ''; lb.showModal ? lb.showModal() : lb.setAttribute('open', ''); }
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });

  /* ---------- búsqueda ---------- */
  $('#searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('#q').value.toLowerCase().trim();
    const cat = CATS.find((c) => c[0] !== 'other' && c[2].test(q));
    modelsCache = modelsCache || await API.models().catch(() => []);
    const toks = q.split(/\s+/).filter((t) => !CATS.some((c) => c[0] !== 'other' && c[2].test(t)));
    const hits = modelsCache.filter((m) => toks.length && toks.every((t) => m.toLowerCase().includes(t)));
    const exact = hits.find((m) => m.toLowerCase() === toks.join(' ')) || (hits.length === 1 ? hits[0] : null);
    if (exact) location.hash = '#/m/' + encodeURIComponent(exact) + (cat ? '?c=' + cat[0] : '');
    else if (location.hash.replace('#', '') === '/' || !location.hash) home();
    else location.hash = '#/';
  });
  $('#q').addEventListener('input', () => { if (modelsCache && $('#models')) renderModels($('#models'), $('#q').value); });

  /* ---------- router ---------- */
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const [path, qs] = (location.hash.slice(1) || '/').split('?');
    const params = new URLSearchParams(qs || '');
    let m;
    window.scrollTo(0, 0);
    if ((m = path.match(/^\/m\/(.+)$/))) modelView(decodeURIComponent(m[1]), params.get('c'));
    else if ((m = path.match(/^\/g\/(\d+)$/))) guideView(m[1]);
    else home();
    app.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', route);
  route();
})();
