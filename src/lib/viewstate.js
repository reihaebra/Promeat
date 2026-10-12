/* ============================================================
   ProMeat — viewstate.js
   Listing view state.  Every section (store / restaurant /
   takeaway) owns ONE filter record, so a filter set on one
   listing can never leak into another.  Mutate + bump() to
   re-render.
   ============================================================ */
import { data } from './data.js';

/* ---------------- category scope of each listing ---------------- */
export const menuState = { cat: 'all' };
export const takeawayState = { cat: 'all' };

/* ---------------- per-section filter records ---------------- */
function blank() {
  return { sort: 'new', types: [], min: null, max: null, minRate: 0, popular: false, page: 1 };
}
const states = { store: blank(), restaurant: blank(), takeaway: blank() };

export function isFilterable(section) { return !!states[section]; }
export function filtersFor(section) { return states[section] || states.store; }
export function resetFilters(section) { Object.assign(filtersFor(section), blank()); }

export const SORTS = [
  { id: 'new', fa: 'جدیدترین' },
  { id: 'best', fa: 'پرفروش‌ترین' },
  { id: 'pop', fa: 'محبوب‌ترین' },
  { id: 'cheap', fa: 'ارزان‌ترین' },
  { id: 'exp', fa: 'گران‌ترین' }
];

/* ---------------- product-type options (identical everywhere) ---------------- */
export const TYPE_DISCOUNT = 'تخفیف‌دار';
export const TYPE_BEST = 'پرفروش';
export const TYPE_OPTIONS = [TYPE_DISCOUNT, TYPE_BEST];

/* Only fields the data already carries are read here: `old` (a real previous
   price) and the `پرفروش` badge.  Nothing is inferred or invented. */
function typeMatch(type, p) {
  if (type === TYPE_DISCOUNT) return !!p.old;
  if (type === TYPE_BEST) return p.badge === TYPE_BEST;
  return p.badge === type;
}

/* «محبوبیت» toggle threshold — unchanged from the original listing code */
export const POP_SCORE = 85;

/* ---------------- store category (set by the category page) ---------------- */
let storeCat = 'beef';
export function setStoreCat(c) { storeCat = c; return storeCat; }

/* ---------------- the dataset a section is currently listing ---------------- */
export function sectionItems(section) {
  if (section === 'restaurant') {
    return menuState.cat === 'all' ? data.dishes : data.dishes.filter(p => p.cat === menuState.cat);
  }
  if (section === 'takeaway') {
    return takeawayState.cat === 'all' ? data.takeawayProducts : data.takeawayProducts.filter(p => p.cat === takeawayState.cat);
  }
  return data.storeProducts.filter(p => p.cat === storeCat);
}

/* ---------------- price bounds, derived from the listed items ---------------- */
export const PRICE_STEP = 10000;      /* تومان */

export function priceBounds(items) {
  let lo = Infinity, hi = -Infinity;
  for (const p of items) {
    const v = Number(p.price) || 0;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (lo === Infinity) { lo = 0; hi = PRICE_STEP; }
  lo = Math.floor(lo / PRICE_STEP) * PRICE_STEP;
  hi = Math.ceil(hi / PRICE_STEP) * PRICE_STEP;
  if (hi <= lo) hi = lo + PRICE_STEP;
  return { lo: lo, hi: hi, step: PRICE_STEP };
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

/* the resolved pair for a section: never inverted, always inside the data bounds */
export function priceRange(section) {
  const bounds = priceBounds(sectionItems(section));
  const f = filtersFor(section);
  let lo = f.min == null ? bounds.lo : clamp(f.min, bounds.lo, bounds.hi);
  let hi = f.max == null ? bounds.hi : clamp(f.max, bounds.lo, bounds.hi);
  if (lo > hi) { const t = lo; lo = hi; hi = t; }
  return { lo: lo, hi: hi, bounds: bounds };
}

export function setPriceRange(section, lo, hi) {
  const bounds = priceBounds(sectionItems(section));
  const f = filtersFor(section);
  f.min = clamp(Number(lo) || 0, bounds.lo, bounds.hi);
  f.max = clamp(Number(hi) || 0, bounds.lo, bounds.hi);
  if (f.min > f.max) { const t = f.min; f.min = f.max; f.max = t; }
}

export function clearPriceRange(section) {
  const f = filtersFor(section);
  f.min = null; f.max = null;
}

/* ---------------- filter + sort pipeline shared by every listing ---------------- */
export function applyFilters(list, section) {
  const f = filtersFor(section);
  const bounds = priceBounds(list);

  let lo = f.min == null ? bounds.lo : clamp(f.min, bounds.lo, bounds.hi);
  let hi = f.max == null ? bounds.hi : clamp(f.max, bounds.lo, bounds.hi);
  if (lo > hi) { const t = lo; lo = hi; hi = t; }

  let out = list.slice();
  if (f.types.length) out = out.filter(p => f.types.some(t => typeMatch(t, p)));
  out = out.filter(p => p.price >= lo && p.price <= hi);
  if (f.minRate) out = out.filter(p => (p.rating || 0) >= f.minRate);
  if (f.popular) out = out.filter(p => (p.pop || 0) >= POP_SCORE);

  /* every branch is an explicit ranking; the default is newest-first */
  if (f.sort === 'cheap') out.sort((a, b) => a.price - b.price);
  else if (f.sort === 'exp') out.sort((a, b) => b.price - a.price);
  else if (f.sort === 'best') out.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  else if (f.sort === 'pop') out.sort((a, b) => (b.pop || 0) - (a.pop || 0));
  else out.sort((a, b) => (b.date || 0) - (a.date || 0));
  return out;
}

export function activeFilterCount(section) {
  const f = filtersFor(section);
  return f.types.length +
    (f.min != null || f.max != null ? 1 : 0) +
    (f.minRate ? 1 : 0) +
    (f.popular ? 1 : 0);
}

/* ---------------- category switching ---------------- */
export function setMenuCat(c) {
  menuState.cat = c;
  filtersFor('restaurant').page = 1;
}
