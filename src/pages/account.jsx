/* ============================================================
   ProMeat — account.jsx
   Account pages · auth · about · 404
   (faithful JSX port of views-account.js + PM.views.notFound)
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { PM } from '../lib/state.js';
import { svg } from '../components/icons.jsx';
import { ui } from '../lib/ui.js';
import { bump } from '../lib/hooks.js';
import { handleAction } from '../lib/actions.js';
import {
  Empty, Crumbs, SecHead, GridCards, GridFoods, Select, SkeletonGrid
} from '../components/ui.jsx';
import { ACCOUNT_NAV } from '../components/drawers.jsx';
import {
  Wallet as WalletSvc, WALLET_DEMO, MIN_DEPOSIT, MAX_DEPOSIT, validateDeposit
} from '../lib/wallet.js';
import { toPersianDigits, formatAmount, formatToman, escapeHtml } from '../utils/format.js';

const data = () => PM.data;

/* province options for the address form (unchanged set) */
const PROVINCES = ['تهران', 'خوزستان', 'اصفهان', 'فارس'];

/* ================= LOGIN GATE ================= */
function needLogin(title) {
  return (
    <div className="shell page-top-pad">
      <div className="section">
        <Empty
          icon="login"
          title={'برای دیدن ' + title + ' وارد شوید'}
          text="ابتدا وارد حساب کاربری خود شوید یا حساب جدیدی بسازید."
          cta={{ href: '#/auth/login', label: 'ورود به حساب کاربری' }}
        />
        <div className="center mt-3">
          <a className="btn btn-outline-red" href="#/auth/register">ثبت‌نام</a>
        </div>
      </div>
    </div>
  );
}

/* ================= ACCOUNT SHELL ================= */
function AccountNav({ active }) {
  const logout = e => {
    e.preventDefault();
    PM.auth.logout();
    ui.closeDrawer();
    PM.toast('از حساب خارج شدید');
    bump();
  };
  return (
    <nav className="acc-nav">
      {ACCOUNT_NAV.map(a => (
        <a href={'#/' + a.id} className={a.id === active ? 'on' : ''} key={a.id}>
          {svg(a.icon)}
          {a.fa}
        </a>
      ))}
      <a href="#/" className="danger" data-logout="" onClick={logout} style={{ color: 'var(--red-bright)' }}>
        {svg('logout')}
        خروج
      </a>
    </nav>
  );
}

function accountShell(active, title, sub, content) {
  return (
    <div className="shell">
      <Crumbs items={[{ t: 'حساب کاربری', href: '#/account' }, { t: title }]} />
      <div className="section-tight">
        <h1 className="h1">{title}</h1>
        {sub ? <p className="muted mt-1">{sub}</p> : null}
      </div>
      <div className="acc-grid" style={{ paddingBottom: '30px' }}>
        <AccountNav active={active} />
        <div>{content}</div>
      </div>
    </div>
  );
}

/* ================= SHARED CARDS ================= */
function orderCard(o) {
  const thumbs = o.items.slice(0, 4);
  const extra = o.items.length - thumbs.length;
  return (
    <div className="order-card">
      <div className="o-head">
        <span className="o-num">{o.id}</span>
        <span className="o-date">{o.date}</span>
        <span className={'order-status ' + o.status}>{data()._statusFa(o.status)}</span>
      </div>
      <div className="o-items">
        {thumbs.map((t, i) => (
          <span className="o-thumb img-frame" key={i}>
            <img src={t.img} alt={escapeHtml(t.name)} loading="lazy" />
            <span className="img-fallback">{svg('drum')}</span>
          </span>
        ))}
        {extra > 0 ? <span className="o-more">{toPersianDigits('+' + extra)}</span> : null}
        <span className="grow small muted-2">
          {o.items.map(i => i.name).join('، ').slice(0, 54)}…
        </span>
      </div>
      <div className="o-foot">
        <span>{o.ship}</span>
        <span style={{ fontWeight: 700 }}>{formatAmount(o.total)} تومان</span>
      </div>
    </div>
  );
}

function resvCard(r) {
  return (
    <div className="resv-card">
      <div className="resv-date-box">
        <span className="d">{r.day}</span>
        <span className="m">{r.month}</span>
      </div>
      <div className="resv-info">
        <span className="r-name">شعبه {r.branch}</span>
        <span className="r-meta">
          <span>{svg('clock')} {r.time}</span>
          <span>{svg('users')} {toPersianDigits(r.guests)} نفر</span>
          <span>{r.table}</span>
          <span className="latin" style={{ letterSpacing: '.05em' }}>{r.id}</span>
        </span>
        {(r.food || []).length ? (
          <span className="r-meta small muted-2">
            {r.food.map(f => toPersianDigits(f.qty) + '× ' + f.name).join(' · ')}
          </span>
        ) : null}
      </div>
      <div className="r-side">
        <span className={'resv-status ' + r.status}>{data()._resvFa(r.status)}</span>
        {r.status === 'confirmed' ? (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            data-cancel-resv={r.id}
            onClick={() => {
              const rec = PM.reservations.byId(r.id);
              if (rec) rec.status = 'cancelled';
              PM.toast('رزرو لغو شد');
              bump();
            }}
          >
            لغو رزرو
          </button>
        ) : (
          <a className="btn btn-sm btn-outline-red" href="#/restaurant/reserve">رزرو دوباره</a>
        )}
      </div>
    </div>
  );
}

function addrCard(a) {
  return (
    <div className="addr-card">
      <div className="a-title">{svg('pin')}{a.title}</div>
      <div className="a-text">{a.text}</div>
      <div className="row small muted-2" style={{ gap: '14px', flexWrap: 'wrap' }}>
        <span>{escapeHtml(a.name)}</span>
        <span>{toPersianDigits(a.phone)}</span>
        <span>کد پستی: {toPersianDigits(a.postal)}</span>
      </div>
      <div className="a-actions">
        <button type="button" className="btn btn-sm btn-ghost" data-edit-addr={a.id}
          onClick={() => addressModal(PM.addresses.byId(a.id))}>ویرایش</button>
        <button type="button" className="btn btn-sm btn-ghost" data-del-addr={a.id}
          style={{ color: 'var(--red-bright)' }}
          onClick={() => { PM.addresses.remove(a.id); PM.toast('آدرس حذف شد'); bump(); }}>
          حذف
        </button>
      </div>
    </div>
  );
}

/* ================= ADDRESS MODAL (React form, same DOM) ================= */
function AddressForm({ a }) {
  const v = a || {
    id: '', title: '', name: '', phone: '', state: 'تهران',
    city: 'تهران', postal: '', plaque: '', unit: '', text: ''
  };
  const [province, setProvince] = useState(v.state || 'تهران');
  const submit = e => {
    e.preventDefault();
    const g = id => (document.getElementById(id) || {}).value || '';
    const id = g('aId');
    const rec = {
      id: id || undefined,
      title: g('aTitle').trim(),
      name: g('aName').trim(),
      phone: g('aPhone').trim(),
      state: province,
      city: g('aCity').trim(),
      postal: g('aZip').trim(),
      plaque: g('aPlaque').trim(),
      unit: '',
      text: g('aText').trim()
    };
    if (id) {
      const old = PM.addresses.byId(id);
      Object.assign(old, rec);
      PM.addresses.remove(id);
      rec.id = id;
      PM.addresses.add(rec);
    } else PM.addresses.add(rec);
    PM.closeModal();
    PM.toast('آدرس ذخیره شد', true);
    bump();
  };
  return (
    <form id="addrForm" onSubmit={submit}>
      <div className="field">
        <label htmlFor="aTitle">عنوان آدرس</label>
        <input className="input" id="aTitle" defaultValue={v.title} placeholder="خانه / محل کار" required />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="aName">نام و نام خانوادگی</label>
          <input className="input" id="aName"
            defaultValue={v.name || (PM.auth.user ? PM.auth.user.name : '')} required />
        </div>
        <div className="field">
          <label htmlFor="aPhone">شماره موبایل</label>
          <input className="input" id="aPhone"
            defaultValue={v.phone || (PM.auth.user ? PM.auth.user.phone : '')} required />
        </div>
        <div className="field">
          <label htmlFor="aState">استان</label>
          <Select
            id="aState"
            ariaLabel="استان"
            value={province}
            options={PROVINCES.map(p => ({ value: p, label: p }))}
            onChange={setProvince}
          />
        </div>
        <div className="field">
          <label htmlFor="aCity">شهر</label>
          <input className="input" id="aCity" defaultValue={v.city} required />
        </div>
        <div className="field">
          <label htmlFor="aZip">کد پستی</label>
          <input className="input" id="aZip" defaultValue={v.postal} />
        </div>
        <div className="field">
          <label htmlFor="aPlaque">پلاک / واحد</label>
          <input className="input" id="aPlaque" defaultValue={v.plaque} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="aText">آدرس کامل</label>
        <textarea className="textarea" id="aText" defaultValue={v.text} required />
      </div>
      <input type="hidden" id="aId" value={v.id || ''} readOnly />
      <button className="btn btn-primary btn-block" type="submit">ذخیره آدرس</button>
    </form>
  );
}

function addressModal(existing) {
  PM.modal(existing ? 'ویرایش آدرس' : 'افزودن آدرس جدید', <AddressForm a={existing} />);
}

/* ================= ACCOUNT: overview ================= */
export function Account() {
  const u = PM.auth.user;
  if (!u) return needLogin('حساب کاربری');
  const confirmed = PM.reservations.list.filter(r => r.status === 'confirmed').length;
  const w = WalletSvc.peek();

  return accountShell('account', 'حساب کاربری', u.since,
    <>
      <div className="co-card">
        <div className="profile-hero" style={{ marginBottom: 0 }}>
          <span className="avatar">{escapeHtml(u.name.trim().charAt(0))}</span>
          <span className="grow">
            <span className="ph-name">{escapeHtml(u.name)}</span>
            <div className="ph-phone">{toPersianDigits(u.phone)}</div>
          </span>
          <button type="button" className="btn btn-sm btn-ghost" data-act="edit-profile"
            onClick={() => handleAction('edit-profile')}>ویرایش</button>
        </div>

        {/* wallet summary (§7.1) — same row pattern as settings, links to the wallet page */}
        <a className="set-row" href="#/wallet" style={{ textDecoration: 'none' }}>
          <span className="row" style={{ gap: '11px' }}>
            <span style={{ color: 'var(--red-bright)' }}>{svg('wallet')}</span>
            <span>
              <span className="s-title">کیف پول</span>
              <div className="s-sub">{formatToman(w.available)} قابل خرج</div>
            </span>
          </span>
          <span className="row" style={{ gap: '8px', color: 'var(--ink-3)' }}>
            {w.pending ? <span className="small muted-2">{formatAmount(w.pending)} در انتظار تأیید</span> : null}
            {svg('chevR')}
          </span>
        </a>
      </div>

      <div className="stats-row mt-3">
        <a className="stat-box" href="#/orders">
          <div className="v">{toPersianDigits(PM.orders.list.length)}</div>
          <div className="k">سفارش ثبت‌شده</div>
        </a>
        <a className="stat-box" href="#/reservations">
          <div className="v">{toPersianDigits(PM.reservations.list.length)}</div>
          <div className="k">رزرو ثبت‌شده</div>
        </a>
        <a className="stat-box" href="#/favorites">
          <div className="v">{toPersianDigits(PM.fav.list.length)}</div>
          <div className="k">علاقه‌مندی</div>
        </a>
      </div>

      <div className="co-card mt-3">
        <h3>آخرین سفارش‌ها</h3>
        {PM.orders.list.slice(0, 2).map(orderCard)}
        <a className="btn btn-ghost btn-block mt-2" href="#/orders">مشاهده همه سفارش‌ها</a>
      </div>

      <div className="co-card">
        <h3>رزروهای پیش رو</h3>
        {confirmed
          ? PM.reservations.list.filter(r => r.status === 'confirmed').map(resvCard)
          : <p className="small muted-2">رزرو تاییدشده‌ای ندارید.</p>}
        <a className="btn btn-ghost btn-block mt-2" href="#/restaurant/reserve">رزرو میز جدید</a>
      </div>
    </>);
}

/* ================= ORDERS ================= */
export function Orders() {
  if (!PM.auth.user) return needLogin('سفارش‌ها');
  const list = PM.orders.list;
  return accountShell('orders', 'سفارش‌های من',
    list.length ? toPersianDigits(list.length) + ' سفارش ثبت شده' : '',
    list.length
      ? list.map(orderCard)
      : <Empty
          icon="box"
          title="هنوز سفارشی ثبت نکرده‌اید"
          text="پس از اولین خرید، سفارش‌های اینجا نمایش داده می‌شوند."
          cta={{ href: '#/store', label: 'شروع خرید' }}
        />);
}

/* ================= RESERVATIONS ================= */
export function Reservations() {
  if (!PM.auth.user) return needLogin('رزروها');
  const list = PM.reservations.list;
  return accountShell('reservations', 'رزروهای من',
    list.length ? toPersianDigits(list.length) + ' رزرو ثبت شده' : '',
    <>
      {list.length
        ? list.map(resvCard)
        : <Empty
            icon="calendar"
            title="هنوز رزروی ثبت نکرده‌اید"
            text="در رستوران پرومیت میزتان را رزرو کنید."
            cta={{ href: '#/restaurant/reserve', label: 'رزرو میز' }}
          />}
      <a className="btn btn-primary mt-3" href="#/restaurant/reserve" style={{ marginTop: '16px' }}>
        رزرو میز جدید
      </a>
    </>);
}

/* ================= FAVORITES ================= */
export function Favorites() {
  if (!PM.auth.user) return needLogin('علاقه‌مندی‌ها');
  const items = PM.fav.items();
  const groups = { store: [], restaurant: [], takeaway: [] };
  items.forEach(i => groups[i.type].push(i.product));

  let body = null;
  if (!items.length) {
    body = (
      <Empty
        icon="heart"
        title="هنوز محصولی را به علاقه‌مندی‌ها اضافه نکرده‌اید"
        text="روی قلب هر محصول، غذا یا آیتم بیرون‌بر بزنید تا اینجا ذخیره شود."
        cta={{ href: '#/store', label: 'مرور فروشگاه' }}
      />
    );
  } else {
    body = (
      <>
        {groups.store.length ? <SecHead icon="store" title="فروشگاه" /> : null}
        {groups.store.length ? <GridCards list={groups.store} /> : null}
        {groups.restaurant.length ? <SecHead icon="utensils" title="رستوران" /> : null}
        {groups.restaurant.length ? <GridFoods list={groups.restaurant} /> : null}
        {groups.takeaway.length ? <SecHead icon="moto" title="بیرون‌بر" /> : null}
        {groups.takeaway.length ? <GridCards list={groups.takeaway} section="takeaway" /> : null}
      </>
    );
  }
  return accountShell('favorites', 'علاقه‌مندی‌ها',
    items.length ? toPersianDigits(items.length) + ' مورد ذخیره شده' : '', body);
}

/* ================= ADDRESSES ================= */
export function Addresses() {
  if (!PM.auth.user) return needLogin('آدرس‌ها');
  const list = PM.addresses.list;
  return accountShell('addresses', 'آدرس‌های من',
    list.length ? toPersianDigits(list.length) + ' آدرس ذخیره شده' : '',
    <>
      {list.length
        ? <div className="grid-2">{list.map(addrCard)}</div>
        : <Empty icon="pin" title="آدرسی ثبت نکرده‌اید" text="برای تسویه حساب سریع، آدرس خود را اضافه کنید." />}
      <button type="button" className="btn btn-primary mt-3" data-add-addr=""
        style={{ marginTop: '16px' }} onClick={() => addressModal(null)}>
        افزودن آدرس جدید
      </button>
    </>);
}

/* ================= SETTINGS ================= */
function setRow(key, title, sub, checked) {
  return (
    <div className="set-row">
      <span>
        <span className="s-title">{title}</span>
        <div className="s-sub">{sub}</div>
      </span>
      <label className="switch">
        <input
          type="checkbox"
          data-pref={key}
          defaultChecked={checked}
          aria-label={title}
          onChange={e => {
            try {
              if (e.target.checked) localStorage.setItem('promeat:pref:' + key, '1');
              else localStorage.removeItem('promeat:pref:' + key);
            } catch (err) {}
            PM.toast('تنظیمات ذخیره شد', true);
          }}
        />
      </label>
    </div>
  );
}

export function Settings() {
  if (!PM.auth.user) return needLogin('تنظیمات');
  const on = k => { try { return !!localStorage.getItem('promeat:pref:' + k); } catch (e) { return false; } };
  const logout = e => {
    e.preventDefault();
    PM.auth.logout();
    ui.closeDrawer();
    PM.toast('از حساب خارج شدید');
    bump();
  };

  return accountShell('settings', 'تنظیمات', 'مدیریت اطلاعات حساب و اعلان‌ها',
    <>
      <div className="co-card">
        <h3>اطلاعات حساب</h3>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="sName">نام و نام خانوادگی</label>
            <input className="input" id="sName" defaultValue={PM.auth.user.name} />
          </div>
          <div className="field">
            <label htmlFor="sPhone">شماره موبایل</label>
            <input className="input" id="sPhone" defaultValue={toPersianDigits(PM.auth.user.phone)} />
          </div>
        </div>
        <button type="button" className="btn btn-primary" data-act="save-profile"
          onClick={() => handleAction('save-profile')}>ذخیره تغییرات</button>
      </div>

      <div className="co-card mt-3" style={{ marginTop: '18px' }}>
        <h3>اعلان‌ها</h3>
        {setRow('p-sms', 'اعلان پیامکی', 'دریافت کد رهگیری سفارش و رزرو با پیامک', on('p-sms'))}
        {setRow('p-push', 'اعلان تخفیف‌ها', 'خبر از جشنواره‌ها و محصولات تازه', on('p-push'))}
        {setRow('p-email', 'خبرنامه ایمیلی', 'دریافت هفتگینامه پرومیت', on('p-email'))}
      </div>

      <div className="co-card" style={{ marginTop: '18px' }}>
        <h3>حریم خصوصی</h3>
        {setRow('p-loc', 'دسترسی به موقعیت', 'برای پیشنهاد نزدیک‌ترین شعبه', on('p-loc'))}
        {setRow('p-theme', 'کاهش حرکت انیمیشن‌ها', 'نمایش ساده‌تر رابط کاربری', on('p-theme'))}
      </div>

      <div className="co-card" style={{ marginTop: '18px' }}>
        <h3>منطقه حساب</h3>
        <div className="set-row">
          <span>
            <span className="s-title">حذف داده‌های محلی</span>
            <div className="s-sub">سبد خرید، علاقه‌مندی‌ها و تنظیمات این مرورگر پاک می‌شود</div>
          </span>
          <button type="button" className="btn btn-sm btn-ghost" data-act="reset-data"
            style={{ color: 'var(--red-bright)' }} onClick={() => handleAction('reset-data')}>
            پاک‌سازی
          </button>
        </div>
        <div className="set-row">
          <span>
            <span className="s-title">خروج از حساب</span>
            <div className="s-sub">اطلاعات حساب از این دستگاه خارج می‌شود</div>
          </span>
          <button type="button" className="btn btn-sm btn-ghost" data-logout=""
            style={{ color: 'var(--red-bright)' }} onClick={logout}>خروج</button>
        </div>
      </div>
    </>);
}

/* ================= WALLET ================= */
/* Funding is recorded, never collected: this build has no bank/gateway
   connection, so a deposit stays "pending" until the (future) backend confirms it.
   WALLET_DEMO only reveals the developer simulation control. */
const FUND_METHODS = [
  { id: 'card2card', fa: 'کارت به کارت', icon: 'refresh',
    s: 'واریز به حساب پرومیت؛ پس از تأیید حسابداری به موجودی قابل خرج اضافه می‌شود.' },
  { id: 'gateway', fa: 'درگاه پرداخت آنلاین', icon: 'card',
    s: 'مسیر درگاه در این نسخه ساخته نشده؛ درخواست شارژ فقط ثبت و در انتظار تأیید می‌ماند.' }
];

const txIcon = t => (t === 'payment' ? 'card' : t === 'refund' ? 'refresh' : 'plus');

function TxRow({ t, onSettle, onCancel }) {
  const credit = t.type !== 'payment';
  const pendingTopup = t.status === 'pending' && t.type === 'topup';
  return (
    <div className="set-row">
      <span className="row" style={{ gap: '11px', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <span style={{ color: 'var(--red-bright)', flex: 'none', marginTop: '2px' }}>{svg(txIcon(t.type))}</span>
        <span>
          <span className="s-title">{WalletSvc.typeFa(t.type)}</span>
          <div className="s-sub">{WalletSvc.faDate(t.date)}{t.orderId ? ' · سفارش ' + t.orderId : ''}</div>
          {t.note ? <div className="s-sub">{t.note}</div> : null}
          {WALLET_DEMO && pendingTopup ? (
            <span className="row" style={{ gap: '8px', marginTop: '8px' }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => onSettle(t)}>
                شبیه‌سازی تأیید
              </button>
              <button type="button" className="btn btn-sm btn-ghost" style={{ color: 'var(--red-bright)' }}
                onClick={() => onCancel(t)}>
                لغو
              </button>
            </span>
          ) : null}
        </span>
      </span>
      <span style={{ textAlign: 'end', flex: 'none' }}>
        <span className="s-title">{credit ? '+ ' : '− '}{formatAmount(t.amount)}</span>
        <div className="s-sub">تومان</div>
        <span className={'chip' + (t.status === 'settled' ? '' : ' chip-outline')} style={{ marginTop: '6px' }}>
          {WalletSvc.statusFa(t.status)}
        </span>
      </span>
    </div>
  );
}

function FundConfirm({ amount, methodId, onDone }) {
  const m = FUND_METHODS.find(x => x.id === methodId);
  const [sending, setSending] = useState(false);

  const confirm = async () => {
    if (sending) return;                       /* one request per click */
    setSending(true);
    const r = await WalletSvc.deposit({ amount: amount, method: methodId });
    setSending(false);
    PM.closeModal();
    if (!r.ok) { PM.toast(r.error || 'ثبت درخواست ممکن نشد.'); return; }
    PM.toast('درخواست شارژ ثبت شد و در انتظار تأیید پرداخت است.', true);
    onDone();
  };

  return (
    <div>
      <p className="story-p" style={{ marginTop: 0 }}>مبلغ {formatToman(amount)}</p>
      <p className="small muted-2">روش: {m ? m.fa : ''} — {m ? m.s : ''}</p>
      <p className="small muted-2" style={{ marginTop: '10px' }}>
        این کیف پول به بانک یا درگاه متصل نیست؛ مبلغ واقعی از حساب شما کسر نمی‌شود و تراکنش با وضعیت
        «در انتظار تأیید» ثبت می‌گردد.
      </p>
      <div className="row" style={{ gap: '10px', marginTop: '18px' }}>
        <button type="button" className="btn btn-primary" onClick={confirm} disabled={sending}>
          {sending ? 'در حال ثبت…' : 'تأیید و ثبت درخواست'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => PM.closeModal()}>انصراف</button>
      </div>
    </div>
  );
}

export function Wallet() {
  const logged = PM.auth.user;
  const [st, setSt] = useState(null);              /* null = loading */
  const [loadErr, setLoadErr] = useState('');
  const [amt, setAmt] = useState('');
  const [method, setMethod] = useState(FUND_METHODS[0].id);
  const [formErr, setFormErr] = useState('');

  const refresh = () => WalletSvc.getState()
    .then(s => { setSt(s); setLoadErr(''); })
    .catch(() => setLoadErr('موجودی و تراکنش‌ها خوانده نشد.'));

  useEffect(() => {
    if (!logged) return undefined;
    refresh();
    return WalletSvc.subscribe(refresh);
  }, []);

  if (!logged) return needLogin('کیف پول');

  if (loadErr) {
    return accountShell('wallet', 'کیف پول', '',
      <Empty
        icon="refresh"
        title="خواندن کیف پول ممکن نشد"
        text={loadErr + ' دوباره تلاش کنید.'}
        btn={{ label: 'تلاش دوباره', onClick: refresh }}
      />);
  }
  if (!st) return accountShell('wallet', 'کیف پول', '', <SkeletonGrid n={3} />);

  const ask = e => {
    e.preventDefault();
    const v = validateDeposit({ amount: amt, method: method });
    if (!v.ok) { setFormErr(v.error); return; }
    setFormErr('');
    PM.modal('تأیید شارژ کیف پول', <FundConfirm amount={v.amount} methodId={method} onDone={refresh} />);
  };

  const settle = async t => {
    const r = await WalletSvc.simulateSettle(t.id);
    if (!r.ok) { PM.toast(r.error); return; }
    PM.toast('شبیه‌سازی: شارژ تأیید شد و به موجودی قابل خرج اضافه شد.', true);
  };
  const cancel = async t => {
    const r = await WalletSvc.cancelDeposit(t.id);
    if (!r.ok) { PM.toast(r.error); return; }
    PM.toast('درخواست شارژ لغو شد.');
  };

  const notes = [
    'موجودی قابل خرج فقط شامل شارژهای تأییدشده است.',
    'شارژ «در انتظار تأیید» پیش از تأیید پرداخت قابل خرج نیست.',
    'کیف پول در تسویه حساب یک روش اختیاری است و جایگزین پرداخت آنلاین یا پرداخت در محل نمی‌شود.',
    'با انتخاب کیف پول وضعیت سفارش عوض نمی‌شود؛ تا آماده‌سازی همان «در حال پردازش» می‌ماند.'
  ];

  return accountShell('wallet', 'کیف پول',
    WALLET_DEMO ? 'نسخه نمایشی؛ عدد و رقم‌های این صفحه ارزش واقعی ندارند.' : '',
    <>
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-box">
          <div className="v">{formatAmount(st.available)}</div>
          <div className="k">قابل خرج · تومان</div>
        </div>
        <div className="stat-box">
          <div className="v">{formatAmount(st.pending)}</div>
          <div className="k">در انتظار تأیید · تومان</div>
        </div>
      </div>

      <div className="co-card" style={{ marginTop: '18px' }}>
        <h3>{svg('plus')} افزودن موجودی</h3>
        <form onSubmit={ask}>
          <div className="field">
            <label htmlFor="wAmount">مبلغ شارژ (تومان)</label>
            <input
              className="input" id="wAmount" inputMode="numeric"
              placeholder={'مثلاً ' + formatAmount(500000)}
              value={amt}
              onChange={e => { setAmt(e.target.value); if (formErr) setFormErr(''); }}
            />
            <p className={'field-error' + (formErr ? '' : ' hide')}>{formErr}</p>
            <p className="small muted-2" style={{ marginTop: '6px' }}>
              هر شارژ باید بین {formatAmount(MIN_DEPOSIT)} و {formatAmount(MAX_DEPOSIT)} تومان باشد.
            </p>
          </div>

          {FUND_METHODS.map(m => (
            <label key={m.id} className={'pay-opt' + (method === m.id ? ' on' : '')} onClick={() => setMethod(m.id)}>
              <span className="s-ico">{svg(m.icon)}</span>
              <span>
                <span className="s-name">{m.fa}</span>
                <div className="s-sub">{m.s}</div>
              </span>
              <input type="radio" name="wMethod" value={m.id} checked={method === m.id} className="hide"
                onChange={() => setMethod(m.id)} />
            </label>
          ))}

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '14px' }}>
            ادامه و تأیید
          </button>
        </form>
      </div>

      <div className="co-card" style={{ marginTop: '18px' }}>
        <h3>{svg('wallet')} تراکنش‌های من</h3>
        {st.txs.length
          ? st.txs.map(t => <TxRow t={t} key={t.id} onSettle={settle} onCancel={cancel} />)
          : <Empty
              icon="wallet"
              title="هنوز تراکنشی ثبت نشده"
              text="پس از اولین شارژ یا پرداخت با کیف پول، تراکنش‌ها اینجا نمایش داده می‌شوند."
            />}
      </div>

      <div className="co-card" style={{ marginTop: '18px' }}>
        <h3>{svg('info')} نکته‌های استفاده</h3>
        <ul className="check-list" style={{ marginTop: 0 }}>
          {notes.map(n => <li key={n}>{svg('checkCircle')}<span>{n}</span></li>)}
        </ul>
      </div>
    </>);
}

/* ================= AUTH ================= */
export function Login() {
  const [err, setErr] = useState(false);
  const [bad, setBad] = useState(false);
  const submit = e => {
    e.preventDefault();
    const phone = (document.getElementById('lPhone') || {}).value.trim() || '';
    const pass = (document.getElementById('lPass') || {}).value.trim() || '';
    if (phone.length < 8 || pass.length < 4) { setErr(true); setBad(true); return; }
    PM.auth.login(phone, pass);
    PM.toast('خوش آمدید، وارد حساب شدید', true);
    window.location.hash = '#/account';
  };
  return (
    <div className="shell">
      <div className="auth-wrap">
        <form className="auth-card" id="loginForm" onSubmit={submit}>
          <div className="auth-logo"><img src="assets/logo/logo-white.png" alt="پرومیت" /></div>
          <h1>ورود به حساب کاربری</h1>
          <p className="a-sub">برای دسترسی به سفارش‌ها، رزروها و علاقه‌مندی‌ها وارد شوید</p>
          <div className="field">
            <label htmlFor="lPhone">شماره موبایل</label>
            <input className={'input' + (bad ? ' invalid' : '')} id="lPhone" inputMode="tel"
              placeholder="۰۹۱۲۱۲۳۴۵۶۷" required autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor="lPass">رمز عبور / کد ورود</label>
            <input className="input" id="lPass" type="password" placeholder="••••••" required
              autoComplete="current-password" />
          </div>
          <div className="row-between mb-3" style={{ marginBottom: '16px' }}>
            <label className="check"><input type="checkbox" defaultChecked /><span>مرا به خاطر بسپار</span></label>
            <a className="small" href="#/auth/login" style={{ color: 'var(--red-bright)' }}>فراموشی رمز؟</a>
          </div>
          <p className={'field-error' + (err ? '' : ' hide')} id="loginErr">شماره موبایل یا رمز عبور درست نیست</p>
          <button className="btn btn-primary btn-block btn-lg" type="submit">ورود</button>
          <p className="auth-alt">حساب ندارید؟ <a href="#/auth/register">ثبت‌نام کنید</a></p>
          <p className="center small muted-2 mt-2">ورود نمایشی است — هر شماره و رمزی پذیرفته می‌شود</p>
        </form>
      </div>
    </div>
  );
}

export function Register() {
  const [err, setErr] = useState(false);
  const submit = e => {
    e.preventDefault();
    const v = id => (document.getElementById(id) || {}).value.trim() || '';
    const first = v('rFirst'), last = v('rLast'), phone = v('rPhone'), pass = v('rPass');
    const agree = !!(document.getElementById('rAgree') || {}).checked;
    if (!first || !last || phone.length < 8 || pass.length < 6 || !agree) { setErr(true); return; }
    PM.auth.register({ first: first, last: last, phone: phone });
    PM.toast('حساب شما ساخته شد', true);
    window.location.hash = '#/account';
  };
  return (
    <div className="shell">
      <div className="auth-wrap">
        <form className="auth-card" id="registerForm" onSubmit={submit}>
          <div className="auth-logo"><img src="assets/logo/logo-white.png" alt="پرومیت" /></div>
          <h1>ساخت حساب جدید</h1>
          <p className="a-sub">چند ثانیه وقت کافی است؛ سفارش‌ها و رزروهایتان همیشه در دسترس</p>
          <div className="form-grid">
            <div className="field"><label htmlFor="rFirst">نام</label><input className="input" id="rFirst" required /></div>
            <div className="field"><label htmlFor="rLast">نام خانوادگی</label><input className="input" id="rLast" required /></div>
          </div>
          <div className="field">
            <label htmlFor="rPhone">شماره موبایل</label>
            <input className="input" id="rPhone" inputMode="tel" placeholder="۰۹۱۲۱۲۳۴۵۶۷" required />
          </div>
          <div className="field">
            <label htmlFor="rPass">رمز عبور</label>
            <input className="input" id="rPass" type="password" placeholder="حداقل ۶ کاراکتر" required minLength="6" />
          </div>
          <label className="check mb-3" style={{ marginBottom: '18px' }}>
            <input type="checkbox" id="rAgree" required />
            <span>قوانین و حریم خصوصی پرومیت را می‌پذیرم</span>
          </label>
          <p className={'field-error' + (err ? '' : ' hide')} id="regErr">لطفاً همه فیلدها را کامل کنید</p>
          <button className="btn btn-primary btn-block btn-lg" type="submit">ثبت‌نام</button>
          <p className="auth-alt">قبلا ثبت‌نام کرده‌اید؟ <a href="#/auth/login">ورود</a></p>
        </form>
      </div>
    </div>
  );
}

/* ================= ABOUT ================= */
export function About() {
  const d = data();
  return (
    <div className="shell">
      <section className="page-hero about-hero hero-crumbed">
        <span className="ph-bg"><img src="assets/img/hero-about.jpg" alt="" fetchPriority="high" /></span>
        <div className="ph-inner" style={{ paddingBottom: '30px' }}>
          <Crumbs items={[{ t: 'پرومیت' }, { t: 'درباره ما' }]} />
          <p className="sub-en" style={{ color: 'rgba(255,255,255,.6)', textAlign: 'right' }}>از سال 1398</p>
          <h1 className="hero-hi">درباره پرومیت</h1>
          <p className="hero-desc">یک کاسبی خانوادگی که به قیمت منصفانه و گوشت تازه ایمان دارد.</p>
        </div>
      </section>

      {/* ---------- 1 · ABOUT PROMEAT ---------- */}
      <section className="section">
        <div className="story-grid">
          <div className="reveal">
            <h2 className="h2">پرومیت چیست</h2>
            <p className="story-p">
              پرومیت یک مجموعه‌ی خانوادگی است که محصولات پروتئینی تازه را با قیمت منصفانه به دست شما می‌رساند؛
              در سه شکل: خرید از فروشگاه، غذا در رستوران، و بیرون‌بر آماده.
            </p>
            <p className="story-p">
              هر سه بخش از یک منبع تأمین، یک استاندارد بهداشتی و یک تیم می‌آیند. تیم آشپزخانه از همان گوشتی
              استفاده می‌کند که در بسته‌بندی به دست شما می‌رسد.
            </p>
          </div>
          <div className="sg-img img-frame reveal">
            <img src="assets/img/story-butcher.jpg" alt="محصولات پروتئینی پرومیت" loading="lazy" />
            <span className="img-fallback">{svg('box')}</span>
          </div>
        </div>
      </section>

      {/* ---------- 2 · QUALITY & SOURCING ---------- */}
      <section className="section-tight">
        <SecHead icon="truck" title="کیفیت و تأمین" sub="بدون واسطه، با کنترل کامل زنجیره سرما" />
        <div className="story-grid">
          <div className="reveal">
            <p className="story-p">
              پرومیت محصولات خود را مستقیماً از مزارع و کشتارگاه‌های همکار تأمین می‌کند؛ بدون دست‌دوم، بدون واسطه.
              هر بسته تا لحظه‌ی تحویل در زنجیره‌ی سرما نگهداری می‌شود و شماره پیگیری بهداشتی دارد.
            </p>
            <ul className="check-list">
              {d.supplyPoints.map(p => (
                <li key={p.t}>{svg('checkCircle')}<span><strong>{p.t}</strong> — {p.s}</span></li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <div className="small muted-2 mb-2" style={{ marginBottom: '10px' }}>شهرهای تحت پوشش</div>
            <div className="cities-row" style={{ justifyContent: 'flex-start' }}>
              {d.cities.map(c => <span className="city-pill" key={c}>{svg('pin')}{c}</span>)}
            </div>
            <div className="img-frame mt-3" style={{ marginTop: '18px', aspectRatio: '5/4' }}>
              <img src="assets/img/team-kitchen.jpg" alt="تیم پرومیت" loading="lazy" />
              <span className="img-fallback">{svg('chef')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================= 404 ================= */
export function NotFound() {
  return (
    <div className="shell page-top-pad">
      <div className="section">
        <Empty
          icon="search"
          title="صفحه‌ای پیدا نشد"
          text="موردی که دنبال آن بودید وجود ندارد یا جابه‌جا شده است."
          cta={{ href: '#/', label: 'بازگشت به صفحه اصلی' }}
        />
      </div>
    </div>
  );
}

export default {
  Login, Register, About, Account, Orders, Reservations,
  Favorites, Addresses, Settings, Wallet, NotFound
};
