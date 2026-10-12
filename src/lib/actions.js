/* ============================================================
   ProMeat — actions.js
   Shared interaction handlers (port of the delegated actions in
   js/app.js), re-used by every component/page.
   ============================================================ */
import { PM } from './state.js';
import { Wallet } from './wallet.js';
import { go, bump } from './hooks.js';
import { addReview } from './reviews.js';
import { rsv, rsvReset } from './rsv.js';
import { filtersFor, resetFilters, setMenuCat } from './viewstate.js';
import { ui } from './ui.js';

/* ---------- add to cart (card “+”) ---------- */
export function addToCart(type, id) {
  if (!PM.auth.user) {
    PM.toast('ابتدا وارد حساب کاربری خود شوید.', false);
    return;
  }
  const p = PM.catalog(type, id);
  if (!p) return;
  const cfg = PM.defaultConfig(type, p);
  PM.cart.add({
    type: type, id: id, name: p.name, img: p.img,
    price: cfg.price, unit: p.unit, variant: cfg.variant
  }, 1);
  PM.toast('به سبد خرید اضافه شد', true);
}

/* ---------- qty stepper with "key" (cards, cart drawer, rsv pre-order) ---------- */
export function stepKey(rawKey, delta) {
  const parts = rawKey.split(':');
  if (parts[0] === 'rsv') {
    const id = parts[1];
    const next = (rsv.food[id] || 0) + delta;
    if (next <= 0) delete rsv.food[id];
    else rsv.food[id] = Math.min(20, next);
    PM.store.emit('rsv');
    return;
  }
  if (parts.length > 2 && parts[2]) {
    PM.cart.setQty(rawKey, PM.cart.qtyOf(parts[0], parts[1], parts[2]) + delta);
  } else {
    PM.cart.stepLine(parts[0], parts[1], delta);
  }
}

export function delKey(key) {
  PM.cart.remove(key);
  PM.toast('از سبد حذف شد');
}

/* ---------- favourites ---------- */
export function favToggle(type, id) {
  if (!PM.auth.user) {
    PM.toast('ابتدا وارد حساب کاربری خود شوید.', false);
    return false;
  }
  const on = PM.fav.toggle(type, id);
  PM.toast(on ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد', on);
  return on;
}

/* ---------- product detail: add from detail page ---------- */
export function addFromDetail(cfg) {
  /* cfg: { type, id, isTk, qty, mult, extra, variant } */
  if (!PM.auth.user) {
    PM.toast('ابتدا وارد حساب کاربری خود شوید.', false);
    return;
  }
  const p = PM.catalog(cfg.type, cfg.id);
  if (!p) return;
  if (cfg.isTk) {
    PM.cart.add({
      type: 'takeaway', id: cfg.id, name: p.name, img: p.img,
      price: Math.round(p.price * cfg.mult) + cfg.extra,
      unit: p.unit, variant: cfg.variant
    }, cfg.qty);
  } else {
    PM.cart.add({
      type: cfg.type, id: cfg.id, name: p.name, img: p.img,
      price: PM.priceFor(p, cfg.mult), unit: p.unit, variant: cfg.variant || ''
    }, cfg.qty);
  }
  PM.toast('به سبد خرید اضافه شد', true);
}

/* ---------- reservation ---------- */
export function confirmReservation() {
  const data = PM.data;
  const branch = data.byId(data.branches, rsv.branch) || data.branches[0];
  const food = Object.keys(rsv.food).map(id => {
    const dish = data.byId(data.dishes, id);
    return { name: dish.name, qty: rsv.food[id] };
  });
  const n = 2500 + Math.floor(Math.random() * 400);
  const rec = PM.reservations.create({
    id: 'RS-' + n, num: String(n), branch: branch.fa,
    day: rsv.day, month: rsv.month, dateFull: rsv.dateFull,
    time: rsv.time, guests: rsv.guests, table: rsv.table,
    status: 'confirmed', food: food
  });
  rsvReset();
  PM.toast('رزرو شما با موفقیت ثبت شد', true);
  go('#/restaurant/reserve/done/' + rec.id);
}

/* ---------- checkout ---------- */
export async function submitCheckout(fast, name, addr, method) {
  const cart = PM.cart;
  if (!cart.items.length) return;
  const finalAddr = (addr && addr.trim()) ||
    (PM.addresses.first ? PM.addresses.first.text : 'تهران، سعادت‌آباد، خیابان علامه شمالی');
  const num = 10500 + PM.orders.list.length + Math.floor(Math.random() * 40);
  const id = 'PM-' + num;
  const total = cart.total(fast ? 'fast' : 'normal');

  /* wallet is one optional method among the others: the order is only created
     once the ledger really debited it, and a repeated submit for the same order
     id never debits twice. */
  if (method === 'wallet') {
    const charge = await Wallet.pay({ orderId: id, amount: total });
    if (!charge.ok) { PM.toast(charge.error || 'پرداخت با کیف پول انجام نشد.', false); return; }
    if (charge.already) { go('#/order/' + id + '/done'); return; }
  }

  PM.orders.create({
    id: id,
    date: '۲۸ مرداد ۱۴۰۴',
    status: 'processing',
    total: total,
    ship: fast ? 'ارسال سریع' : 'ارسال عادی',
    pay: method === 'wallet' ? 'کیف پول' : method === 'cod' ? 'پرداخت در محل' : 'درگاه آنلاین',
    address: (name || 'آدرس پیش‌فرض') + ' — ' + finalAddr,
    items: cart.items.map(i => ({ name: i.name, qty: i.qty, price: i.price, img: i.img }))
  });
  cart.clear();
  PM.toast('سفارش شما با موفقیت ثبت شد', true);
  go('#/order/' + id + '/done');
}

/* ---------- review submit ---------- */
export function reviewSubmit(e, scope, rate) {
  e.preventDefault();
  const f = e.target;
  const name = f.querySelector('[name=name]').value.trim();
  const text = f.querySelector('[name=text]').value.trim();
  const rating = parseInt(rate || f.dataset.rating || '5', 10);
  if (!name || !text) { PM.toast('نام و متن دیدگاه را کامل کنید'); return; }
  addReview(scope, { name: name, text: text, rating: rating, date: 'همین حالا' });
  PM.toast('دیدگاه شما ثبت شد', true);
  PM.store.emit('reviews');
  setTimeout(() => {
    const el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
}

/* ---------- misc data-act actions ---------- */
export function handleAction(name, section) {
  switch (name) {
    case 'apply-filters':
      filtersFor(section).page = 1;
      ui.closeDrawer();
      bump();
      PM.toast('فیلترها اعمال شد', true);
      break;
    case 'clear-filters':
      resetFilters(section);
      ui.closeDrawer();
      bump();
      break;
    case 'menu-all':
      setMenuCat('all');
      resetFilters('restaurant');
      bump();
      break;
    case 'clear-cart':
      PM.cart.clear(); PM.toast('سبد خرید خالی شد'); break;
    case 'save-profile': {
      const n = (document.getElementById('sName') || {}).value;
      const ph = (document.getElementById('sPhone') || {}).value;
      if (n && ph && n.trim() && ph.trim()) {
        PM.auth.update({ name: n.trim(), phone: ph.trim() });
        PM.toast('اطلاعات ذخیره شد', true);
      }
      bump();
      break;
    }
    case 'edit-profile': go('#/settings'); break;
    case 'reset-data':
      ['cart', 'favorites', 'user', 'orders', 'reservations', 'addresses', 'section', 'userReviews']
        .forEach(k => { try { localStorage.removeItem('promeat:' + k); } catch (err) {} });
      PM.toast('داده‌های محلی پاک شد', true);
      setTimeout(() => location.reload(), 500);
      break;
    default: break;
  }
}
