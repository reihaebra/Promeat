/* ============================================================
   ProMeat — shell.jsx
   Header · Footer · TabBar · Scrim · Toast zone · Modal host
   (faithful JSX port of the static markup in index.html)
   ============================================================ */
import React, { useEffect, useRef, useState } from 'react';
import { PM, onToast } from '../lib/state.js';
import { svg } from './icons.jsx';
import { ui } from '../lib/ui.js';
import { toPersianDigits } from '../utils/format.js';

const NAV = [
  { id: 'store', href: '#/store', fa: 'فروشگاه', icon: 'store' },
  { id: 'restaurant', href: '#/restaurant', fa: 'رستوران', icon: 'utensils' },
  { id: 'takeaway', href: '#/takeaway', fa: 'بیرون‌بر', icon: 'moto' }
];

const TAB_SEC = {
  store: { href: '#/store', label: 'دسته‌بندی' },
  restaurant: { href: '#/restaurant/menu', label: 'منو' },
  takeaway: { href: '#/takeaway', label: 'دسته‌بندی' }
};

function NavCard({ item, active, onNav }) {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: 'var(--r-lg)',
    color: 'var(--white)',
    fontSize: '12px',
    textDecoration: 'none',
  };
  const activeStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    color: 'var(--red)',
  };
  const style = active ? { ...baseStyle, ...activeStyle } : { ...baseStyle };
  return (
    <a
      className="nav-card"
      style={style}
      href={item.href}
      data-section={item.id}
      aria-current={active ? 'page' : undefined}
      onClick={onNav}
    >
      <span
        className="nico"
        data-icon={item.icon}
        style={active ? { background: 'rgba(255, 255, 255, 0.06)', color: 'var(--red)' } : undefined}
      >{svg(item.icon)}</span>
      <span className="nlab">{item.fa}</span>
    </a>
  );
}

/* ---------- compact header section selector ----------
   Below the compact-header step the three section cards no longer fit beside the
   logo and the actions, so they collapse into one control naming the section the
   route is already in. `section` comes from the router (route.section), which
   resolves nested routes too — /restaurant/menu and /takeaway/c/fried report
   their parent section — so no second source of truth is needed. NAV is reused
   for both the desktop cards and the option list, and the option hrefs are the
   existing landing routes, so navigation stays the router's business. */
function SectionSwitch({ section }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const btn = useRef(null);
  const cur = NAV.filter(n => n.id === section)[0] || null;

  useEffect(() => {
    if (!open) return;
    const onDown = e => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  /* move the caret into the list once it exists (the panel is only mounted while
     open), starting on the section the visitor is already in */
  useEffect(() => {
    if (!open || !wrap.current) return;
    const nodes = wrap.current.querySelectorAll('[role="menuitem"]');
    let i = 0;
    nodes.forEach((n, k) => { if (n.getAttribute('data-id') === section) i = k; });
    if (nodes[i] && document.activeElement !== nodes[i]) nodes[i].focus();
  }, [open, section]);

  const items = () => (wrap.current ? Array.prototype.slice.call(wrap.current.querySelectorAll('[role="menuitem"]')) : []);

  const onKey = e => {
    const k = e.key;
    if (k === 'Escape') {
      if (!open) return;
      e.preventDefault();
      setOpen(false);
      if (btn.current) btn.current.focus();
      return;
    }
    if (!open) {
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (k === 'Tab') { setOpen(false); return; }
    const nodes = items();
    const i = nodes.indexOf(document.activeElement);
    if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Home' || k === 'End') {
      e.preventDefault();
      if (!nodes.length) return;
      const next = k === 'Home' ? 0
        : k === 'End' ? nodes.length - 1
        : (i + (k === 'ArrowDown' ? 1 : -1) + nodes.length) % nodes.length;
      nodes[next].focus();
    }
  };

  return (
    <div className={'section-switch' + (open ? ' open' : '')} ref={wrap} onKeyDown={onKey}>
      <button
        type="button"
        className="ss-btn"
        ref={btn}
        id="sectionSwitchBtn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? 'sectionMenu' : undefined}
        onClick={() => setOpen(o => !o)}
      >
        <span className="ss-ico" data-icon={cur ? cur.icon : 'grid'}>{svg(cur ? cur.icon : 'grid')}</span>
        <span className="ss-lab">{cur ? cur.fa : 'بخش‌ها'}</span>
        <span className="ss-chev" aria-hidden="true">{svg('chevD')}</span>
      </button>

      {open ? (
        <div className="ss-menu" id="sectionMenu" role="menu" aria-label="بخش‌های پرومیت">
          {NAV.map(n => (
            <a
              className={'ss-item' + (cur && n.id === cur.id ? ' on' : '')}
              href={n.href}
              role="menuitem"
              data-id={n.id}
              key={n.id}
              onClick={() => setOpen(false)}
            >
              <span className="ss-ico" data-icon={n.icon}>{svg(n.icon)}</span>
              <span>{n.fa}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ================= GLOBAL HEADER ================= */
export function Header({ section, hidden, stuck }) {
  const user = PM.auth.user;
  const n = PM.cart.count();
  return (
    <header className={'site-header' + (hidden ? ' hide' : '') + (stuck ? ' is-stuck' : '')} id="siteHeader">
      <div className="header-shell">
        <div className="header-bar" id="headerBar">

          <a className="logo-link" href="#/" id="headerLogo" aria-label="پرومیت — صفحه اصلی">
            <img className="logo-cow" src="assets/logo/cow-white.png" alt="" />
            <img className="logo-word" src="assets/logo/wordmark-white.png" alt="پرومیت promeat" />
          </a>

          <nav className="header-nav" id="headerNav" aria-label="بخش‌های اصلی">
            {NAV.map(it => (
              <NavCard key={it.id} item={it} active={!!section && section === it.id} />
            ))}
          </nav>

          <SectionSwitch section={section} />

          <div className="header-actions">
            <button className="icon-btn" type="button" onClick={() => ui.openSearch()} aria-label="جستجو">
              <span data-icon="search">{svg('search')}</span>
            </button>
            <button className="icon-btn" type="button" id="cartBtn" onClick={() => ui.openCart()} aria-label="سبد خرید">
              <span data-icon="cart">{svg('cart')}</span>
              <span className={'badge-dot' + (n ? '' : ' hide')} id="cartCount">{toPersianDigits(Math.min(99, n))}</span>
            </button>
            <button
              className="icon-btn"
              type="button"
              id="profileBtn"
              onClick={() => ui.openProfile()}
              aria-label={user ? 'حساب کاربری' : 'ورود به حساب کاربری'}
              aria-expanded="false"
            >
              <span data-icon={user ? 'user' : 'login'}>{svg(user ? 'user' : 'login')}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

/* ================= FOOTER ================= */
export function Footer({ hidden }) {
  return (
    <footer className={'site-footer' + (hidden ? ' hide' : '')} id="siteFooter">
      <div className="shell">
        <div className="footer-grid">
          <div className="f-brand">
            <img className="f-logo" src="assets/logo/logo-white.png" alt="پرومیت promeat" />
            <p>عرضه مستقیم محصولات پروتئینی، رستوران و بیرون‌بر؛ از دل مزرعه تا سفره‌ی شما، با تضمین تازگی و کیفیت استاندارد.</p>
            <div className="socials">
              <a href="#/" aria-label="اینستاگرام" data-icon="instagram">{svg('instagram')}</a>
              <a href="#/" aria-label="تلگرام" data-icon="telegram">{svg('telegram')}</a>
              <a href="#/" aria-label="واتساپ" data-icon="whatsapp">{svg('whatsapp')}</a>
              <a href="#/" aria-label="تماس" data-icon="phone">{svg('phone')}</a>
            </div>
          </div>

          <div className="f-col">
            <h4>پرومیت</h4>
            <ul>
              <li><a href="#/about">درباره پرومیت</a></li>
              <li><a href="#/store">فروشگاه</a></li>
              <li><a href="#/restaurant">رستوران</a></li>
              <li><a href="#/takeaway">بیرون‌بر</a></li>
              <li><a href="#/restaurant/branches">شعب</a></li>
            </ul>
          </div>

          <div className="f-col">
            <h4>دسترسی سریع</h4>
            <ul>
              <li><a href="#/orders">سفارش‌های من</a></li>
              <li><a href="#/reservations">رزروهای من</a></li>
              <li><a href="#/favorites">علاقه‌مندی‌ها</a></li>
              <li><a href="#/addresses">آدرس‌های من</a></li>
              <li><a href="#/settings">تنظیمات</a></li>
            </ul>
          </div>

          <div className="f-col">
            <h4>تماس و پشتیبانی</h4>
            <ul className="f-contact">
              <li><span data-icon="phone">{svg('phone')}</span><span className="latin" style={{ letterSpacing: '.06em' }}>۰۲۱-۹۱۰۰۲۲۴۵</span></li>
              <li><span data-icon="clock">{svg('clock')}</span><span>همه‌روزه ۹ صبح تا ۱۲ بی‌شب</span></li>
              <li><span data-icon="pin">{svg('pin')}</span><span>تهران، خیابان ولیعصر، برج نور</span></li>
              <li><span data-icon="mail">{svg('mail')}</span><span className="latin" style={{ letterSpacing: '.04em' }}>support@promeat.ir</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bar">
          <span>© ۱۴۰۴ پرومیت — تمامی حقوق محفوظ است.</span>
        </div>
      </div>
    </footer>
  );
}

/* ================= MOBILE TAB BAR ================= */
export function TabBar({ section, hidden }) {
  const home = !section;
  const sec = TAB_SEC[section];
  const n = PM.cart.count();
  return (
    <nav className={'tabbar' + (hidden ? ' hide' : '')} id="tabbar" aria-label="ناوبری سریع">
      <div className="tabbar-inner">
        <a
          className={'tab-item' + (home ? ' active' : '')}
          href="#/"
          data-tab="home"
          aria-current={home ? 'page' : undefined}
        >
          <span data-icon="home">{svg('home')}</span><span>خانه</span>
        </a>
        <a
          className={'tab-item' + (sec ? ' active' : '')}
          href={sec ? sec.href : '#/store'}
          data-tab="sec"
          aria-current={sec ? 'page' : undefined}
        >
          <span data-icon="grid">{svg('grid')}</span>
          <span data-tab-label="">{sec ? sec.label : 'دسته‌بندی'}</span>
        </a>
        <button className="tab-item" type="button" id="tabCartBtn" onClick={() => ui.openCart()} aria-label="سبد خرید">
          <span className="tab-ico" data-icon="cart">
            {svg('cart')}
            <span className={'badge-dot' + (n ? '' : ' hide')} id="cartCountTab">{toPersianDigits(Math.min(99, n))}</span>
          </span>
          <span>سبد خرید</span>
        </button>
        <button className="tab-item" type="button" id="tabProfileBtn" onClick={() => ui.openProfile()}>
          <span data-icon="user">{svg('user')}</span><span>حساب کاربری</span>
        </button>
      </div>
    </nav>
  );
}

/* ================= SCRIM ================= */
export function Scrim({ on, silent, onClick }) {
  const [hidden, setHidden] = useState(true);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (on) {
      setHidden(false);
      const id = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(id);
    }
    if (silent) {
      /* source: closeAllDrawers(true) hides the scrim immediately */
      setOpen(false);
      setHidden(true);
      return;
    }
    setOpen(false);
    const id = setTimeout(() => setHidden(true), 320);
    return () => clearTimeout(id);
  }, [on, silent]);
  return <div className={'scrim' + (open ? ' open' : '')} id="scrim" hidden={hidden || undefined} onClick={onClick} />;
}

/* ================= TOAST ZONE ================= */
export function ToastZone() {
  const [list, setList] = useState([]);
  const idRef = useRef(0);
  useEffect(() => onToast((msg, ok) => {
    const id = ++idRef.current;
    setList(l => l.concat([{ id: id, msg: msg, ok: ok }]));
    setTimeout(() => setList(l => l.filter(x => x.id !== id)), 3100);
  }), []);
  return (
    <div className="toast-zone" id="toastZone" role="status" aria-live="polite">
      {list.map(t => (
        <div className={'toast' + (t.ok ? ' ok' : '')} key={t.id}>
          {svg(t.ok ? 'checkCircle' : 'info')}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ================= MODAL HOST ================= */
export function ModalHost({ modal, onClose }) {
  if (!modal) return null;
  const m = modal;
  const close = onClose;
  const html = v => (typeof v === 'string' ? { __html: v } : null);
  return (
    <div className="modal-wrap" data-modal="" onClick={e => { if (e.target.classList.contains('modal-wrap')) close(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="پنجره">
        <div className="modal-head">
          <h3>{m.title}</h3>
          <button className="icon-btn" type="button" data-close-modal="" onClick={close} aria-label="بستن">{svg('close')}</button>
        </div>
        <div className="modal-body">
          {typeof m.body === 'string'
            ? <div dangerouslySetInnerHTML={html(m.body)} />
            : m.body}
          {m.foot ? (
            typeof m.foot === 'string'
              ? <div className="row mt-3" style={{ gap: '10px' }} dangerouslySetInnerHTML={html(m.foot)} />
              : <div className="row mt-3" style={{ gap: '10px' }}>{m.foot}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
