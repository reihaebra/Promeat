/* ============================================================
   ProMeat — router.js
   Hash-route grammar: URL → route descriptor.  Pure functions,
   no React and no DOM, so the whole route table lives in one
   readable place (hooks.js turns it into state).
   ============================================================ */

export function parseHash(raw) {
  const path = (raw || '#/').replace(/^#/, '') || '/';
  const q = path.indexOf('?');
  const query = q === -1 ? '' : path.slice(q + 1);
  const file = q === -1 ? path : path.slice(0, q);
  return {
    segments: file.split('/').filter(Boolean),
    path: file,
    query: query
  };
}

/* query string → plain object; pairs without a value are ignored */
function parseQuery(query) {
  const out = {};
  query.split('&').forEach(pair => {
    const eq = pair.indexOf('=');
    if (eq > 0) out[pair.slice(0, eq)] = pair.slice(eq + 1);
  });
  return out;
}

/* route descriptor: { name, section, ...params }  — name selects the page */
export function resolveUrl(raw) {
  const route = parseHash(raw);
  const p = route.segments;
  const q = parseQuery(route.query);
  if (!p.length) return { name: 'dash', section: null };

  const root = p[0];

  if (root === 'store') {
    if (p[1] === 'c' && p[2]) return { name: 'category', cat: p[2], section: 'store' };
    return { name: 'storeHome', section: 'store' };
  }
  if (root === 'p' && p[1]) return { name: 'product', id: p[1], section: 'store' };
  if (root === 'checkout') return { name: 'checkout', section: 'store' };
  if (root === 'order' && p[1] && p[2] === 'done') return { name: 'orderDone', id: p[1], section: 'store' };

  if (root === 'restaurant') {
    if (p[1] === 'branches') return { name: 'branches', section: 'restaurant' };
    if (p[1] === 'menu') return { name: 'menu', section: 'restaurant', q: q };
    if (p[1] === 'dish' && p[2]) return { name: 'dish', id: p[2], section: 'restaurant' };
    if (p[1] === 'reserve') {
      if (p[2] === 'done') return { name: 'reserveDone', id: p[3], section: 'restaurant' };
      return { name: 'reserve', section: 'restaurant' };
    }
    return { name: 'restaurantHome', section: 'restaurant' };
  }

  if (root === 'takeaway') {
    if (p[1] === 'c' && p[2]) return { name: 'tkCategory', cat: p[2], section: 'takeaway' };
    return { name: 'takeawayHome', section: 'takeaway' };
  }
  if (root === 'tk' && p[1]) return { name: 'tkProduct', id: p[1], section: 'takeaway' };

  if (root === 'auth') return { name: p[1] === 'register' ? 'register' : 'login', section: null };

  const ACCOUNT_ROUTES = ['account', 'orders', 'reservations', 'favorites', 'addresses', 'settings', 'wallet'];
  if (ACCOUNT_ROUTES.indexOf(root) !== -1) return { name: root, section: null };

  if (root === 'about') return { name: 'about', section: null };

  return { name: 'notFound', section: null };
}
