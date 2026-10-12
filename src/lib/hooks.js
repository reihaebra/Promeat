/* ============================================================
   ProMeat — hooks.js
   usePM()    : re-render on any PM.store emission
   useRoute() : hash router (route grammar lives in router.js)
   go()       : hash navigation (re-renders even when the hash is unchanged)
   bump()     : repaint the current view after module-level state changes
   ============================================================ */
import { useEffect, useState } from 'react';
import { PM } from './state.js';
import { resolveUrl } from './router.js';

/* -------- global re-render bus -------- */
export function usePM() {
  const [, setTick] = useState(0);
  useEffect(() => PM.store.subscribe(() => setTick(t => t + 1)), []);
}

/* bump() forces a re-render of every usePM() consumer (module-level view state) */
export function bump() { PM.store.emit('view'); }

/* -------- router -------- */
export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return hash;
}

export function useRoute() {
  return resolveUrl(useHash());
}

export function go(hash) {
  if (window.location.hash === hash) bump();
  else window.location.hash = hash;
}
