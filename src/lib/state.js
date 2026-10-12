/* ============================================================
   ProMeat — state.js  (ES-module port of js/state.js)
   Centralised store: cart · user · favourites · orders ·
   reservations · addresses · section.  Persisted to localStorage.
   ============================================================ */
import { data } from './data.js';

export const PM = {};
PM.data = data;

/* ---------------- persistence ---------------- */
const LS = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('promeat:' + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('promeat:' + key, JSON.stringify(value)); } catch (e) {}
  }
};

/* ---------------- reactive store ---------------- */
PM.store = (function () {
  const listeners = new Set();
  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    emit(what) { listeners.forEach(fn => { try { fn(what || '*'); } catch (e) {} }); }
  };
})();

/* ---------------- item lookup ---------------- */
PM.catalog = function (type, id) {
  const d = PM.data;
  if (type === 'store') return d.byId(d.storeProducts, id);
  if (type === 'restaurant') return d.byId(d.dishes, id);
  if (type === 'takeaway') return d.byId(d.takeawayProducts, id);
  return null;
};

PM.priceFor = function (product, mult) {
  return Math.round(product.price * (mult == null ? 1 : mult));
};

/* default cart line for a product — must mirror what its detail page preselects,
   so a quick “+” on a card and “افزودن” on the detail page hit the SAME line. */
PM.defaultConfig = function (type, product) {
  /* takeaway: mirror the detail page at its default selections (index 0 of every option) */
  if (type === 'takeaway' && product && product.opts) {
    const options = product.opts;
    const labels = [];
    let price = product.price;
    if (options.sizes && options.sizes.length) {
      labels.push(options.sizes[0].label);
      price = Math.round(price * (options.sizes[0].mult || 1));
    }
    if (options.sauces && options.sauces.length) labels.push(options.sauces[0].label);
    if (options.extras && options.extras.length) price += (options.extras[0].price || 0);
    return { variant: labels.join(' · '), price: price };
  }
  if (type === 'store') {
    const weights = product.weights || [{ label: 'یک واحد', mult: 1 }];
    /* with several weights the detail page preselects the second one */
    const selectedWeight = weights[weights.length > 1 ? 1 : 0];
    return { variant: selectedWeight.label, price: PM.priceFor(product, selectedWeight.mult) };
  }
  return { variant: '', price: product.price };
};

/* ---------------- cart ---------------- */
PM.cart = (function () {
  let items = LS.get('cart', []);

  function save() { LS.set('cart', items); PM.store.emit('cart'); }
  function key(type, id, variant) { return type + ':' + id + ':' + (variant || ''); }

  function add(payload, qty) {
    qty = qty || 1;
    const k = key(payload.type, payload.id, payload.variant);
    const found = items.find(i => i.key === k);
    if (found) found.qty = Math.min(99, found.qty + qty);
    else items.push({
      key: k, type: payload.type, id: payload.id, name: payload.name,
      img: payload.img, price: payload.price, unit: payload.unit || '',
      variant: payload.variant || '', qty: qty
    });
    save();
    return k;
  }

  function setQty(k, qty) {
    const i = items.find(x => x.key === k);
    if (!i) return;
    if (qty <= 0) items = items.filter(x => x.key !== k);
    else i.qty = Math.min(99, qty);
    save();
  }

  function remove(k) { items = items.filter(x => x.key !== k); save(); }
  function clear() { items = []; save(); }

  function qtyOf(type, id, variant) {
    /* no variant given → aggregate every variant of that product (cards show one number) */
    if (variant === undefined || variant === null) {
      return items.reduce((a, b) => a + (b.type === type && b.id === id ? b.qty : 0), 0);
    }
    const i = items.find(x => x.key === key(type, id, variant || ''));
    return i ? i.qty : 0;
  }

  /* card stepper: works on the default (plain) line, falls back to the only/first matching line */
  function stepLine(type, id, delta) {
    const lines = items.filter(x => x.type === type && x.id === id);
    if (delta > 0) {
      const plain = lines.filter(x => !x.variant)[0];
      if (plain) { plain.qty = Math.min(99, plain.qty + delta); save(); return; }
      if (lines.length === 1) { lines[0].qty = Math.min(99, lines[0].qty + delta); save(); return; }
      const product = PM.catalog(type, id);
      if (!product) return;
      const cfg = PM.defaultConfig(type, product);
      add({ type: type, id: id, name: product.name, img: product.img, price: cfg.price, unit: product.unit, variant: cfg.variant }, delta);
      return;
    }
    if (!lines.length) return;
    const plain = lines.filter(x => !x.variant)[0];
    setQty((plain || lines[0]).key, (plain || lines[0]).qty + delta);
  }

  function find(type, id) { return items.filter(x => x.type === type && x.id === id); }

  function count() { return items.reduce((a, b) => a + b.qty, 0); }
  function subtotal() { return items.reduce((a, b) => a + b.price * b.qty, 0); }
  function discount() {
    const s = subtotal();
    if (s >= 2000000) return Math.round(s * 0.08);
    if (s >= 1000000) return Math.round(s * 0.05);
    return 0;
  }
  function shipping(method) {
    if (!items.length) return 0;
    const s = subtotal();
    if (s >= 3000000) return 0;
    return method === 'fast' ? 79000 : 45000;
  }
  function total(method) {
    return Math.max(0, subtotal() - discount() + shipping(method));
  }

  return {
    get items() { return items; },
    add, setQty, remove, clear, qtyOf, stepLine, find, count, subtotal, discount, shipping, total,
    key
  };
})();

/* ---------------- favourites ---------------- */
PM.fav = (function () {
  let list = LS.get('favorites', []);          /* ["store:st-01", ...] */
  const save = () => { LS.set('favorites', list); PM.store.emit('favorites'); };
  const k = (type, id) => type + ':' + id;
  return {
    get list() { return list; },
    has(type, id) { return list.indexOf(k(type, id)) !== -1; },
    toggle(type, id) {
      const i = list.indexOf(k(type, id));
      if (i === -1) { list.push(k(type, id)); save(); return true; }
      list.splice(i, 1); save(); return false;
    },
    items() {
      return list.map(s => {
        const p = s.split(':');
        const prod = PM.catalog(p[0], p[1]);
        return prod ? { type: p[0], id: p[1], product: prod } : null;
      }).filter(Boolean);
    }
  };
})();

/* ---------------- user / auth ---------------- */
PM.auth = (function () {
  let user = LS.get('user', null);
  const save = () => { LS.set('user', user); PM.store.emit('user'); };
  return {
    get user() { return user; },
    get isLogged() { return !!user; },
    login(phone, pass, name) {
      user = {
        name: name || user && user.name || 'کاربر پرومیت',
        phone: phone,
        since: (user && user.since) || 'عضو از مرداد ۱۴۰۴'
      };
      save(); return user;
    },
    register(data) {
      user = { name: (data.first + ' ' + data.last).trim(), phone: data.phone, since: 'عضو از امروز' };
      save(); return user;
    },
    update(patch) { user = Object.assign({}, user, patch); save(); },
    logout() { user = null; save(); }
  };
})();

/* ---------------- orders / reservations / addresses ---------------- */
PM.orders = (function () {
  let list = LS.get('orders', null);
  if (list === null) list = PM.data.mockOrders.slice();
  const save = () => { LS.set('orders', list); PM.store.emit('orders'); };
  return {
    get list() { return list; },
    create(o) { list = [o].concat(list); save(); return o; },
    byId(id) { return list.find(o => o.id === id) || null; }
  };
})();

PM.reservations = (function () {
  let list = LS.get('reservations', null);
  if (list === null) list = PM.data.mockReservations.slice();
  const save = () => { LS.set('reservations', list); PM.store.emit('reservations'); };
  return {
    get list() { return list; },
    create(r) { list = [r].concat(list); save(); return r; },
    byId(id) { return list.find(r => r.id === id) || null; }
  };
})();

PM.addresses = (function () {
  let list = LS.get('addresses', null);
  if (list === null) list = PM.data.mockAddresses.slice();
  const save = () => { LS.set('addresses', list); PM.store.emit('addresses'); };
  return {
    get list() { return list; },
    add(a) { a.id = a.id || ('ad-' + Date.now()); list.push(a); save(); return a; },
    remove(id) { list = list.filter(a => a.id !== id); save(); },
    byId(id) { return list.find(a => a.id === id) || null; },
    get first() { return list[0] || null; }
  };
})();

/* ---------------- current section ---------------- */
PM.section = (function () {
  let current = LS.get('section', 'store');
  return {
    get id() { return current; },
    set(id) { if (id && id !== current) { current = id; LS.set('section', id); PM.store.emit('section'); } }
  };
})();

/* ---------------- toast (rendered by React <ToastZone/>) ---------------- */
const toastListeners = new Set();
export function onToast(fn) { toastListeners.add(fn); return () => toastListeners.delete(fn); }
PM.toast = function (msg, ok) {
  toastListeners.forEach(fn => { try { fn(msg, ok); } catch (e) {} });
};

/* ---------------- modal host (rendered by React <ModalHost/>) ---------------- */
const modalListeners = new Set();
export function onModal(fn) { modalListeners.add(fn); return () => modalListeners.delete(fn); }
PM.modal = function (title, body, foot) {
  modalListeners.forEach(fn => { try { fn({ title: title, body: body, foot: foot || '' }); } catch (e) {} });
};
PM.closeModal = function () {
  modalListeners.forEach(fn => { try { fn(null); } catch (e) {} });
};

export default PM;
