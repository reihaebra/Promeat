/* ============================================================
   ProMeat — drawers.jsx
   Profile drawer · Cart drawer · Filters drawer (port of the
   PM.views.*Drawer builders + app.js drawer wiring)
   ============================================================ */
import React from 'react';
import { PM } from '../lib/state.js';
import { svg } from './icons.jsx';
import { ui } from '../lib/ui.js';
import { handleAction } from '../lib/actions.js';
import { Empty, Summary, CartItem, RangeSlider } from './ui.jsx';
import { bump } from '../lib/hooks.js';
import { Wallet } from '../lib/wallet.js';
import {
  filtersFor, isFilterable, resetFilters, sectionItems, priceRange,
  setPriceRange, clearPriceRange, TYPE_OPTIONS
} from '../lib/viewstate.js';
import { toPersianDigits, formatAmount, escapeHtml } from '../utils/format.js';

/* ---------- shared ACCOUNT_NAV (§4: account items only) ---------- */
export const ACCOUNT_NAV = [
  { id: 'account', fa: 'حساب کاربری', icon: 'user' },
  { id: 'orders', fa: 'سفارش‌های من', icon: 'box' },
  { id: 'reservations', fa: 'رزروهای من', icon: 'calendar' },
  { id: 'favorites', fa: 'علاقه‌مندی‌ها', icon: 'heart' },
  { id: 'addresses', fa: 'آدرس‌های من', icon: 'pin' },
  { id: 'wallet', fa: 'کیف پول', icon: 'wallet' },
  { id: 'settings', fa: 'تنظیمات', icon: 'settings' }
];

/* ================= PROFILE DRAWER ================= */
export function ProfileDrawerBody() {
  const u = PM.auth.user;
  const close = () => ui.closeDrawer();
  const logout = e => {
    e.preventDefault();
    PM.auth.logout();
    ui.closeDrawer();
    PM.toast('از حساب خارج شدید');
    bump();
  };

  const head = u ? (
    <div className="profile-hero">
      <span className="avatar">{escapeHtml((u.name || 'ک').trim().charAt(0))}</span>
      <span className="grow">
        <span className="ph-name">{escapeHtml(u.name)}</span>
        <div className="ph-phone">{toPersianDigits(u.phone)}</div>
        <div className="ph-phone">{u.since}</div>
      </span>
      <a className="icon-btn" href="#/account" data-close-drawer="" onClick={close} aria-label="حساب کاربری">{svg('edit')}</a>
    </div>
  ) : (
    <>
      <div className="profile-hero">
        <span className="avatar">{svg('user')}</span>
        <span className="grow">
          <span className="ph-name">خوش آمدید</span>
          <div className="ph-phone">برای دسترسی به سفارش‌ها و رزروها وارد شوید</div>
        </span>
      </div>
      <div className="row mb-3" style={{ gap: '10px' }}>
        <a className="btn btn-primary" style={{ flex: 1 }} href="#/auth/login" data-close-drawer="" onClick={close}>ورود</a>
        <a className="btn btn-ghost" style={{ flex: 1 }} href="#/auth/register" data-close-drawer="" onClick={close}>ثبت‌نام</a>
      </div>
    </>
  );

  /* profile menu: account items only — no store/restaurant/takeaway links.
     The wallet row is the single entry allowed to carry a figure, and that
     figure is the real available balance from the wallet service. */
  const w = u ? Wallet.peek() : null;
  const wBal = w && Number.isFinite(w.available) ? w.available : null;
  const links = (
    <nav className="pmenu">
      {ACCOUNT_NAV.map(a => (
        <a href={'#/' + a.id} data-close-drawer="" onClick={close} key={a.id}>
          {svg(a.icon)}
          {a.fa}
          {a.id === 'wallet' && wBal !== null ? (
            <span className="pm-bal">{formatAmount(wBal)} تومان</span>
          ) : null}
        </a>
      ))}
      {u ? (
        <>
          <span className="sep" />
          <a href="#/" className="danger" data-logout="" onClick={logout}>{svg('logout')}خروج از حساب</a>
        </>
      ) : null}
    </nav>
  );

  return (
    <>
      {head}
      {links}
      {u ? null : (
        <div className="mt-3" style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
          <a className="btn btn-primary btn-block" href="#/auth/login" data-close-drawer="" onClick={close}>ورود به حساب کاربری</a>
        </div>
      )}
    </>
  );
}

/* ================= CART DRAWER ================= */
function cartSummaryRows(method) {
  const cart = PM.cart;
  return [
    { k: 'جمع محصولات', v: formatAmount(cart.subtotal()) + ' تومان' },
    { k: 'هزینه ارسال', v: cart.shipping(method) ? formatAmount(cart.shipping(method)) + ' تومان' : 'رایگان', free: !cart.shipping(method) },
    { k: 'تخفیف', v: cart.discount() ? '− ' + formatAmount(cart.discount()) + ' تومان' : '۰ تومان' },
    { k: 'مبلغ نهایی', v: formatAmount(cart.total(method)) + ' تومان', total: true }
  ];
}
export { cartSummaryRows };

export function CartDrawerBody() {
  const cart = PM.cart;
  if (!cart.items.length) {
    return (
      <Empty
        icon="cart"
        title="سبد خرید شما خالی است"
        text="محصولی از فروشگاه، رستوران یا بیرون‌بر انتخاب کنید تا اینجا ظاهر شود."
        cta={{ href: '#/store', label: 'شروع خرید' }}
      />
    );
  }
  return <>{cart.items.map(it => <CartItem it={it} key={it.key} />)}</>;
}

export function CartDrawerFoot() {
  const cart = PM.cart;
  if (!cart.items.length) return null;
  const close = () => ui.closeDrawer();
  return (
    <>
      <Summary rows={cartSummaryRows('normal')} />
      <div className="row" style={{ gap: '10px', marginTop: '14px' }}>
        <button type="button" className="btn btn-ghost" data-act="clear-cart" style={{ flex: 'none' }}
          onClick={() => handleAction('clear-cart')}>خالی کردن</button>
        <a className="btn btn-primary" style={{ flex: 1 }} href="#/checkout" data-close-drawer="" onClick={close}>
          تسویه حساب
        </a>
      </div>
    </>
  );
}

/* ================= FILTERS DRAWER ================= */
/* Same body for all three sections: it reads the listing the section is
   currently showing (sectionItems) and writes only that section's record. */
function FilterDrawerBody({ section }) {
  const f = filtersFor(section);
  const pr = priceRange(section);

  const toggleType = val => {
    const i = f.types.indexOf(val);
    if (i === -1) f.types.push(val); else f.types.splice(i, 1);
    bump();
  };

  return (
    <>
      <div className="f-group">
        <div className="f-title">نوع محصول</div>
        <div className="f-options">
          {TYPE_OPTIONS.map(o => (
            <button
              type="button"
              className={'f-option' + (f.types.indexOf(o) !== -1 ? ' on' : '')}
              data-fopt="types"
              data-val={o}
              key={o}
              onClick={() => toggleType(o)}
            >{o}</button>
          ))}
        </div>
      </div>
      <div className="f-group">
        <div className="f-title">بازه قیمت (تومان)</div>
        <RangeSlider
          bounds={pr.bounds}
          lo={pr.lo}
          hi={pr.hi}
          onChange={(lo, hi) => { setPriceRange(section, lo, hi); bump(); }}
          onReset={() => { clearPriceRange(section); bump(); }}
        />
      </div>
      <div className="f-group">
        <div className="f-title">حداقل امتیاز</div>
        <div className="f-options">
          {[0, 4, 4.5, 4.8].map(r => (
            <button
              type="button"
              className={'f-option' + (f.minRate === r ? ' on' : '')}
              data-frate={r}
              key={r}
              onClick={() => { f.minRate = r; bump(); }}
            >{r ? toPersianDigits(r.toFixed(1)) + ' به بالا' : 'همه'}</button>
          ))}
        </div>
      </div>
      <div className="f-group">
        <div className="f-title">محبوبیت</div>
        <div className="f-options">
          <button
            type="button"
            className={'f-option' + (f.popular ? ' on' : '')}
            data-fpop=""
            onClick={() => { f.popular = !f.popular; bump(); }}
          >فقط پرفروش‌ها</button>
        </div>
      </div>
    </>
  );
}

export function FilterDrawerFoot({ section }) {
  const apply = () => {
    filtersFor(section).page = 1;
    ui.closeDrawer();
    bump();
    PM.toast('فیلترها اعمال شد', true);
  };
  const clear = () => {
    resetFilters(section);
    ui.closeDrawer();
    bump();
  };
  return (
    <>
      <button type="button" className="btn btn-primary btn-block" data-act="apply-filters" onClick={apply}>
        اعمال فیلترها
      </button>
      <button type="button" className="btn btn-ghost btn-block mt-2" data-act="clear-filters"
        style={{ marginTop: '8px' }} onClick={clear}>
        حذف همه
      </button>
    </>
  );
}

/* ================= DRAWER SHELL ================= */
function Drawer({ id, wide, title, labelledBy, open, onClose, children, foot }) {
  return (
    <aside
      className={'drawer' + (wide ? ' wide' : '') + (open ? ' open' : '')}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-hidden={open ? 'false' : 'true'}
    >
      <div className="drawer-head">
        <h3 id={labelledBy}>{title}</h3>
        <button className="icon-btn" type="button" data-close-drawer="" onClick={onClose} aria-label="بستن">
          {svg('close')}
        </button>
      </div>
      <div className="drawer-body" id={id + 'Body'}>{children}</div>
      {foot ? <div className="drawer-foot" id={id + 'Foot'}>{foot}</div> : null}
    </aside>
  );
}

export function ProfileDrawer({ open, onClose }) {
  return (
    <Drawer id="profileDrawer" title="حساب کاربری" labelledBy="pdTitle" open={open} onClose={onClose}>
      <ProfileDrawerBody />
    </Drawer>
  );
}

export function CartDrawer({ open, onClose }) {
  return (
    <Drawer id="cartDrawer" wide title="سبد خرید" labelledBy="cdTitle" open={open} onClose={onClose}
      foot={<CartDrawerFoot />}>
      <CartDrawerBody />
    </Drawer>
  );
}

export function FilterDrawer({ open, onClose, section, rev }) {
  /* re-renders the body each time the drawer opens, for the section that owns it */
  if (!isFilterable(section)) return null;
  return (
    <Drawer id="filterDrawer" title="فیلترها" labelledBy="fdTitle" open={open} onClose={onClose}
      foot={<FilterDrawerFoot section={section} />}>
      <FilterDrawerBody section={section} key={section + ':' + rev} />
    </Drawer>
  );
}
