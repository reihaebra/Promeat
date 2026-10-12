/* ============================================================
   ProMeat — restaurant.jsx
   Restaurant home · branches · menu · dish detail · reservation
   (faithful JSX port of js/views-restaurant.js)
   ============================================================ */
import React, { useState } from 'react';
import { PM } from '../lib/state.js';
import { svg } from '../components/icons.jsx';
import { bump, usePM } from '../lib/hooks.js';
import { menuState, setMenuCat, filtersFor, sectionItems, applyFilters } from '../lib/viewstate.js';
import { rsv, DAYS, STEPS, foodSubtotal } from '../lib/rsv.js';
import { addFromDetail, confirmReservation, handleAction } from '../lib/actions.js';
import {
  Crumbs, SecHead, CatNav, CtaBand, GridFoods, GridCards, Stars, Price, FavBtn,
  QtyStepper, ReviewSection, Empty, ListToolbar
} from '../components/ui.jsx';
import { toPersianDigits, formatAmount } from '../utils/format.js';

const data = PM.data;

/* ============ shared: not-found markup (PM.views.notFound) ============ */
function notFoundPage() {
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

/* ============ shared: branch picker ============ */
function pickBranch(id) {
  rsv.branch = id;
  PM.toast('شعبه انتخاب شد', true);
}

/* ============ BRANCH CARD (PM.views._branchCard) ============ */
function BranchCard({ b, active, onPick }) {
  const soon = b.status === 'soon';
  return (
    /* the shared reveal observer puts `in` on this node by hand, so the selected
       state must not rewrite className — it would drop `in` and hide the card */
    <div className={'branch-card' + (soon ? ' branch-soon' : '') + ' reveal'} data-active={active ? '' : undefined}>
      <div className="bc-head">
        <span className="bc-name">شعبه {b.fa}</span>
        {soon
          ? <span className="status-pill soon"><span className="dot" />به‌زودی</span>
          : <span className="status-pill open"><span className="dot" />باز است</span>}
      </div>
      <div className="bc-row">{svg('pin')}<span><span className="bc-k">آدرس</span>{b.address}</span></div>
      <div className="bc-row">{svg('clock')}<span><span className="bc-k">ساعات کاری</span>{b.hours}</span></div>
      <div className="bc-row">{svg('phone')}<span><span className="bc-k">تماس</span>
        <span className="latin" style={{ letterSpacing: '.05em' }}>{b.phone}</span></span></div>
      <div className="bc-features">
        {b.features.map((f, i) => <span className="chip chip-outline" key={i}>{f}</span>)}
      </div>
      {soon ? (
        <button type="button" className="btn btn-ghost btn-block" disabled>به‌زودی افتتاح می‌شود</button>
      ) : (
        <button
          type="button"
          className={'btn ' + (active ? 'btn-primary' : 'btn-outline-red') + ' btn-block'}
          data-pick-branch={b.id}
          onClick={() => onPick(b.id)}
        >
          {active ? 'شعبه انتخاب شده' : 'انتخاب شعبه'}
        </button>
      )}
    </div>
  );
}

/* ============ RESTAURANT HOME ============ */
export function RestaurantHome() {
  const [, setTick] = useState(0);
  const onPick = id => { pickBranch(id); setTick(t => t + 1); };

  const branch = data.byId(data.branches, rsv.branch) || data.branches[0];
  const featured = data.dishes.slice().sort((a, b) => b.rating - a.rating).slice(0, 4);
  const popular = data.dishes.slice().sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 6);

  return (
    <div className="shell">

      {/* ---------- HERO ---------- */}
      <section className="page-hero home-hero">
        <span className="ph-bg"><img src="assets/img/hero-restaurant.jpg" alt="" fetchPriority="high" /></span>
        <div className="ph-inner">
          <div className="reveal">
            <span className="chip chip-red">شعبه فعال · {branch.fa}</span>
            <h1 className="h-display mt-2">رستوران<br />پرومیت</h1>
            <p className="hero-desc" style={{ maxWidth: '44ch' }}>کباب، استیک و غذاهای ایرانی با همان گوشت تازه‌ای که در فروشگاه پرومیت می‌بینید؛ از مزرعه تا آشپزخانه، بدون واسطه.</p>
            <div className="hero-ctas">
              <a className="btn btn-primary btn-lg" href="#/restaurant/menu">مشاهده منو</a>
              <a className="btn btn-ghost btn-lg" href="#/restaurant/reserve">رزرو میز</a>
            </div>
            <div className="hero-badge-row">
              <span className="hero-badge">{svg('clock')}هر روز ۱۲ تا ۲۳:۳۰</span>
              <span className="hero-badge">{svg('users')}سالن و تراس</span>
              <span className="hero-badge">{svg('calendar')}رزرو آنلاین</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BRANCH SELECTOR ---------- */}
      <section className="section-tight">
        <SecHead icon="pin" title="شعب رستوران پرومیت" sub={'شعبه‌ی فعال: ' + branch.fa} href="#/restaurant/branches" more="همه شعب" />
        <div className="branch-grid">
          {data.branches.slice(0, 3).map(b => (
            <BranchCard key={b.id} b={b} active={b.id === rsv.branch} onPick={onPick} />
          ))}
        </div>
      </section>

      {/* ---------- MENU CATEGORIES (shared category-card component) ---------- */}
      <section className="section-tight">
        <SecHead icon="utensils" title="دسته‌بندی منو" href="#/restaurant/menu" />
        <CatNav
          list={data.restaurantCats.map(c => ({
            id: c.id, fa: c.fa, img: c.img,
            count: data.dishes.filter(x => x.cat === c.id).length,
            countUnit: 'غذا'
          }))}
          opts={{ hrefPrefix: '#/restaurant/menu?c=' }}
        />
      </section>

      {/* ---------- FEATURED DISHES ---------- */}
      <section className="section-tight">
        <SecHead icon="fire" title="پیشنهاد سرآشپز" sub="غذاهایی که بیشترین امتیاز را دارند" href="#/restaurant/menu" />
        <GridCards list={featured} section="restaurant" />
      </section>

      {/* ---------- RESERVATION CTA ---------- */}
      <section className="section-tight">
        <CtaBand
          title="میزتان را رزرو کنید"
          text="رزرو آنلاین، انتخاب میز و پیش‌سفارش غذا پیش از رسیدن — در چهار مرحله."
          href="#/restaurant/reserve"
          label="شروع رزرو"
          img="assets/img/reserve-hall.jpg"
        />
      </section>

      {/* ---------- POPULAR ---------- */}
      <section className="section-tight">
        <SecHead icon="star" title="محبوب‌ترین غذاها" href="#/restaurant/menu" />
        <GridCards list={popular} section="restaurant" />
      </section>

      {/* ---------- STORY ---------- */}
      <section className="section">
        <div className="story-grid">
          <div className="reveal">
            <p className="sub-en">FIRE · SMOKE · TRADITION</p>
            <h2 className="h1 mt-2">آشپزخانه‌ای که به فروشگاه وصل است</h2>
            <p className="story-p">هر صبح، همان لاشه‌ای که برای فروشگاه آنلاین بسته‌بندی می‌شود، بخشی از آن به آشپزخانه‌ی رستوران می‌رود. برای همین است که وقتی کوبیده‌ی ما را می‌خورید، دقیقا همان کیفیتی را حس می‌کنید که در بسته‌بندی پرومیت دیده‌اید.</p>
            <ul className="check-list">
              <li>{svg('checkCircle')}<span>کباب روی ذغال طبیعی، نه شعله گازی</span></li>
              <li>{svg('checkCircle')}<span>استیک‌های رسیده‌شده ۲۱ روزه در سردخانه‌ی اختصاصی</span></li>
              <li>{svg('checkCircle')}<span>برنج ایرانی درجه یک و روغن کنجد</span></li>
            </ul>
          </div>
          <div className="sg-img img-frame reveal">
            <img src="assets/img/story-grill.jpg" alt="کباب روی ذغال" loading="lazy" />
            <span className="img-fallback">{svg('fire')}</span>
          </div>
        </div>
      </section>

      {/* ---------- REVIEWS ---------- */}
      <ReviewSection scope="restaurant" score={4.8} count={1932} title="دیدگاه مهمانان رستوران" />

    </div>
  );
}

/* ============ BRANCHES PAGE ============ */
export function Branches() {
  const [, setTick] = useState(0);
  const onPick = id => { pickBranch(id); setTick(t => t + 1); };

  return (
    <div className="shell">
      <Crumbs items={[{ t: 'رستوران', href: '#/restaurant' }, { t: 'شعب' }]} />
      <div className="section-tight">
        <h1 className="h1">شعب رستوران پرومیت</h1>
        <p className="muted mt-1">شعبه‌ی دزفول هم‌اکنون فعال است و شعب دیگر به‌زودی افتتاح می‌شوند.</p>
      </div>
      <div className="branch-grid">
        {data.branches.map(b => (
          <BranchCard key={b.id} b={b} active={b.id === rsv.branch} onPick={onPick} />
        ))}
      </div>

      <section className="section">
        <div className="story-grid">
          <div className="reveal">
            <h2 className="h2">خدمات شعبه‌ی دزفول</h2>
            <ul className="check-list">
              <li>{svg('checkCircle')}<span>سالن سرپوشیده، تراس رو باز و اتاق خصوصی VIP</span></li>
              <li>{svg('checkCircle')}<span>رزرو آنلاین میز با امکان پیش‌سفارش غذا</span></li>
              <li>{svg('checkCircle')}<span>پارکینگ رایگان و اینترنت بی‌سیم مهمان</span></li>
              <li>{svg('checkCircle')}<span>منوی کودک و گزینه‌های کم‌چرب</span></li>
            </ul>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#/restaurant/reserve">رزرو میز</a>
            </div>
          </div>
          <div className="sg-img img-frame reveal">
            <img src="assets/img/chef.jpg" alt="آشپز رستوران پرومیت" loading="lazy" />
            <span className="img-fallback">{svg('chef')}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============ MENU ============ */
export function Menu() {
  const f = filtersFor('restaurant');
  const list = applyFilters(sectionItems('restaurant'), 'restaurant');
  const shown = list.slice(0, f.page * 8);

  const catNavList = [{ id: 'all', fa: 'همه', img: 'assets/img/grill-fire.jpg', active: menuState.cat === 'all', count: data.dishes.length, countUnit: 'غذا' }]
    .concat(data.restaurantCats.map(c => ({
      id: c.id, fa: c.fa, img: c.img, active: menuState.cat === c.id,
      count: data.dishes.filter(x => x.cat === c.id).length, countUnit: 'غذا'
    })));

  return (
    <div className="shell">
      <section className="page-hero menu-hero hero-crumbed">
        <span className="ph-bg"><img src="assets/img/rs-koobideh.jpg" alt="" loading="lazy" /></span>
        <div className="ph-inner" style={{ paddingBottom: '24px' }}>
          <Crumbs items={[{ t: 'رستوران', href: '#/restaurant' }, { t: 'منو' }]} />
          <span className="chip chip-red">منوی رستوران</span>
          <h1 className="h1 mt-2">منوی {(data.byId(data.branches, rsv.branch) || data.branches[0]).fa}</h1>
          <p className="hero-desc">{toPersianDigits(data.dishes.length)} غذا در {toPersianDigits(data.restaurantCats.length)} دسته‌بندی · همه با گوشت تازه‌ی پرومیت</p>
        </div>
      </section>

      <CatNav
        list={catNavList}
        opts={{
          button: true, attr: 'data-menu-cat',
          onPick: c => { setMenuCat(c); bump(); }
        }}
      />

      <ListToolbar section="restaurant" count={list.length} unit="غذا" />

      {shown.length ? (
        <GridCards list={shown} section="restaurant" />
      ) : (
        <Empty
          icon="utensil2"
          title="در این دسته غذایی موجود نیست"
          text="دسته‌ی دیگری را انتخاب کنید یا فیلترها را پاک کنید."
          btn={{ act: 'menu-all', label: 'نمایش همه غذاها', onClick: () => handleAction('menu-all') }}
        />
      )}

      {shown.length < list.length ? (
        <div className="load-wrap">
          <button type="button" className="btn btn-ghost" data-menu-more=""
            onClick={() => { f.page++; bump(); }}>نمایش غذای بیشتر</button>
        </div>
      ) : null}
    </div>
  );
}

/* ============ DISH DETAIL ============ */
export function Dish({ id }) {
  const p = data.byId(data.dishes, id);
  const [thumb, setThumb] = useState({ id: id, i: 0 });
  const [qtyState, setQtyState] = useState({ id: id, v: p ? (PM.cart.qtyOf('restaurant', p.id, '') || 1) : 1 });

  if (!p) return notFoundPage();

  const cat = data.byId(data.restaurantCats, p.cat);
  const related = data.dishes.filter(x => x.id !== p.id && x.cat === p.cat)
    .concat(data.dishes.filter(x => x.id !== p.id && x.cat !== p.cat)).slice(0, 4);

  const thumbs = [p.img, cat.img, 'assets/img/grill-fire.jpg', 'assets/img/spices.jpg'];
  const ti = thumb.id === id ? thumb.i : 0;
  const qty = qtyState.id === id ? qtyState.v : (PM.cart.qtyOf('restaurant', p.id, '') || 1);

  const stepQty = delta => {
    const v = Math.max(1, Math.min(20, qty + delta));
    setQtyState({ id: id, v: v });
    /* detail ↔ cart: when this exact line already sits in the cart, mirror the change */
    const hit = PM.cart.items.filter(x => x.type === 'restaurant' && x.id === p.id && (x.variant || '') === '');
    if (hit.length === 1) PM.cart.setQty(hit[0].key, v);
  };

  return (
    <div className="shell">
      <Crumbs items={[{ t: 'رستوران', href: '#/restaurant' }, { t: 'منو', href: '#/restaurant/menu' }, { t: p.name }]} />

      <section className="pd-grid section-tight">
        <div className="pd-gallery">
          <div className="pd-main-img img-frame">
            <img src={thumbs[ti]} alt={p.name} fetchPriority="high" />
            <span className="img-fallback">{svg('drum')}</span>
          </div>
          <div className="pd-thumbs">
            {thumbs.map((g, i) => (
              <button
                type="button"
                key={g + ':' + i}
                className={'th' + (i === ti ? ' on' : '')}
                data-thumb={g}
                aria-label={'نمای ' + toPersianDigits(i + 1)}
                onClick={() => setThumb({ id: id, i: i })}
              >
                <img src={g} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="pd-info">
          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            {p.badge ? <span className="chip chip-red">{p.badge}</span> : null}
            <span className="chip chip-outline">{cat.fa}</span>
            <span className="chip chip-dark">{svg('clock')}۲۰ دقیقه</span>
          </div>
          <h1 className="mt-2">{p.name}</h1>
          <div className="pd-meta-row">
            <Stars rating={p.rating} count={p.reviews} />
            <span className="small muted-2">{p.unit}</span>
            <span className="small muted-2">{svg('users')} پرفروش {toPersianDigits(data.dishes.filter(x => x.cat === p.cat).length)} غذا</span>
          </div>
          <p className="pd-desc">{p.desc}</p>

          <div className="pd-opt">
            <div className="opt-t">مواد اولیه</div>
            <p className="small muted" style={{ lineHeight: '2' }}>{p.ingredients}</p>
          </div>

          <div className="pd-price-row">
            <Price p={p} />
            <span className="small muted-2" style={{ marginInlineStart: 'auto' }}>{p.unit}</span>
          </div>

          <div className="pd-opt">
            <div className="opt-t">تعداد</div>
            <span className="qty solid" id="pdQty">
              <button type="button" data-pd-step="-1" aria-label="کاهش" onClick={() => stepQty(-1)}>{svg('minus')}</button>
              <span className="q-num">{toPersianDigits(qty)}</span>
              <button type="button" data-pd-step="1" aria-label="افزایش" onClick={() => stepQty(1)}>{svg('plus')}</button>
            </span>
          </div>

          <div className="pd-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              data-pd-add={p.id}
              data-pd-type="restaurant"
              onClick={() => addFromDetail({ type: 'restaurant', id: p.id, isTk: false, qty: qty, mult: 1, extra: 0, variant: '' })}
            >
              افزودن به سبد
            </button>
            <FavBtn type="restaurant" id={p.id} extraCls="btn btn-ghost btn-lg" />
          </div>

          <div className="hero-badge-row">
            <span className="hero-badge">{svg('fire')}پخت روی ذغال</span>
            <span className="hero-badge">{svg('leaf')}گوشت کشتار روز</span>
          </div>
        </div>
      </section>

      <ReviewSection scope={'restaurant:' + p.id} score={p.rating} count={p.reviews} title="دیدگاه مهمانان" />

      <section className="section-tight">
        <SecHead icon="utensil2" title="غذاهای مرتبط" href="#/restaurant/menu" />
        <GridFoods list={related} section="restaurant" />
      </section>
    </div>
  );
}

/* ============ RESERVATION FLOW ============ */
export function Reserve() {
  usePM();
  const [, setTick] = useState(0);
  const tick = () => setTick(t => t + 1);

  const branch = data.byId(data.branches, rsv.branch) || data.branches[0];

  const pick = id => { pickBranch(id); tick(); };
  const pickDay = x => { rsv.day = x.day; rsv.month = x.month; rsv.dateFull = x.dateFull; tick(); };
  const pickTime = t => { rsv.time = t; tick(); };
  const pickGuests = g => { rsv.guests = g; tick(); };
  const pickTable = n => { rsv.table = n; tick(); };
  const rsvFood = (dishId, delta) => {
    const cur = rsv.food[dishId] || 0;
    const next = Math.max(0, Math.min(10, cur + delta));
    if (next === 0) delete rsv.food[dishId]; else rsv.food[dishId] = next;
    tick();
  };
  const rsvDel = dishId => { delete rsv.food[dishId]; tick(); };
  const goBack = () => { rsv.step = Math.max(1, rsv.step - 1); tick(); };
  const goNext = () => {
    if (rsv.step === 4) { confirmReservation(); return; }
    rsv.step = Math.min(4, rsv.step + 1);
    tick();
  };

  const steps = (
    <div className="rsv-steps">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const cls = rsv.step === n ? 'on' : (rsv.step > n ? 'done' : '');
        return (
          <React.Fragment key={i}>
            <span className={'rsv-step ' + cls}><span className="n">{rsv.step > n ? '✓' : toPersianDigits(n)}</span>{s}</span>
            {i < STEPS.length - 1 ? <span className="rsv-connector" /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );

  let body = null;

  if (rsv.step === 1) {
    body = (
      <>
        <div className="co-card">
          <h3><span className="step-n">۱</span>انتخاب شعبه</h3>
          <div className="branch-grid">
            {data.branches.map(b => (
              <BranchCard key={b.id} b={b} active={b.id === rsv.branch} onPick={pick} />
            ))}
          </div>
        </div>
        <div className="co-card">
          <h3><span className="step-n">۲</span>تاریخ</h3>
          <div className="time-grid">
            {DAYS.map(x => (
              <button
                type="button"
                key={x.dateFull}
                className={'time-slot' + (x.dateFull === rsv.dateFull ? ' on' : '')}
                data-rsv-day={x.dateFull}
                data-d={x.day}
                data-m={x.month}
                onClick={() => pickDay(x)}
              >
                {x.day}<br /><span className="small">{x.month}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="co-card">
          <h3><span className="step-n">۳</span>ساعت</h3>
          <div className="time-grid">
            {data.reservationTimes.map(t => (
              <button
                type="button"
                key={t}
                className={'time-slot' + (rsv.time === t ? ' on' : '')}
                data-rsv-time={t}
                onClick={() => pickTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="co-card">
          <h3><span className="step-n">۴</span>تعداد مهمان</h3>
          <div className="guest-grid">
            {data.reservationGuests.map(g => (
              <button
                type="button"
                key={g}
                className={'guest-slot' + (rsv.guests === g ? ' on' : '')}
                data-rsv-guests={g}
                onClick={() => pickGuests(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (rsv.step === 2) {
    body = (
      <div className="co-card">
        <h3><span className="step-n">۵</span>انتخاب میز</h3>
        <p className="small muted-2" style={{ marginBottom: '14px' }}>میزهای خاکستری در این بازه زمانی رزرو شده‌اند.</p>
        <div className="table-grid">
          {data.tables.map(t => (
            <button
              type="button"
              key={t.id}
              className={'table-card' + (rsv.table === t.name ? ' on' : '') + (t.dis ? ' dis' : '')}
              data-rsv-table={t.name}
              onClick={() => pickTable(t.name)}
            >
              <span className="t-name">{t.name}</span>
              <span className="t-sub">{t.sub}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (rsv.step === 3) {
    const inCart = Object.keys(rsv.food);
    body = (
      <div className="co-card">
        <h3><span className="step-n">۶</span>پیش‌سفارش غذا</h3>
        <p className="small muted-2" style={{ marginBottom: '14px' }}>غذای مورد علاقه‌تان را از قبل انتخاب کنید تا هنگام رسیدن آماده باشد. (اختیاری)</p>
        {inCart.length ? (
          <div className="rsv-food-sum">
            {inCart.map(dishId => {
              const d = data.byId(data.dishes, dishId);
              return (
                <div className="cart-item" style={{ gridTemplateColumns: '64px 1fr auto' }} key={dishId}>
                  <span className="ci-img img-frame" style={{ width: '64px', height: '64px' }}>
                    <img src={d.img} alt="" />
                    <span className="img-fallback">{svg('drum')}</span>
                  </span>
                  <div>
                    <div className="ci-name">{d.name}</div>
                    <div className="ci-price">{formatAmount(d.price * rsv.food[dishId])} تومان</div>
                    <div style={{ marginTop: '8px' }}>
                      <QtyStepper value={rsv.food[dishId]} k={'rsv:' + dishId} />
                    </div>
                  </div>
                  <div className="ci-side">
                    <button type="button" className="ci-remove" data-rsv-del={dishId} aria-label="حذف" onClick={() => rsvDel(dishId)}>
                      {svg('trash')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="grid-foods" style={{ marginTop: '16px' }}>
          {data.dishes.slice(0, 8).map(d => {
            const q = rsv.food[d.id] || 0;
            return (
              <div className="f-card" key={d.id}>
                <span className="f-img img-frame">
                  <img src={d.img} alt={d.name} loading="lazy" />
                  <span className="img-fallback">{svg('drum')}</span>
                </span>
                <div className="f-body">
                  <span className="f-name">{d.name}</span>
                  <p className="f-desc">{d.desc}</p>
                  <div className="f-foot">
                    <span className="price">{formatAmount(d.price)} تومان</span>
                    {q ? (
                      <span className="qty mini">
                        <button type="button" data-rsv-food={d.id} data-delta="-1" onClick={() => rsvFood(d.id, -1)}>{svg('minus')}</button>
                        <span className="q-num">{toPersianDigits(q)}</span>
                        <button type="button" data-rsv-food={d.id} data-delta="1" onClick={() => rsvFood(d.id, 1)}>{svg('plus')}</button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-icon btn-outline-red"
                        data-rsv-food={d.id}
                        data-delta="1"
                        aria-label={'افزودن ' + d.name}
                        onClick={() => rsvFood(d.id, 1)}
                      >
                        {svg('plus')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (rsv.step === 4) {
    const fs = foodSubtotal();
    body = (
      <div className="co-card">
        <h3><span className="step-n">۷</span>بررسی و تایید</h3>
        <div className="rsv-summary">
          <div className="row"><span className="k">شعبه</span><span>{branch.fa}</span></div>
          <div className="row"><span className="k">تاریخ</span><span>{rsv.dateFull}</span></div>
          <div className="row"><span className="k">ساعت</span><span>{rsv.time || '—'}</span></div>
          <div className="row"><span className="k">تعداد مهمان</span><span>{(rsv.guests || '—') + ' نفر'}</span></div>
          <div className="row"><span className="k">میز</span><span>{rsv.table || '—'}</span></div>
        </div>
        <div className="rsv-summary" style={{ marginTop: '14px' }}>
          <div className="row"><span className="k">جمع پیش‌سفارش غذا</span><span>{formatAmount(fs)} تومان</span></div>
          <div className="row"><span className="k">هزینه رزرو میز</span><span className="free">رایگان</span></div>
          <div className="row">
            <span className="k">مبلغ قابل پرداخت در رستوران</span>
            <span style={{ fontWeight: 800 }}>{formatAmount(fs)} تومان</span>
          </div>
        </div>
        {Object.keys(rsv.food).length ? (
          <div className="mt-3">
            <div className="small muted-2 mb-2">غذاهای پیش‌سفارش شده</div>
            {Object.keys(rsv.food).map(dishId => {
              const d = data.byId(data.dishes, dishId);
              return (
                <div className="row-between" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }} key={dishId}>
                  <span>{toPersianDigits(rsv.food[dishId])} × {d.name}</span>
                  <span className="small">{formatAmount(d.price * rsv.food[dishId])} تومان</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="small muted-2 mt-3">غذایی پیش‌سفارش نشده است.</p>
        )}
      </div>
    );
  }

  /* syncReserveNext(): step 1 → branch/time/guests · step 2 → table · 3–4 always */
  const canNext = rsv.step === 1 ? !!(rsv.branch && rsv.time && rsv.guests)
    : rsv.step === 2 ? !!rsv.table : true;
  const nextLabel = rsv.step === 4 ? 'تایید رزرو و پیش‌سفارش' : 'ادامه';

  return (
    <div className="shell">
      <Crumbs items={[{ t: 'رستوران', href: '#/restaurant' }, { t: 'رزرو میز' }]} />
      <div className="rsv-wrap section-tight">
        <h1 className="h1">رزرو میز</h1>
        <p className="muted mt-1">شعبه دزفول · {toPersianDigits(data.branches.filter(b => b.status === 'open').length)} شعبه فعال</p>
        {steps}
        {body}
        <div className="row mt-3" style={{ gap: '10px', justifyContent: 'space-between' }}>
          {rsv.step > 1 ? (
            <button type="button" className="btn btn-ghost" data-rsv-back="" onClick={goBack}>مرحله قبل</button>
          ) : (
            <span />
          )}
          <button type="button" className="btn btn-primary" data-rsv-next="" disabled={!canNext} onClick={goNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ RESERVATION DONE ============ */
export function ReserveDone({ id }) {
  const r = PM.reservations.byId(id) || PM.reservations.list[0];
  if (!r) return notFoundPage();

  const fs = (r.food || []).reduce((a, b) => a + b.qty * 300000, 0);

  return (
    <div className="shell page-top-pad">
      <div className="success-wrap section">
        <div className="success-ico">{svg('check')}</div>
        <h1 className="h1">رزرو شما با موفقیت ثبت شد</h1>
        <p className="muted mt-2">کد رزرو برای شما پیامک می‌شود. لطفاً ۱۰ دقیقه پیش از ساعت رزرو در شعبه حاضر شوید.</p>

        <div className="ticket">
          <div className="t-head">
            <span className="t-num">{r.id || ''}</span>
            <span className={'resv-status ' + r.status}>{PM.data._resvFa(r.status)}</span>
          </div>
          <div className="t-body">
            <div className="t-row"><span className="k">شماره رزرو</span><span className="v">{toPersianDigits(r.num)}</span></div>
            <div className="t-row"><span className="k">شعبه</span><span className="v">{r.branch}</span></div>
            <div className="t-row"><span className="k">تاریخ</span><span className="v">{r.dateFull}</span></div>
            <div className="t-row"><span className="k">ساعت</span><span className="v">{r.time}</span></div>
            <div className="t-row"><span className="k">تعداد مهمان</span><span className="v">{toPersianDigits(r.guests)} نفر</span></div>
            <div className="t-row"><span className="k">میز</span><span className="v">{r.table}</span></div>
            {(r.food || []).length ? (
              <div className="t-row">
                <span className="k">پیش‌سفارش غذا</span>
                <span className="v">{r.food.map(f => toPersianDigits(f.qty) + ' × ' + f.name).join('، ')}</span>
              </div>
            ) : (
              <div className="t-row"><span className="k">پیش‌سفارش غذا</span><span className="v">ندارد</span></div>
            )}
            <div className="t-row"><span className="k">مبلغ پیش‌سفارش</span><span className="v">{formatAmount(fs)} تومان</span></div>
          </div>
        </div>

        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <a className="btn btn-primary btn-lg" href="#/reservations">مشاهده رزروهای من</a>
          <a className="btn btn-ghost btn-lg" href="#/restaurant">بازگشت به رستوران</a>
        </div>
      </div>
    </div>
  );
}
