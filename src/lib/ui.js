/* ============================================================
   ProMeat — ui.js
   Tiny event bus so any component can drive the shell
   (drawers / search / modal) without prop drilling.
   ============================================================ */
const subs = new Set();

export function onUI(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

function emit(evt) {
  subs.forEach(fn => { try { fn(evt); } catch (e) {} });
}

export const ui = {
  openProfile: () => emit({ t: 'drawer', v: 'profile' }),
  openCart: () => emit({ t: 'drawer', v: 'cart' }),
  openFilters: () => emit({ t: 'drawer', v: 'filters' }),
  closeDrawer: () => emit({ t: 'drawer', v: null }),
  openSearch: () => emit({ t: 'search', v: true }),
  closeSearch: () => emit({ t: 'search', v: false })
};

export default ui;
