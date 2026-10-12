/* ============================================================
   ProMeat — reviews.js
   Reviews the user writes are kept in localStorage under
   promeat:userReviews, grouped by product id, and are shown
   above the seeded reviews of the catalogue.
   ============================================================ */
const KEY = 'userReviews';

function readStore() {
  try {
    const raw = localStorage.getItem('promeat:' + KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function writeStore(all) {
  try { localStorage.setItem('promeat:' + KEY, JSON.stringify(all)); } catch (e) {}
}

export function addedReviews(scope) {
  return readStore()[scope] || [];
}

export function addReview(scope, review) {
  const all = readStore();
  all[scope] = [review].concat(all[scope] || []);
  writeStore(all);
}
