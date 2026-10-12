/* ============================================================
   ProMeat — store.jsx
   Store home · category listing · product detail · checkout ·
   order success (faithful JSX port of js/views-store.js)
   ============================================================ */
import React, { useState } from 'react';
import { PM } from '../lib/state.js';
import { svg } from '../components/icons.jsx';
import { bump } from '../lib/hooks.js';
import { filtersFor, setStoreCat, sectionItems, applyFilters } from '../lib/viewstate.js';
import { addFromDetail, handleAction, submitCheckout } from '../lib/actions.js';
import { Wallet as WalletSvc } from '../lib/wallet.js';
import {
  Crumbs, SecHead, CatNav, GridCards, Empty, Benefits, EntryCard,
  Stars, FavBtn, PdBlocks, ReviewSection, Summary, ListToolbar
} from '../components/ui.jsx';
import { toPersianDigits, formatAmount, formatToman } from '../utils/format.js';

const data = PM.data;

/* ============ STORE HOME ============ */
export function StoreHome() {
  const specials = data.storeProducts.slice().sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 8);
  const latest = data.storeProducts.slice().sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 4);

  return (
    <div className="shell">

      {/* ---------- HERO ---------- */}
      <section className="page-hero home-hero" style={{
        textAlign: 'right',
        padding: 0,
        overflow: 'visible'
      }}>
        <span className="ph-bg" style={{ display: 'block', width: '100%', margin: 0 }}>
          <img src="assets/img/hero-store.jpg" alt="" fetchPriority="high" style={{ width: '100%', display: 'block' }} />
        </span>
        <div className="ph-inner" style={{ margin: '0 auto' }}>
          <h1 className="hero-hi">پروتئین،<br />سبک زندگی ماست</h1>
          <p className="hero-desc"><strong style={{ color: 'var(--white)' }}>کیفیت، تنوع، اعتماد.</strong><br />
            از گوشت‌های تازه تا پروتئین‌های خاص، همه در پرومیت.</p>

          <div className="hero-ctas">
            <a className="btn btn-primary btn-lg" href="#/store/c/beef">مشاهده محصولات</a>
            <a className="btn btn-ghost btn-lg" href="#/about">آشنایی با ProMeat</a>
          </div>

          <div className="hero-badge-row">
            <span className="hero-badge">{svg('truck')}ارسال همان‌روز تهران</span>
            <span className="hero-badge">{svg('snow')}زنجیره سرما</span>
            <span className="hero-badge">{svg('shield')}تضمین تازگی</span>
          </div>
        </div>
      </section>

      {/* ---------- SECTION SWITCHER ---------- */}
      <section className="section-tight">
        <SecHead icon="grid" title="سه بخش یک اکوسیستم" sub="فروشگاه، رستوران و بیرون‌بر پرومیت" />
        <div className="entry-grid">
          {data.sections.map((s, i) => (
            <EntryCard key={s.id} sec={s} i={i} active={s.id === 'store'} />
          ))}
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section className="section-tight"><Benefits /></section>

      {/* ---------- SPECIAL PRODUCTS ---------- */}
      <section className="section-tight">
        <SecHead icon="fire" title="محصولات ویژه امروز" sub="منتخب پرفروش‌ترین‌های امروز پرومیت" href="#/store/c/beef" />
        <GridCards list={specials} />
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="section-tight">
        <SecHead icon="grid" title="دسته‌بندی محصولات" sub="هر آنچه برای سفره‌ی پروتئینی لازم دارید" />
        <CatNav
          list={data.storeCats.map(c => ({
            id: c.id, fa: c.fa, img: c.img,
            count: data.storeProducts.filter(p => p.cat === c.id).length,
            countUnit: 'محصول'
          }))}
          opts={{ hrefPrefix: '#/store/c/' }}
        />
      </section>

      {/* ---------- DIRECT SUPPLY ---------- */}
      <section className="section">
        <SecHead icon="truck" title="عرضه مستقیم محصولات پروتئینی" sub="بدون واسطه، با کنترل کامل زنجیره سرما" />
        <div className="story-grid">
          <div className="reveal">
            <p className="story-p">
              پرومیت محصولات خود را مستقیماً از مزارع و کشتارگاه‌های همکار تأمین می‌کند؛ بدون دست‌دوم، بدون واسطه.
              هر بسته تا لحظه‌ی تحویل در زنجیره‌ی سرما نگهداری می‌شود و شماره پیگیری بهداشتی دارد.
            </p>
            <ul className="check-list">
              {data.supplyPoints.map(p => (
                <li key={p.t}>{svg('checkCircle')}<span><strong>{p.t}</strong> — {p.s}</span></li>
              ))}
            </ul>
            <div className="mt-3">
              <div className="small muted-2 mb-2" style={{ marginBottom: '10px' }}>شهرهای تحت پوشش</div>
              <div className="cities-row">
                {data.cities.map(c => <span className="city-pill" key={c}>{svg('pin')}{c}</span>)}
              </div>
            </div>
          </div>
          <div className="sg-img img-frame reveal">
            <img src="assets/img/direct-supply.jpg" alt="محصولات پروتئینی پرومیت" loading="lazy" />
            <span className="img-fallback">{svg('box')}</span>
          </div>
        </div>
      </section>

      {/* ---------- NEW ARRIVALS ---------- */}
      <section className="section-tight">
        <SecHead icon="box" title="تازه رسیده‌ها" sub="کشتار و بسته‌بندی روز" href="#/store/c/fish" more="مشاهده همه" />
        <GridCards list={latest} />
      </section>

      {/* ---------- PROMOS ---------- */}
      <section className="section-tight">
        <div className="promo-split">
          <a className="promo-card reveal" href="#/restaurant">
            <img src="assets/img/hero-restaurant.jpg" alt="" loading="lazy" />
            <span className="chip chip-red" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>رستوران پرومیت</span>
            <span className="pc-t">میزتان را در شعبه دزفول رزرو کنید</span>
            <span className="pc-s">غذاهای ایرانی با گوشت تازه‌ی همین فروشگاه.</span>
            <span className="btn btn-white">مشاهده منو</span>
          </a>
          <a className="promo-card reveal" href="#/takeaway">
            <img src="assets/img/hero-takeaway.jpg" alt="" loading="lazy" />
            <span className="chip chip-red" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>بیرون‌بر پرومیت</span>
            <span className="pc-t">مرغ سوخاری، دونر و پکیج‌های ویژه</span>
            <span className="pc-s">آماده در ۱۵ دقیقه، ارسال سریع تا درِ خانه.</span>
            <span className="btn btn-white">مشاهده منو</span>
          </a>
        </div>
      </section>

      {/* ---------- BRAND STORY ---------- */}
      <section className="section">
        <div className="story-grid">
          <div className="reveal">
            <h2 className="h1 mt-2">داستان پرومیت</h2>
            <p className="sub-en" style={{ textAlign: 'right' }}>از سال 1398</p>
            <p className="story-p">
              پرومیت از یک قصابی کوچک در دزفول شروع شد؛ جایی که صاحب مغازه قیمت منصفانه و گوشت تازه را دو شرط
              اول کارش می‌دانست. امروز همان اصل، پایه‌ی فروشگاه آنلاین، رستوران و بیرون‌بر پرومیت است.
            </p>
            <ul className="check-list">
              <li>{svg('checkCircle')}<span>انتخاب دستی هر لاشه و کنترل کیفیت پیش از بسته‌بندی</span></li>
              <li>{svg('checkCircle')}<span>تیم آشپزخانه از همان گوشتی استفاده می‌کند که به دست شما می‌رسد</span></li>
              <li>{svg('checkCircle')}<span>بیش از ۴۰٬۰۰۰ سفارش موفق در سراسر ایران</span></li>
            </ul>
            <div className="hero-ctas">
              <a className="btn btn-outline-red" href="#/about">درباره ما بیشتر بدانید</a>
            </div>
          </div>
          <div className="sg-img img-frame reveal">
            <img src="assets/img/story-butcher.jpg" alt="قصابی پرومیت" loading="lazy" />
            <span className="img-fallback">{svg('chef')}</span>
          </div>
        </div>
      </section>

      {/* ---------- STORE REVIEWS ---------- */}
      <ReviewSection scope="store" score={4.7} count={2864} title="دیدگاه خریداران پرومیت" />

    </div>
  );
}

/* ============ CATEGORY LISTING ============ */
export function Category({ cat: catId }) {
  const cat = data.byId(data.storeCats, catId) || data.storeCats[0];
  setStoreCat(cat.id);
  const f = filtersFor('store');
  const list = applyFilters(sectionItems('store'), 'store');
  const shown = list.slice(0, f.page * 8);

  return (
    <div className="shell">
      <section className="page-hero hero-crumbed">
        <span className="ph-bg"><img src={cat.img} alt="" loading="lazy" /></span>
        <div className="ph-inner" style={{ paddingBottom: '26px' }}>
          <Crumbs items={[{ t: 'فروشگاه', href: '#/store' }, { t: cat.fa }]} />
          <span className="chip chip-red">{cat.en}</span>
          <h1 className="h1 mt-2">{cat.fa}</h1>
          <p className="hero-desc">{cat.desc}</p>
        </div>
      </section>

      <CatNav
        list={data.storeCats.map(c => ({
          id: c.id, fa: c.fa, img: c.img, active: c.id === cat.id,
          count: data.storeProducts.filter(p => p.cat === c.id).length,
          countUnit: 'محصول'
        }))}
        opts={{ hrefPrefix: '#/store/c/' }}
      />

      <ListToolbar section="store" count={list.length} unit="محصول" />

      {shown.length ? (
        <GridCards list={shown} />
      ) : (
        <Empty
          icon="search"
          title="محصولی با این فیلترها پیدا نشد"
          text="فیلترها را تغییر دهید یا عبارت جستجو را ساده‌تر کنید."
          btn={{
            act: 'clear-filters',
            label: 'پاک کردن فیلترها',
            onClick: () => handleAction('clear-filters', 'store')
          }}
        />
      )}

      {shown.length < list.length ? (
        <div className="load-wrap">
          <button
            type="button"
            className="btn btn-ghost"
            data-load-more=""
            onClick={() => { f.page++; bump(); }}
          >
            نمایش محصولات بیشتر
          </button>
        </div>
      ) : null}

      <ReviewSection scope={'cat:' + cat.id} score={4.7} count={480} title={'دیدگاه درباره‌ی ' + cat.fa} />

    </div>
  );
}

/* ============ PRODUCT DETAIL ============ */
function specTable(p, catFa) {
  return (
    <div className="spec-table">
      <div className="row"><span>دسته‌بندی</span><span>{catFa}</span></div>
      <div className="row"><span>واحد فروش</span><span>{p.unit}</span></div>
      <div className="row"><span>امتیاز خریداران</span><span>{toPersianDigits(p.rating.toFixed(1))} از ۵</span></div>
      <div className="row"><span>تعداد دیدگاه</span><span>{toPersianDigits(p.reviews)}</span></div>
      <div className="row"><span>شماره بهداشتی</span><span className="latin">{'IR-' + p.id.toUpperCase() + '-۱۴۰۴'}</span></div>
    </div>
  );
}

export function Product({ id }) {
  const p = data.byId(data.storeProducts, id);

  /* — interactive detail state (source keeps it in the DOM + module vars) — */
  const [mainIdx, setMainIdx] = useState(0);
  const [wIdx, setWIdx] = useState(null);
  const [touched, setTouched] = useState(false);
  const [qtyV, setQtyV] = useState(null);

  if (!p) return <NotFoundPage />;

  const cat = data.byId(data.storeCats, p.cat);
  const siblings = data.storeProducts.filter(x => x.cat === p.cat && x.id !== p.id);
  const gallery = [p.img].concat(siblings.slice(0, 3).map(s => s.img));
  while (gallery.length < 4) gallery.push('assets/img/spices.jpg');
  const related = data.storeProducts.filter(x => x.id !== p.id)
    .sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 4);
  const w = p.weights || [{ label: 'یک واحد', mult: 1 }];
  const activeIdx = wIdx == null ? (w.length > 1 ? 1 : 0) : wIdx;
  const wl = w[activeIdx].label;
  const mult = w[activeIdx].mult;

  /* initial price is rendered with base mult (source quirk) */
  const shownMult = touched ? mult : 1;
  const shownPrice = PM.priceFor(p, shownMult);
  const shownOld = p.old ? Math.round(p.old * shownMult) : null;

  const cartQty = PM.cart.qtyOf('store', p.id, wl) || 1;
  const qty = qtyV == null ? cartQty : qtyV;

  const pickWeight = i => {
    setWIdx(i);
    setTouched(true);
    setQtyV(PM.cart.qtyOf('store', p.id, w[i].label) || 1);
  };

  const stepQty = delta => {
    /* source parses the DOM number (Persian digits → NaN → 1) before stepping */
    let v = qtyV == null ? NaN : qtyV;
    if (isNaN(v)) v = 1;
    v = Math.max(1, Math.min(20, v + delta));
    setQtyV(v);
    const hits = PM.cart.items.filter(x =>
      x.type === 'store' && x.id === p.id && (x.variant || '') === (wl || ''));
    if (hits.length === 1) PM.cart.setQty(hits[0].key, v);
  };

  const add = () => {
    addFromDetail({
      type: 'store', id: p.id, isTk: false,
      qty: qty, mult: mult, extra: 0, variant: wl
    });
    setQtyV(1);
  };

  return (
    <div className="shell">
      <Crumbs items={[
        { t: 'فروشگاه', href: '#/store' },
        { t: cat.fa, href: '#/store/c/' + cat.id },
        { t: p.name }
      ]} />

      <section className="pd-grid section-tight">
        <div className="pd-gallery">
          <div className="pd-main-img img-frame" id="pdMain">
            <img src={gallery[mainIdx]} alt={p.name} fetchPriority="high" />
            <span className="img-fallback">{svg('drum')}</span>
          </div>
          <div className="pd-thumbs">
            {gallery.map((g, i) => (
              <button
                type="button"
                key={i}
                className={'th' + (i === mainIdx ? ' on' : '')}
                data-thumb={g}
                aria-label={'نمای ' + toPersianDigits(i + 1)}
                onClick={() => setMainIdx(i)}
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
            <span className="chip chip-dark">{svg('checkCircle')}موجود در انبار</span>
          </div>
          <h1 className="mt-2">{p.name}</h1>
          <div className="pd-meta-row">
            <Stars rating={p.rating} count={p.reviews} />
            <span className="small muted-2">{p.unit}</span>
            <span className="small muted-2">{svg('truck')} ارسال همان‌روز</span>
          </div>

          <div className="pd-price-row">
            <span className="price" id="pdPrice">{formatAmount(shownPrice)}<span className="toman">تومان</span></span>
            {p.old ? <span className="price-old" id="pdOld">{formatAmount(shownOld)}</span> : null}
            <span className="small muted-2" style={{ marginInlineStart: 'auto' }}>{p.unit}</span>
          </div>

          <div className="pd-opt">
            <div className="opt-t">انتخاب وزن</div>
            <div className="segmented" id="wSeg">
              {w.map((x, i) => (
                <button
                  type="button"
                  key={x.label}
                  className={i === 1 || (w.length === 1 && i === 0) ? 'active' : ''}
                  data-w={x.mult}
                  data-wl={x.label}
                  onClick={() => pickWeight(i)}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-opt">
            <div className="opt-t">تعداد</div>
            <div className="row" style={{ gap: '12px' }}>
              <span className="qty solid" id="pdQty">
                <button type="button" data-pd-step="-1" aria-label="کاهش" onClick={() => stepQty(-1)}>{svg('minus')}</button>
                <span className="q-num">{toPersianDigits(qty)}</span>
                <button type="button" data-pd-step="1" aria-label="افزایش" onClick={() => stepQty(1)}>{svg('plus')}</button>
              </span>
              <span className="small muted-2">موجودی: {toPersianDigits(48)} بسته</span>
            </div>
          </div>

          <div className="pd-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              data-pd-add={p.id}
              onClick={add}
            >
              افزودن به سبد خرید
            </button>
            <FavBtn type="store" id={p.id} extraCls="btn btn-ghost btn-lg" />
          </div>

          <PdBlocks list={[
            { t: 'اطلاعات محصول', b: specTable(p, cat.fa) },
            { t: 'نگهداری', b: 'در یخچال و دمای ۰ تا ۴ درجه نگهداری شود. پیش از مصرف شست‌وشو داده شود. پس از باز شدن بسته‌بندی، حداکثر طی ۲ روز مصرف شود. منجمدشده تا ۳ ماه قابل نگهداری است.' },
            {
              t: 'ارسال و تحویل',
              b: 'ارسال در تهران با پیک اختصاصی و جعبه عایق‌دار انجام می‌شود. سفارش‌های قبل از ساعت ۱۶، همان‌روز و سفارش‌های بعد از آن، فردای روز سفارش تحویل داده می‌شوند. هزینه ارسال در سبد بالای ۳٬۰۰۰٬۰۰۰ تومان رایگان است.'
            },
            {
              t: 'توضیحات',
              b: (
                <>
                  {p.desc}
                  <br /><br />
                  همه‌ی محصولات پرومیت در روز سفارش بسته‌بندی می‌شوند و پیش از ارسال از نظر تازگی و وزن بررسی نهایی می‌شوند.
                </>
              )
            }
          ]} />
        </div>
      </section>

      <ReviewSection scope={'store:' + p.id} score={p.rating} count={p.reviews} title="دیدگاه خریداران" />

      <section className="section-tight">
        <SecHead icon="grid" title="محصولات مرتبط" href={'#/store/c/' + p.cat} />
        <GridCards list={related} />
      </section>
    </div>
  );
}

/* ============ CHECKOUT ============ */
function shipRows(cart, method) {
  const dsc = cart.discount();
  return [
    { k: 'جمع محصولات', v: formatAmount(cart.subtotal()) + ' تومان' },
    {
      k: 'هزینه ارسال',
      v: cart.shipping(method) ? formatAmount(cart.shipping(method)) + ' تومان' : 'رایگان',
      free: !cart.shipping(method)
    },
    { k: 'تخفیف', v: dsc ? '− ' + formatAmount(dsc) + ' تومان' : '۰ تومان' },
    { k: 'مبلغ نهایی', v: formatAmount(cart.total(method)) + ' تومان', total: true }
  ];
}

export function Checkout() {
  const cart = PM.cart;
  const [ship, setShip] = useState('normal');
  const [pay, setPay] = useState('online');

  if (!cart.items.length) {
    return (
      <div className="shell page-top-pad section">
        <Empty
          icon="cart"
          title="سبد خرید شما خالی است"
          text="برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید."
          cta={{ href: '#/store', label: 'رفتن به فروشگاه' }}
        />
      </div>
    );
  }

  const addrs = PM.addresses.list;
  const u = PM.auth.user;

  /* wallet is an optional third method: selectable only while it really covers
     the order total, and it never hides the other two */
  const wBal = WalletSvc.peek().available;
  const total = cart.total(ship === 'fast' ? 'fast' : 'normal');
  const walletOk = wBal >= total;

  const onSubmit = e => {
    e.preventDefault();
    if (pay === 'wallet' && !walletOk) {
      PM.toast('موجودی کیف پول به این مبلغ نمی‌رسد.', false);
      return;
    }
    const addrEl = document.getElementById('fAddr');
    const name = (document.getElementById('fName') || {}).value || 'آدرس پیش‌فرض';
    const addr = (addrEl && addrEl.value.trim()) ||
      (PM.addresses.first ? PM.addresses.first.text : 'تهران، سعادت‌آباد، خیابان علامه شمالی');
    submitCheckout(ship === 'fast', name, addr, pay);
  };

  return (
    <div className="shell">
      <Crumbs items={[{ t: 'سبد خرید', href: '#/' }, { t: 'تسویه حساب' }]} />
      <h1 className="h1 section-tight" style={{ paddingBlock: '6px 0' }}>تسویه حساب</h1>

      <form className="co-grid section-tight" id="checkoutForm" style={{ paddingTop: '18px' }} onSubmit={onSubmit}>
        <div>
          <div className="co-card">
            <h3><span className="step-n">۱</span>آدرس تحویل</h3>
            {addrs.length ? (
              <div className="field">
                <label>انتخاب آدرس</label>
                <select className="select" id="coAddr">
                  {addrs.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} — {a.text.slice(0, 46)}…
                    </option>
                  ))}
                  <option value="new">＋ آدرس جدید</option>
                </select>
              </div>
            ) : null}
            <div className="form-grid" id="addrFields">
              <div className="field">
                <label htmlFor="fName">نام و نام خانوادگی</label>
                <input className="input" id="fName" defaultValue={u ? u.name : ''} placeholder="مثال: علی رضایی" required />
              </div>
              <div className="field">
                <label htmlFor="fPhone">شماره موبایل</label>
                <input className="input" id="fPhone" inputMode="tel" defaultValue={u ? u.phone : ''} placeholder="۰۹۱۲۱۲۳۴۵۶۷" required />
              </div>
              <div className="field">
                <label htmlFor="fState">استان</label>
                <select className="select" id="fState">
                  <option>تهران</option><option>خوزستان</option><option>اصفهان</option><option>فارس</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="fCity">شهر</label>
                <input className="input" id="fCity" defaultValue="تهران" required />
              </div>
              <div className="field span-2">
                <label htmlFor="fAddr">آدرس</label>
                <textarea className="textarea" id="fAddr" placeholder="خیابان، کوچه، پلاک…" required />
              </div>
              <div className="field">
                <label htmlFor="fZip">کد پستی</label>
                <input className="input" id="fZip" inputMode="numeric" placeholder="۱۹۹۸۷۴۵۶۳۲" />
              </div>
              <div className="field">
                <label htmlFor="fPlaque">پلاک / واحد</label>
                <input className="input" id="fPlaque" placeholder="پلاک ۱۸ ، واحد ۴" />
              </div>
            </div>
          </div>

          <div className="co-card">
            <h3><span className="step-n">۲</span>روش ارسال</h3>
            <label className={'ship-opt' + (ship === 'normal' ? ' on' : '')} data-ship="normal" onClick={() => setShip('normal')}>
              <span className="s-ico">{svg('truck')}</span>
              <span><span className="s-name">ارسال عادی</span><div className="s-sub">۴۵ تا ۶۰ دقیقه · روزهای کاری</div></span>
              <span className="s-price">{toPersianDigits(formatAmount(45000))} تومان</span>
              <input type="radio" name="ship" value="normal" checked={ship === 'normal'} className="hide"
                onChange={() => setShip('normal')} />
            </label>
            <label className={'ship-opt' + (ship === 'fast' ? ' on' : '')} data-ship="fast" onClick={() => setShip('fast')}>
              <span className="s-ico">{svg('arrowUL')}</span>
              <span><span className="s-name">ارسال سریع</span><div className="s-sub">۲۰ تا ۳۰ دقیقه · پیک اختصاصی</div></span>
              <span className="s-price">{toPersianDigits(formatAmount(79000))} تومان</span>
              <input type="radio" name="ship" value="fast" checked={ship === 'fast'} className="hide"
                onChange={() => setShip('fast')} />
            </label>
          </div>

          <div className="co-card">
            <h3><span className="step-n">۳</span>پرداخت</h3>
            <label className={'pay-opt' + (pay === 'online' ? ' on' : '')} onClick={() => setPay('online')}>
              <span className="s-ico">{svg('card')}</span>
              <span>
                <span className="s-name">درگاه پرداخت آنلاین</span>
                <div className="s-sub">پرداخت امن با کارت شتاب</div>
              </span>
              <input type="radio" name="pay" value="online" checked={pay === 'online'} className="hide"
                onChange={() => setPay('online')} />
            </label>
            <label className={'pay-opt' + (pay === 'cod' ? ' on' : '')} onClick={() => setPay('cod')}>
              <span className="s-ico">{svg('moto')}</span>
              <span>
                <span className="s-name">پرداخت در محل (نقدی)</span>
                <div className="s-sub">فقط برای شهر تهران</div>
              </span>
              <input type="radio" name="pay" value="cod" checked={pay === 'cod'} className="hide"
                onChange={() => setPay('cod')} />
            </label>
            <label
              className={'pay-opt' + (pay === 'wallet' ? ' on' : '')}
              style={walletOk ? undefined : { opacity: '.6', cursor: 'not-allowed' }}
              onClick={() => { if (walletOk) setPay('wallet'); }}
            >
              <span className="s-ico">{svg('wallet')}</span>
              <span>
                <span className="s-name">کیف پول پرومیت</span>
                <div className="s-sub">
                  {walletOk
                    ? 'موجودی قابل خرج: ' + formatToman(wBal)
                    : 'موجودی کافی نیست؛ ' + formatToman(total - wBal) + ' تا این سفارش کم است'}
                </div>
              </span>
              <input type="radio" name="pay" value="wallet" checked={pay === 'wallet'} disabled={!walletOk} className="hide"
                onChange={() => setPay('wallet')} />
            </label>
            {walletOk ? null : (
              <p className="small muted-2" style={{ marginTop: '6px' }}>
                برای پرداخت با کیف پول، اول آن را <a href="#/wallet">شارژ کنید</a>.
              </p>
            )}
            <p className="small muted-2 mt-2">این نسخه نمایشی است؛ هیچ مبلغی کسر نمی‌شود.</p>
          </div>
        </div>

        <aside className="co-summary">
          <div className="co-card">
            <h3>خلاصه سفارش</h3>
            <div className="co-items">
              {cart.items.map(it => (
                <div className="co-mini" key={it.key}>
                  <span className="cm-img img-frame">
                    <img src={it.img} alt="" />
                    <span className="img-fallback">{svg('drum')}</span>
                  </span>
                  <span>
                    {it.name}
                    {it.variant ? <div className="small muted-2">{it.variant}</div> : null}
                  </span>
                  <span className="cm-q">{toPersianDigits(it.qty)}×</span>
                </div>
              ))}
            </div>
            <div className="mt-3" id="coSummary">
              <Summary rows={shipRows(cart, ship === 'fast' ? 'fast' : 'normal')} />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
              پرداخت و ثبت سفارش
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

/* ============ ORDER SUCCESS ============ */
export function OrderDone({ id }) {
  const o = PM.orders.byId(id) || PM.orders.list[0];
  if (!o) return <NotFoundPage />;
  const addr = o.address || 'تهران، سعادت‌آباد، خیابان علامه شمالی';

  return (
    <div className="shell page-top-pad">
      <div className="success-wrap section">
        <div className="success-ico">{svg('check')}</div>
        <h1 className="h1">سفارش شما با موفقیت ثبت شد</h1>
        <p className="muted mt-2">همکاران ما سفارش را آماده می‌کنند و تا لحظه‌ی تحویل با شما در تماس خواهند بود.</p>

        <div className="ticket">
          <div className="t-head">
            <span className="t-num">{o.id}</span>
            <span className={'order-status ' + o.status}>{PM.data._statusFa(o.status)}</span>
          </div>
          <div className="t-body">
            <div className="t-row">
              <span className="k">اقلام سفارش</span>
              <span className="v">
                {toPersianDigits(o.items.length)} قلم · {toPersianDigits(o.items.reduce((a, b) => a + b.qty, 0))} عدد
              </span>
            </div>
            <div className="t-row"><span className="k">آدرس تحویل</span><span className="v">{addr}</span></div>
            <div className="t-row"><span className="k">روش ارسال</span><span className="v">{o.ship}</span></div>
            <div className="t-row"><span className="k">مبلغ قابل پرداخت</span><span className="v">{formatAmount(o.total)} تومان</span></div>
            <div className="t-row">
              <span className="k">زمان تقریبی تحویل</span>
              <span className="v">{o.ship === 'ارسال سریع' ? '۲۰ تا ۳۰ دقیقه' : '۴۵ تا ۶۰ دقیقه'}</span>
            </div>
          </div>
        </div>

        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <a className="btn btn-primary btn-lg" href="#/orders">مشاهده سفارش‌های من</a>
          <a className="btn btn-ghost btn-lg" href="#/store">ادامه خرید</a>
        </div>
      </div>
    </div>
  );
}

/* ============ 404 (shared by these pages) ============ */
export function NotFoundPage() {
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

export default { StoreHome, Category, Product, Checkout, OrderDone };
