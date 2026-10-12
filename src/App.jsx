/* ============================================================
   ProMeat — App.jsx
   Global shell: router, body/title classes, header scroll, view
   animation, reveal observer, drawers, search, modal, toasts,
   image fallback.
   ============================================================ */
import React, { useEffect, useRef, useState } from 'react';
import { PM, onModal } from './lib/state.js';
import { usePM, useRoute, useHash } from './lib/hooks.js';
import { onUI, ui } from './lib/ui.js';
import { Header, Footer, TabBar, Scrim, ToastZone, ModalHost } from './components/shell.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import { ProfileDrawer, CartDrawer, FilterDrawer } from './components/drawers.jsx';
import { Page } from './pages/views.jsx';

const ORDER = { store: 1, restaurant: 2, takeaway: 3 };

const TITLES = {
  dash: 'پرومیت | پروتئین، سبک زندگی ماست',
  storeHome: 'فروشگاه | پرومیت',
  category: 'دسته‌بندی | فروشگاه پرومیت',
  product: 'محصول | پرومیت',
  restaurantHome: 'رستوران | پرومیت',
  menu: 'منو | رستوران پرومیت',
  branches: 'شعب | رستوران پرومیت',
  reserve: 'رزرو میز | رستوران پرومیت',
  takeawayHome: 'بیرون‌بر | پرومیت',
  tkCategory: 'دسته‌بندی | بیرون‌بر پرومیت',
  checkout: 'تسویه حساب | پرومیت',
  about: 'درباره پرومیت',
  wallet: 'کیف پول | پرومیت',
  login: 'ورود | پرومیت',
  register: 'ثبت‌نام | پرومیت'
};

export default function App() {
  usePM();

  const route = useRoute();
  /* the shell reacts to every hash change (source: window hashchange → render()) */
  const routeKey = useHash();
  const section = route.section;

  /* ---- shell UI state ---- */
  const [drawer, setDrawer] = useState(null);          /* profile | cart | filters */
  const [scrimSilent, setScrimSilent] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [filterRev, setFilterRev] = useState(0);
  const [viewRev, setViewRev] = useState(0);
  const [stuck, setStuck] = useState(false);

  const viewRef = useRef(null);
  const prevSectionRef = useRef(section);
  const prevRouteKeyRef = useRef(routeKey);
  const firstRoute = useRef(true);

  /* ---- shell overlay wiring ---- */
  useEffect(() => onModal(setModal), []);
  useEffect(() => onUI(evt => {
    if (evt.t === 'drawer') {
      if (evt.v) { setScrimSilent(false); setFilterRev(r => (evt.v === 'filters' ? r + 1 : r)); }
      setDrawer(evt.v);
    } else if (evt.t === 'search') {
      setSearchOpen(evt.v);
    }
  }), []);

  /* ---- view re-render revision (bump() → repaint) ---- */
  useEffect(() => PM.store.subscribe(what => {
    if (what === 'view') setViewRev(v => v + 1);
  }), []);

  /* ---- body classes + section persistence + title ---- */
  useEffect(() => {
    const b = document.body;
    b.classList.toggle('route-dash', route.name === 'dash');
    b.classList.toggle('route-auth', route.name === 'login' || route.name === 'register');
    b.classList.toggle('route-store', section === 'store');
    b.classList.toggle('route-restaurant', section === 'restaurant');
    b.classList.toggle('route-takeaway', section === 'takeaway');
    if (section) PM.section.set(section);
    document.title = TITLES[route.name] || 'پرومیت | پروتئین، سبک زندگی ماست';
  }, [route.name, section]);

  /* ---- hide chrome on dashboard / auth pages ---- */
  const chromeHidden = route.name === 'dash' ||
    route.name === 'login' || route.name === 'register';

  /* ---- no-scroll while an overlay is open ---- */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', !!drawer || searchOpen || !!modal);
  }, [drawer, searchOpen, modal]);

  /* ---- any navigation dismisses drawers + search (source: afterRender) ---- */
  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    setScrimSilent(true);
    setDrawer(null);
    setSearchOpen(false);
    if (prevRouteKeyRef.current !== routeKey) {
      prevRouteKeyRef.current = routeKey;
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [routeKey]);

  /* ---- section transition animation (source: render()) ---- */
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    let anim = 'view-anim';
    if (section && prevSectionRef.current && prevSectionRef.current !== section) {
      anim = ORDER[section] > ORDER[prevSectionRef.current] ? 'slide-next' : 'slide-prev';
    }
    prevSectionRef.current = section;
    el.classList.remove('view-anim', 'slide-next', 'slide-prev');
    void el.offsetWidth;
    el.classList.add(anim);
  }, [viewRev, routeKey, section]);

  /* ---- scroll reveal ----
     The scan has to stay live: a page that swaps part of its tree on a state
     change (the reservation steps) re-creates those nodes without `in`, and a
     one-shot query leaves them at opacity 0 for the rest of the visit. */
  useEffect(() => {
    const root = viewRef.current;
    if (!root) return;
    if (!('IntersectionObserver' in window)) {
      root.querySelectorAll('.reveal:not(.in)').forEach(n => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    const scan = () => root.querySelectorAll('.reveal:not(.in)').forEach((n, i) => {
      n.style.setProperty('--rd', Math.min(i % 6, 5) * 0.05 + 's');
      io.observe(n);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [viewRev, routeKey]);

  /* ---- header stuck ---- */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---- keyboard ---- */
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); return; }
        if (modal) { PM.closeModal(); return; }
        if (drawer) { setScrimSilent(false); setDrawer(null); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ui.openSearch();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, modal, drawer]);

  /* ---- image fallback (source: window error capture) ---- */
  useEffect(() => {
    const onErr = e => {
      const el = e.target;
      if (el && el.tagName === 'IMG') {
        const frame = el.closest ? el.closest('.img-frame') : null;
        if (frame) frame.classList.add('broken');
      }
    };
    window.addEventListener('error', onErr, true);
    return () => window.removeEventListener('error', onErr, true);
  }, []);

  const closeDrawer = () => setDrawer(null);

  return (
    <>
      <Header section={section} hidden={chromeHidden} stuck={stuck} cartN={PM.cart.count()} />

      <main id="view" ref={viewRef} tabIndex={-1} className="view-anim">
        <Page route={route} />
      </main>

      <Footer hidden={chromeHidden} />
      <TabBar section={section} hidden={chromeHidden} />

      <Scrim on={!!drawer} silent={scrimSilent} onClick={closeDrawer} />

      <ProfileDrawer open={drawer === 'profile'} onClose={closeDrawer} />
      <CartDrawer open={drawer === 'cart'} onClose={closeDrawer} />
      <FilterDrawer open={drawer === 'filters'} onClose={closeDrawer} section={section} rev={filterRev} />

      <SearchOverlay open={searchOpen} />

      <ModalHost modal={modal} onClose={() => PM.closeModal()} />
      <ToastZone />
    </>
  );
}
