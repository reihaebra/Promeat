/* ============================================================
   ProMeat — takeaway.jsx
   Faithful JSX port of js/views-takeaway.js
   (takeawayHome · tkCategory · tkProduct + tkPick/tkMult/tkExtra/tkVariant)
   ============================================================ */
import React, { useState, useRef, useEffect } from 'react';
import { PM } from '../lib/state.js';
import { svg } from '../components/icons.jsx';
import { ui } from '../lib/ui.js';
import { bump } from '../lib/hooks.js';
import { takeawayState, filtersFor, sectionItems, applyFilters } from '../lib/viewstate.js';
import { addFromDetail, handleAction } from '../lib/actions.js';
import {
  SecHead, CatNav, GridCards, Crumbs, Benefits, ReviewSection, Empty,
  Stars, FavBtn, PdBlocks, ListToolbar
} from '../components/ui.jsx';
import { toPersianDigits, formatAmount } from '../utils/format.js';

/* ============ option selection (module-level, PM.views.tkPick) ============ */
const pick = { size: 0, sauce: 0, extra: 0, qty: 1 };
export const tkPick = pick;

/* source only refreshes #tkPrice after an option click (updatePdPrice),
   the first paint always shows the plain base price */
let pickTouched = false;

function resetPick() {
  pick.size = 0; pick.sauce = 0; pick.extra = 0; pick.qty = 1;
  pickTouched = false;
}

const optAt = (arr, i) => (arr && arr.length ? arr[Math.max(0, Math.min(i, arr.length - 1))] : null);

export function tkVariant(p) {
  const o = p.opts || {};
  const parts = [];
  const size = optAt(o.sizes, pick.size);
  const sauce = optAt(o.sauces, pick.sauce);
  const extra = optAt(o.extras, pick.extra);
  if (size) parts.push(size.label);
  if (sauce) parts.push(sauce.label);
  if (extra && pick.extra > 0) parts.push(extra.label);
  return parts.join(' · ');
}

export function tkMult(p) {
  const o = p.opts || {};
  const size = optAt(o.sizes, pick.size);
  return size ? (size.mult || 1) : 1;
}

export function tkExtra(p) {
  const o = p.opts || {};
  const extra = optAt(o.extras, pick.extra);
  return extra ? (extra.price || 0) : 0;
}

/* ============ TAKEAWAY HOME ============ */
export function TakeawayHome() {
  const data = PM.data;
  const featured = data.takeawayProducts.slice().sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 8);
  const packs = data.takeawayProducts.filter(p => p.cat === 'package');

  const steps = [
    ['۱', 'انتخاب غذا', 'منو را ببینید و آیتم‌ها را با سس دلخواه انتخاب کنید'],
    ['۲', 'ثبت سفارش', 'آدرس و روش ارسال را مشخص کنید و پرداخت کنید'],
    ['۳', 'آماده‌سازی', 'غذا تازه سرخ می‌شود و در جعبه عایق‌دار بسته‌بندی می‌شود'],
    ['۴', 'تحویل', 'پیک اختصاصی سفارش را داغ تا درِ خانه می‌آورد']
  ];

  return (
    <div className="shell">

      {/* ---------- HERO ---------- */}
      <section className="page-hero home-hero">
        <span className="ph-bg"><img src="assets/img/hero-takeaway.jpg" alt="" fetchPriority="high" /></span>
        <div className="ph-inner">
          <h1 className="hero-hi">بیرون‌بر<br />پرومیت</h1>
          <p className="hero-desc">
            <strong style={{ color: 'var(--white)' }}>داغ، ترد، سریع.</strong><br />
            مرغ سوخاری، دونر و پکیج‌های ویژه؛ آماده و ارسالی تا درِ خانه.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary btn-lg" href="#/takeaway/c/fried">مشاهده منو</a>
            <button className="btn btn-ghost btn-lg" type="button" data-open-cart="" onClick={() => ui.openCart()}>
              سبد خرید
            </button>
          </div>
          <div className="hero-badge-row">
            <span className="hero-badge">{svg('clock')}آماده‌سازی ۱۵ دقیقه</span>
            <span className="hero-badge">{svg('truck')}ارسال سریع</span>
            <span className="hero-badge">{svg('fire')}سرخ‌شده تازه</span>
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES (shared category-card component) ---------- */}
      <section className="section-tight">
        <SecHead icon="grid" title="دسته‌بندی بیرون‌بر" sub="هر چیزی که برای یک غذای سریع لازم دارید" />
        <CatNav
          list={data.takeawayCats.map(c => ({
            id: c.id, fa: c.fa, img: c.img,
            count: data.takeawayProducts.filter(p => p.cat === c.id).length,
            countUnit: 'آیتم'
          }))}
          opts={{ hrefPrefix: '#/takeaway/c/' }}
        />
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="section-tight">
        <SecHead icon="fire" title="محبوب‌ترین‌های بیرون‌بر" href="#/takeaway/c/fried" />
        <GridCards list={featured} section="takeaway" />
      </section>

      {/* ---------- PACKAGES ---------- */}
      <section className="section-tight">
        <SecHead icon="box" title="پکیج‌های ویژه" sub="اقتصادی‌ترین انتخاب برای گروه‌ها" href="#/takeaway/c/package" />
        <div className="promo-split">
          {packs.map(p => (
            <a className="promo-card reveal" href={'#/tk/' + p.id} key={p.id}>
              <img src={p.img} alt="" loading="lazy" />
              {p.badge ? (
                <span className="chip chip-red" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>{p.badge}</span>
              ) : null}
              <span className="pc-t">{p.name}</span>
              <span className="pc-s">{p.desc}</span>
              <span className="btn btn-white">{formatAmount(p.price)} تومان</span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section className="section-tight">
        <Benefits />
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section-tight">
        <SecHead icon="clock" title="از سفارش تا تحویل" />
        <div className="steps-row reveal">
          {steps.map(s => (
            <div className="step-box" key={s[0]}>
              <span className="s-n">{s[0]}</span>
              <span className="s-t">{s[1]}</span>
              <span className="s-s">{s[2]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CROSS PROMOS ---------- */}
      <section className="section-tight">
        <div className="promo-split">
          <a className="promo-card reveal" href="#/store">
            <img src="assets/img/hero-store.jpg" alt="" loading="lazy" />
            <span className="chip chip-red" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>فروشگاه</span>
            <span className="pc-t">گوشت تازه بخرید، خودتان بپزید</span>
            <span className="pc-s">عرضه مستقیم محصولات پروتئینی با بسته‌بندی خلأ.</span>
            <span className="btn btn-white">مشاهده فروشگاه</span>
          </a>
          <a className="promo-card reveal" href="#/restaurant">
            <img src="assets/img/hero-restaurant.jpg" alt="" loading="lazy" />
            <span className="chip chip-red" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>رستوران</span>
            <span className="pc-t">میزتان را رزرو کنید</span>
            <span className="pc-s">کباب و استیک روی ذغال در شعبه دزفول.</span>
            <span className="btn btn-white">مشاهده منو</span>
          </a>
        </div>
      </section>

      <ReviewSection scope="takeaway" score={4.7} count={1476} title="دیدگاه مشتریان بیرون‌بر" />
    </div>
  );
}

/* ============ CATEGORY ============ */
export function TkCategory({ cat: catId }) {
  const data = PM.data;
  const cat = catId === 'all'
    ? { id: 'all', fa: 'همه محصولات', en: 'ALL', desc: 'تمام آیتم‌های بیرون‌بر پرومیت در یکجا.', img: 'assets/img/hero-takeaway.jpg', icon: 'grid' }
    : (data.byId(data.takeawayCats, catId) || data.takeawayCats[0]);

  /* source quirk: `takeawayState.cat = cat.id;` — the page depth is deliberately NOT
     restarted when the category changes (views-takeaway.js:145) */
  takeawayState.cat = cat.id;

  const f = filtersFor('takeaway');
  const list = applyFilters(sectionItems('takeaway'), 'takeaway');
  const shown = list.slice(0, f.page * 8);

  return (
    <div className="shell">
      <section className="page-hero hero-crumbed">
        <span className="ph-bg"><img src={cat.img} alt="" loading="lazy" /></span>
        <div className="ph-inner" style={{ paddingBottom: '26px' }}>
          <Crumbs items={[{ t: 'بیرون‌بر', href: '#/takeaway' }, { t: cat.fa }]} />
          <span className="chip chip-red">{cat.en || 'TAKE AWAY'}</span>
          <h1 className="h1 mt-2">{cat.fa}</h1>
          <p className="hero-desc">{cat.desc || 'انتخاب کنید، آماده می‌کنیم، داغ تحویل می‌دهیم.'}</p>
        </div>
      </section>

      <CatNav
        list={data.takeawayCats.map(c => ({
          id: c.id, fa: c.fa, img: c.img, active: c.id === cat.id,
          count: data.takeawayProducts.filter(p => p.cat === c.id).length,
          countUnit: 'آیتم'
        }))}
        opts={{ hrefPrefix: '#/takeaway/c/' }}
      />

      <ListToolbar section="takeaway" count={list.length} unit="آیتم" />

      {shown.length ? (
        <GridCards list={shown} section="takeaway" />
      ) : (
        <Empty
          icon="search"
          title="آیتمی پیدا نشد"
          text="دسته‌ی دیگری را امتحان کنید یا فیلترها را پاک کنید."
          btn={{
            act: 'clear-filters',
            label: 'پاک کردن فیلترها',
            onClick: () => handleAction('clear-filters', 'takeaway')
          }}
        />
      )}

      {shown.length < list.length ? (
        <div className="load-wrap">
          <button
            type="button"
            className="btn btn-ghost"
            data-tk-more=""
            onClick={() => { f.page++; bump(); }}
          >
            نمایش آیتم بیشتر
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ============ detail tabs (source tkTabs — HTML strings → JSX) ============ */
function tkTabs(p) {
  return {
    t1: (
      <>
        {p.desc}<br /><br />
        همه آیتم‌ها پس از ثبت سفارش تازه آماده می‌شوند و در جعبه عایق‌دار تحویل داده می‌شوند.
      </>
    ),
    t2: (
      <div className="spec-table">
        <div className="row"><span>دسته‌بندی</span><span>{p.cat}</span></div>
        <div className="row"><span>واحد</span><span>{p.unit}</span></div>
        <div className="row"><span>امتیاز</span><span>{toPersianDigits(p.rating.toFixed(1))} از ۵</span></div>
        <div className="row"><span>دیدگاه</span><span>{toPersianDigits(p.reviews)}</span></div>
        <div className="row"><span>زمان آماده‌سازی</span><span>۱۵ تا ۲۰ دقیقه</span></div>
      </div>
    ),
    t3: 'در جای خنک و دور از نور مستقیم نگهداری شود. پیش از مصرف گرم شود. پس از باز شدن حداکثر طی ۲ ساعت مصرف شود.',
    t4: 'ارسال با پیک اختصاصی در محدوده شهر. زمان تقریبی تحویل ۲۰ تا ۴۰ دقیقه بسته به ترافیک. سفارش‌های بالای ۱٬۰۰۰٬۰۰۰ تومان ارسال رایگان دارند.'
  };
}

/* initial stepper value: quantity of the default cart line for this product */
function initQty(id) {
  const p = PM.data.byId(PM.data.takeawayProducts, id);
  if (!p) return 1;
  return PM.cart.qtyOf('takeaway', p.id, PM.defaultConfig('takeaway', p).variant) || 1;
}

/* ============ PRODUCT DETAIL ============ */
export function TkProduct({ id }) {
  const data = PM.data;
  const p = data.byId(data.takeawayProducts, id);

  /* module-level pick: reset when the route shows another product (source resets on every view render) */
  const [pid, setPid] = useState(id);
  const [qty, setQty] = useState(() => initQty(id));
  const [mainSrc, setMainSrc] = useState(p ? p.img : '');
  const [thumbOn, setThumbOn] = useState(0);
  const [, setTick] = useState(0);
  const numRef = useRef(null);

  if (pid !== id) {
    setPid(id);
    resetPick();
    setQty(initQty(id));
    setMainSrc(p ? p.img : '');
    setThumbOn(0);
  }

  /* leaving the detail page forgets the customisation (source re-render resets pick) */
  useEffect(() => () => resetPick(), []);

  if (!p) {
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

  const cat = data.byId(data.takeawayCats, p.cat);
  const related = data.takeawayProducts.filter(x => x.id !== p.id)
    .sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 4);
  const o = p.opts || {};
  const tabs = tkTabs(p);
  const variant = tkVariant(p);
  const thumbs = [p.img, cat.img, 'assets/img/tk-fries.jpg'];

  /* #tkPrice: plain base price until an option is clicked (source updatePdPrice) */
  const priceNow = pickTouched
    ? formatAmount(PM.priceFor(p, tkMult(p)) + tkExtra(p))
    : formatAmount(p.price);

  /* price suffix per option kind: sizes are ratios, extras are flat toman */
  function suffix(key, x) {
    if (key === 'extra') {
      return x.price
        ? <>{' '}<span className="small">+{formatAmount(x.price)} تومان</span></>
        : null;
    }
    if (x.mult > 1) {
      return <>{' '}<span className="small">+{toPersianDigits(Math.round((x.mult - 1) * 100))}٪</span></>;
    }
    return null;
  }

  function optGroup(title, key, options) {
    if (!options || !options.length) return null;
    return (
      <div className="pd-opt">
        <div className="opt-t">{title}</div>
        <div className="segmented" data-opt={key}>
          {options.map((x, i) => (
            <button
              type="button"
              key={i}
              className={pick[key] === i ? 'active' : ''}
              data-opt-i={i}
              onClick={() => onOpt(key, i)}
            >
              {x.label}{suffix(key, x)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* source: tkPick[key] = i + updatePdPrice() + syncDetailQty() */
  function onOpt(key, i) {
    pick[key] = i;
    pickTouched = true;
    setQty(PM.cart.qtyOf('takeaway', p.id, tkVariant(p)) || 1);
    setTick(t => t + 1);
  }

  /* source: #pdQty .q-num + data-pd-step (clamped 1..20, mirrored into the cart line) */
  function onPdStep(delta) {
    const v = Math.max(1, Math.min(20, qty + delta));
    setQty(v);
    const el = numRef.current;
    if (el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
    /* detail ↔ cart: when this exact item/variant already sits in the cart, mirror the change */
    const hit = (PM.cart.items || []).filter(
      x => x.type === 'takeaway' && x.id === p.id && (x.variant || '') === (variant || '')
    );
    if (hit.length === 1) PM.cart.setQty(hit[0].key, v);
  }

  /* source: data-tk-add → addFromDetail() + stepper back to ۱ */
  function onAdd() {
    addFromDetail({
      type: 'takeaway', id: p.id, isTk: true, qty: qty,
      mult: tkMult(p), extra: tkExtra(p), variant: tkVariant(p)
    });
    setQty(1);
  }

  function onThumb(g, i) {
    setMainSrc(g);
    setThumbOn(i);
  }

  return (
    <div className="shell">
      <Crumbs items={[
        { t: 'بیرون‌بر', href: '#/takeaway' },
        { t: cat.fa, href: '#/takeaway/c/' + cat.id },
        { t: p.name }
      ]} />

      <section className="pd-grid section-tight">
        <div className="pd-gallery">
          <div className="pd-main-img img-frame">
            <img src={mainSrc} alt={p.name} fetchPriority="high" />
            <span className="img-fallback">{svg('bag')}</span>
          </div>
          <div className="pd-thumbs">
            {thumbs.map((g, i) => (
              <button
                type="button"
                key={i}
                className={'th' + (i === thumbOn ? ' on' : '')}
                data-thumb={g}
                aria-label={'نمای ' + toPersianDigits(i + 1)}
                onClick={() => onThumb(g, i)}
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
            <span className="chip chip-dark">{svg('clock')}۱۵ دقیقه</span>
          </div>
          <h1 className="mt-2">{p.name}</h1>
          <div className="pd-meta-row">
            <Stars rating={p.rating} count={p.reviews} />
            <span className="small muted-2">{p.unit}</span>
          </div>
          <p className="pd-desc">{p.desc}</p>

          <div className="pd-price-row">
            <span className="price" id="tkPrice">{priceNow}<span className="toman">تومان</span></span>
            <span className="small muted-2" style={{ marginInlineStart: 'auto' }}>{p.unit}</span>
          </div>

          {optGroup('سایز', 'size', o.sizes)}
          {optGroup('سس', 'sauce', o.sauces)}
          {optGroup('افزودنی', 'extra', o.extras)}

          <div className="pd-opt">
            <div className="opt-t">تعداد</div>
            <span className="qty solid" id="pdQty">
              <button type="button" data-pd-step="-1" aria-label="کاهش" onClick={() => onPdStep(-1)}>
                {svg('minus')}
              </button>
              <span className="q-num" ref={numRef}>{toPersianDigits(qty)}</span>
              <button type="button" data-pd-step="1" aria-label="افزایش" onClick={() => onPdStep(1)}>
                {svg('plus')}
              </button>
            </span>
          </div>

          <div className="pd-actions">
            <button type="button" className="btn btn-primary btn-lg" data-tk-add={p.id} onClick={onAdd}>
              افزودن به سبد خرید
            </button>
            <FavBtn type="takeaway" id={p.id} extraCls="btn btn-ghost btn-lg" />
          </div>

          <PdBlocks list={[
            { t: 'اطلاعات محصول', b: tabs.t2 },
            { t: 'نگهداری', b: tabs.t3 },
            { t: 'ارسال و تحویل', b: tabs.t4 },
            { t: 'توضیحات', b: tabs.t1 }
          ]} />
        </div>
      </section>

      <ReviewSection scope={'takeaway:' + p.id} score={p.rating} count={p.reviews} title="دیدگاه مشتریان" />

      <section className="section-tight">
        <SecHead icon="moto" title="پیشنهادهای مرتبط" href={'#/takeaway/c/' + p.cat} />
        <GridCards list={related} section="takeaway" />
      </section>
    </div>
  );
}
