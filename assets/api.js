/* Capa de datos: API pública de iFixit v2.0 (solo lectura). */
(function (w) {
  const BASE = 'https://www.ifixit.com/api/2.0';
  const cache = new Map();

  async function get(path) {
    if (cache.has(path)) return cache.get(path);
    const r = await fetch(BASE + path, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    cache.set(path, j);
    return j;
  }

  const slug = (t) => encodeURIComponent(t.replace(/ /g, '_'));

  const STATIC_MODELS = [
    'iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 16e',
    'iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15',
    'iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14 Plus','iPhone 14',
    'iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone 13 mini',
    'iPhone 12 Pro Max','iPhone 12 Pro','iPhone 12','iPhone 12 mini',
    'iPhone 11 Pro Max','iPhone 11 Pro','iPhone 11',
    'iPhone XS Max','iPhone XS','iPhone XR','iPhone X',
    'iPhone 8 Plus','iPhone 8','iPhone 7 Plus','iPhone 7',
    'iPhone 6s Plus','iPhone 6s','iPhone 6 Plus','iPhone 6',
    'iPhone SE (2022)','iPhone SE (2020)','iPhone SE (1st Gen)'
  ];

  const MODEL_RE = /^iPhone (\d|X|SE)/;
  const BAD_RE = /(repair|troubleshooting|teardown|display|battery|screen|camera|speaker|glass)/i;

  function collect(tree, out) {
    if (!tree || typeof tree !== 'object') return out;
    for (const [k, v] of Object.entries(tree)) {
      if (MODEL_RE.test(k) && !BAD_RE.test(k) && k.length < 28) out.add(k);
      collect(v, out);
    }
    return out;
  }

  async function models() {
    const set = new Set(STATIC_MODELS);
    try {
      const tree = await get('/categories/iPhone');
      collect(tree, new Set()).forEach((m) => set.add(m));
    } catch (e) { /* se conserva el listado estático */ }
    return [...set];
  }

  async function wiki(model) {
    return get('/wikis/CATEGORY/' + slug(model));
  }

  async function guide(id) {
    try {
      const g = await get('/guides/' + id + '?langid=es');
      g._requestedLang = 'es';
      return g;
    } catch (e) {
      const g = await get('/guides/' + id);
      g._requestedLang = 'en';
      return g;
    }
  }

  w.API = { models, wiki, guide, slug };
})(window);
