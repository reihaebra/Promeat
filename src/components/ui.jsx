/* ============================================================
   ProMeat — ui.jsx
   Faithful JSX port of js/components.js (identical class names,
   identical DOM structure — visuals unchanged).
   ============================================================ */
import React, { useEffect, useRef, useState } from 'react';
import { PM } from '../lib/state.js';
import { svg } from './icons.jsx';
import { I } from '../assets/icons/registry.js';
import { ui } from '../lib/ui.js';
import { bump } from '../lib/hooks.js';
import { SORTS, filtersFor, activeFilterCount } from '../lib/viewstate.js';
import { addToCart, stepKey, delKey, favToggle, reviewSubmit } from '../lib/actions.js';
import { addedReviews } from '../lib/reviews.js';
import { toPersianDigits, formatAmount } from '../utils/format.js';

const data = () => PM.data;

/* ---------- images ---------- */
export function Frame({ src, alt, cls, eager }) {
  return (
    <span className={'img-frame ' + (cls || '')} style={{ aspectRatio: '1 / 1', overflow: 'hidden' }}>
      <img src={src} alt={alt} loading={eager ? undefined : 'lazy'} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      <span className="img-fallback">{svg('drum')}</span>
    </span>
  );
}

/* ---------- rating ---------- */
export function Stars({ rating, count }) {
  return (
    <span className="rating">
      {svg('star')}
      <span>{toPersianDigits(rating.toFixed(1))}</span>
      {count != null ? <span className="muted-2">({toPersianDigits(count)})</span> : null}
    </span>
  );
}

export function RatingPicker({ value, onPick }) {
  const v = value || 5;
  return (
    <div className="rate-pick" role="radiogroup" aria-label="امتیاز شما">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          className={'rate-star' + (i <= v ? ' on' : '')}
          data-rate={i}
          role="radio"
          aria-checked={String(i === v)}
          aria-label={toPersianDigits(i) + ' ستاره'}
          onClick={onPick ? () => onPick(i) : undefined}
        >
          {svg('star')}
        </button>
      ))}
    </div>
  );
}

/* ---------- custom select ----------
   Native option menus cannot be themed, so the ProMeat dropdowns
   (product sorting, province picker) share this listbox. */
export function Select({ id, value, options, onChange, ariaLabel, minWidth }) {
  const [open, setOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState(() => {
    const i = options.findIndex(o => o.value === value);
    return i === -1 ? 0 : i;
  });
  const rootRef = React.useRef(null);
  const listRef = React.useRef(null);

  const selIndex = options.findIndex(o => o.value === value);
  const current = selIndex === -1 ? options[0] : options[selIndex];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /* reopen on the selected row, scrolled to it */
  useEffect(() => {
    if (!open) return;
    const i = options.findIndex(o => o.value === value);
    setCursor(i === -1 ? 0 : i);
    const list = listRef.current;
    const row = list && list.children[Math.max(0, i)];
    if (list && row) list.scrollTop = row.offsetTop - (list.clientHeight - row.clientHeight) / 2;
  }, [open]);

  const pick = i => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKeyDown = e => {
    if (e.key === 'Escape') {
      if (open) { e.stopPropagation(); setOpen(false); }
      return;
    }
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(options.length - 1, c + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setCursor(0); }
    else if (e.key === 'End') { e.preventDefault(); setCursor(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cursor); }
    else if (e.key === 'Tab') setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const row = list && list.children[cursor];
    if (row) row.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  return (
    <div
      className={'pm-select' + (open ? ' open' : '')}
      ref={rootRef}
      style={minWidth ? { minWidth: minWidth } : undefined}
    >
      <button
        type="button"
        id={id}
        className="pm-select-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id ? id + 'Menu' : undefined}
        aria-label={ariaLabel}
        aria-activedescendant={open && id ? id + 'Opt' + cursor : undefined}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
      >
        <span className="pm-select-val">{current ? current.label : ''}</span>
        <span className="pm-select-chev">{svg('chevD')}</span>
      </button>

      {open ? (
        <ul
          className="pm-select-menu"
          id={id ? id + 'Menu' : undefined}
          role="listbox"
          ref={listRef}
          aria-label={ariaLabel}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={id ? id + 'Opt' + i : undefined}
              role="option"
              aria-selected={o.value === value}
              className={'pm-select-opt' + (o.value === value ? ' sel' : '') + (i === cursor ? ' cur' : '')}
              onMouseEnter={() => setCursor(i)}
              onClick={() => pick(i)}
            >{o.label}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ---------- dual-handle price range slider ----------
   Pointer + touch dragging through pointer capture, keyboard stepping, and a
   live readout in the same Persian money format the cards use.
   The rail runs right-to-left like the rest of the UI: the low bound sits
   under «از», so the geometry is measured from the right edge. */
export function RangeSlider({ bounds, lo, hi, onChange, onReset }) {
  const railRef = useRef(null);
  const dragRef = useRef(null);
  const span = bounds.hi - bounds.lo;
  const gap = span > bounds.step ? bounds.step : 0;
  const pct = v => (span <= 0 ? 0 : ((v - bounds.lo) / span) * 100);

  const snap = v => {
    const s = Math.round((Number(v) || 0) / bounds.step) * bounds.step;
    return Math.min(bounds.hi, Math.max(bounds.lo, s));
  };
  const valueAt = clientX => {
    const r = railRef.current && railRef.current.getBoundingClientRect();
    if (!r || !r.width) return bounds.lo;
    const ratio = Math.min(1, Math.max(0, (r.right - clientX) / r.width));
    return snap(bounds.lo + ratio * span);
  };
  const commit = (nlo, nhi) => {
    if (nlo !== lo || nhi !== hi) onChange(nlo, nhi);
  };
  /* the low handle can never pass the high one — the pair stays ordered */
  const moveLo = v => commit(Math.max(bounds.lo, Math.min(snap(v), hi - gap)), hi);
  const moveHi = v => commit(lo, Math.min(bounds.hi, Math.max(snap(v), lo + gap)));
  const moveTo = (which, v) => (which === 'lo' ? moveLo(v) : moveHi(v));

  const onDown = which => e => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = which;
    if (e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    }
    moveTo(which, which === 'lo' ? lo : hi);
  };
  const onRailDown = e => {
    const v = valueAt(e.clientX);
    const which = Math.abs(v - lo) <= Math.abs(v - hi) ? 'lo' : 'hi';
    dragRef.current = which;
    if (e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    }
    moveTo(which, v);
  };
  const onMove = e => {
    if (!dragRef.current) return;
    e.preventDefault();
    moveTo(dragRef.current, valueAt(e.clientX));
  };
  const onUp = () => { dragRef.current = null; };

  const onKey = which => e => {
    const cur = which === 'lo' ? lo : hi;
    let d = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') d = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') d = -1;
    else if (e.key === 'PageUp') d = 10;
    else if (e.key === 'PageDown') d = -10;
    else if (e.key === 'Home') { e.preventDefault(); moveTo(which, bounds.lo); return; }
    else if (e.key === 'End') { e.preventDefault(); moveTo(which, bounds.hi); return; }
    if (!d) return;
    e.preventDefault();
    moveTo(which, cur + d * bounds.step);
  };

  const narrowed = lo !== bounds.lo || hi !== bounds.hi;

  return (
    <div className="range-slider" data-slider="">
      <div className="rs-read">
        <span className={'rs-val' + (lo === bounds.lo ? ' edge' : '')}>
          <em>از</em> {formatAmount(lo)}
        </span>
        <span className={'rs-val' + (hi === bounds.hi ? ' edge' : '')}>
          <em>تا</em> {formatAmount(hi)}
        </span>
      </div>
      <div
        className="rs-rail"
        ref={railRef}
        onPointerDown={onRailDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onLostPointerCapture={onUp}
      >
        <span className="rs-track" />
        <span className="rs-fill" style={{ right: pct(lo) + '%', width: Math.max(0, pct(hi) - pct(lo)) + '%' }} />
        <button
          type="button"
          className="rs-handle"
          role="slider"
          aria-label="حداقل قیمت (تومان)"
          aria-valuemin={bounds.lo}
          aria-valuemax={bounds.hi}
          aria-valuenow={lo}
          aria-valuetext={formatAmount(lo) + ' تومان'}
          style={{ right: pct(lo) + '%' }}
          onPointerDown={onDown('lo')}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onLostPointerCapture={onUp}
          onKeyDown={onKey('lo')}
        />
        <button
          type="button"
          className="rs-handle"
          role="slider"
          aria-label="حداکثر قیمت (تومان)"
          aria-valuemin={bounds.lo}
          aria-valuemax={bounds.hi}
          aria-valuenow={hi}
          aria-valuetext={formatAmount(hi) + ' تومان'}
          style={{ right: pct(hi) + '%' }}
          onPointerDown={onDown('hi')}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onLostPointerCapture={onUp}
          onKeyDown={onKey('hi')}
        />
      </div>
      <div className="rs-scale">
        <span>{formatAmount(bounds.lo)}</span>
        {narrowed && onReset ? (
          <button type="button" className="rs-reset" onClick={onReset}>بازگرداندن بازه</button>
        ) : null}
        <span>{formatAmount(bounds.hi)}</span>
      </div>
    </div>
  );
}

/* ---------- price ---------- */
export function Price({ p, mult }) {
  return (
    <span className="price">
      {formatAmount(PM.priceFor(p, mult))}
      <span className="toman">تومان</span>
    </span>
  );
}

/* ---------- favourite ---------- */
export function FavBtn({ type, id, extraCls, label }) {
  const on = PM.fav.has(type, id);
  const isLogged = PM.auth.isLogged;
  const handleFavClick = (e) => {
    if (!isLogged) {
      PM.toast('ابتدا وارد حساب کاربری خود شوید.', true);
      e.preventDefault();
      return;
    }
    if (label) {
      /* text variant (product detail) */
      favToggle(type, id);
    } else {
      favToggle(type, id);
    }
  };
  if (label) {
    /* text variant (product detail) */
    return (
      <button
        type="button"
        className={'fav-btn fav-label' + (on ? ' is-fav' : '') + (extraCls ? ' ' + extraCls : '')}
        data-fav={type + ':' + id}
        data-fav-label=""
        aria-pressed={String(on)}
        onClick={e => handleFavClick(e)}
      >
        {svg('heart')}
        <span>{on ? 'در علاقه‌مندی‌ها' : 'علاقه‌مندی'}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={'fav-btn' + (on ? ' on' : '') + (extraCls ? ' ' + extraCls : '')}
      data-fav={type + ':' + id}
      aria-pressed={String(on)}
      aria-label={on ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      onClick={e => handleFavClick(e)}
    >
      {svg('heart')}
    </button>
  );
}

/* ---------- add button → qty stepper ---------- */
export function AddFlow({ type, id, variant }) {
  const isLogged = PM.auth.isLogged;
  const key = type + ':' + id + (variant ? ':' + variant : '');
  const qty = PM.cart.qtyOf(type, id, variant);
  const handleAddClick = (e) => {
    if (!isLogged) {
      PM.toast('ابتدا وارد حساب کاربری خود شوید.', true);
      e.preventDefault();
      return;
    }
    addToCart(type, id);
  };
  return (
    <div className={'add-flow' + (qty ? ' has-qty' : '')} data-flow={key}>
      <button
        type="button"
        className="add-btn"
        data-add={type}
        data-id={id}
        data-variant={variant || undefined}
        aria-label="افزودن به سبد خرید"
        onClick={e => handleAddClick(e)}
      >
        {svg('plus')}
      </button>
      <span className="qty mini">
        <button type="button" data-step="-1" data-key={key} aria-label="کاهش"
          onClick={() => stepKey(key, -1)}>{svg('minus')}</button>
        <span className="q-num">{toPersianDigits(qty)}</span>
        <button type="button" data-step="1" data-key={key} aria-label="افزایش"
          onClick={() => stepKey(key, 1)}>{svg('plus')}</button>
      </span>
    </div>
  );
}

export function QtyStepper({ value, k, solid }) {
  return (
    <span className={'qty' + (solid ? ' solid' : '')}>
      <button type="button" data-step="-1" data-key={k} aria-label="کاهش"
        onClick={() => stepKey(k, -1)}>{svg('minus')}</button>
      <span className="q-num">{toPersianDigits(value)}</span>
      <button type="button" data-step="1" data-key={k} aria-label="افزایش"
        onClick={() => stepKey(k, 1)}>{svg('plus')}</button>
    </span>
  );
}

/* ---------- section header ---------- */
export function SecHead({ icon, title, sub, href, more }) {
  return (
    <div className="sec-head reveal">
      <span className="sec-ico">{svg(icon) || svg('grid')}</span>
      <div className="sec-titles">
        <h2>{title}</h2>
        {sub ? <div className="sec-sub">{sub}</div> : null}
      </div>
      {href ? (
        <a className="link-more" href={href}>
          {more || 'مشاهده همه'}
          {svg('chevR')}
        </a>
      ) : null}
    </div>
  );
}

/* ---------- section entry card (dashboard / switcher) ---------- */
export function EntryCard({ sec, i, active }) {
  return (
    <a className={'entry-card dash-card' + (active ? ' is-active' : '')} href={sec.href} style={{ '--i': i }}>
      <span className="e-bg"><img src={sec.img} alt="" loading="lazy" /></span>
      <span className="e-ico">{svg(sec.icon)}</span>
      <span className="e-txt" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span className="e-fa">{sec.fa}</span>
        <span className="e-en">{sec.en}</span>
      </span>
      <span className="e-arrow">{svg('arrowL')}</span>
    </a>
  );
}

/* ---------- breadcrumbs ---------- */
export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="مسیر">
      <a href="#/">خانه</a>
      {items.map((c, i) => (
        <React.Fragment key={i}>
          {svg('chevL')}
          {c.href ? <a href={c.href}>{c.t}</a> : <span>{c.t}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ---------- product card ---------- */
export function ProductCard({ p, section }) {
  const type = section || 'store';
  const base = type === 'takeaway' ? '#/tk/' : type === 'restaurant' ? '#/restaurant/dish/' : '#/p/';
  const href = base + p.id;
  return (
    <article className="p-card reveal">
      <div className="p-badges">
        {p.badge ? <span className="chip chip-red">{p.badge}</span> : null}
        {p.old ? <span className="chip chip-dark">{toPersianDigits(Math.round((1 - p.price / p.old) * 100))}٪−</span> : null}
      </div>
      <FavBtn type={type} id={p.id} />
      <a className="p-img" href={href} aria-label={p.name}>
        <Frame src={p.img} alt={p.name} />
      </a>
      <div className="p-body">
        <a className="p-name" href={href}>{p.name}</a>
        <p className="p-desc">{p.desc}</p>
        <div className="p-meta">
          <Stars rating={p.rating} count={p.reviews} />
          <span className="small muted-2">{p.unit}</span>
        </div>
        <div className="p-buy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {p.old ? <span className="price-old">{formatAmount(p.old)}</span> : null}
            <span className="price">
              <span>{formatAmount(p.price)}</span>
            </span>
          </div>
          <AddFlow type={type} id={p.id} />
        </div>
      </div>
    </article>
  );
}

export function GridCards({ list, section }) {
  if (!list || !list.length) return null;
  return (
    <div className="grid-cards">
      {list.map(p => <ProductCard key={p.id} p={p} section={section} />)}
    </div>
  );
}

/* ---------- listing toolbar: filters + sorting + result count ----------
   One implementation for the store category, restaurant menu and takeaway
   listings; each section reads and writes only its own filter record. */
export function ListToolbar({ section, count, unit }) {
  const f = filtersFor(section);
  const fc = activeFilterCount(section);
  return (
    <div className="list-toolbar">
      <button
        type="button"
        className={'filter-btn' + (fc ? ' active' : '')}
        data-open-filters=""
        onClick={() => ui.openFilters()}
      >
        {svg('filter')}فیلترها
        {fc ? <span className="f-count">{toPersianDigits(fc)}</span> : null}
      </button>
      <label className="row small muted-2" style={{ gap: '6px' }}>{svg('sort')}مرتب‌سازی</label>
      <Select
        id={'sortSel-' + section}
        ariaLabel="مرتب‌سازی"
        minWidth="150px"
        value={f.sort}
        options={SORTS.map(s => ({ value: s.id, label: s.fa }))}
        onChange={v => { f.sort = v; f.page = 1; bump(); }}
      />
      <span className="count">{toPersianDigits(count)} {unit}</span>
    </div>
  );
}

/* ---------- food card (restaurant / takeaway horizontal) ---------- */
export function FoodCard({ p, section }) {
  const type = section || 'restaurant';
  const href = (type === 'restaurant' ? '#/restaurant/dish/' : '#/tk/') + p.id;
  return (
    <article className="f-card reveal">
      <a className="f-img" href={href} aria-label={p.name}>
        <Frame src={p.img} alt={p.name} />
      </a>
      <div className="f-body">
        <a className="f-name" href={href}>{p.name}</a>
        <p className="f-desc">{p.desc}</p>
        <div className="row" style={{ gap: '8px' }}>
          <Stars rating={p.rating} count={p.reviews} />
          {p.badge ? <span className="chip chip-red">{p.badge}</span> : null}
        </div>
        <div className="f-foot">
          <span className="price-row">
            <Price p={p} />
            <span className="small muted-2">{p.unit}</span>
          </span>
          <span className="row" style={{ gap: '8px' }}>
            <FavBtn type={type} id={p.id} />
            <AddFlow type={type} id={p.id} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function GridFoods({ list, section }) {
  if (!list || !list.length) return null;
  return (
    <div className="grid-foods">
      {list.map(p => <FoodCard key={p.id} p={p} section={section} />)}
    </div>
  );
}

/* ---------- benefits row ---------- */
export function Benefits() {
  return (
    <div className="benefits reveal">
      {data().benefits.map((b, i) => (
        <div className="b-item" key={i}>
          <span className="b-ico">{svg(b.icon)}</span>
          <span className="b-t">{b.t}</span>
          <span className="b-s">{b.s}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- empty / error state ---------- */
export function Empty({ icon, title, text, cta, btn }) {
  return (
    <div className="empty reveal">
      <span className="e-ico">{svg(icon) || svg('inbox')}</span>
      <h3>{title}</h3>
      <p>{text || ''}</p>
      {cta ? <a className="btn btn-primary" href={cta.href}>{cta.label}</a> : null}
      {btn ? (
        <button type="button" className="btn btn-primary" data-act={btn.act} onClick={btn.onClick}>
          {btn.label}
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonGrid({ n }) {
  return (
    <div className="grid-cards">
      {Array.from({ length: n || 8 }).map((_, i) => <div className="skel skel-card" key={i} />)}
    </div>
  );
}

/* ---------- reviews ---------- */
export function ReviewItem({ r }) {
  const initial = (r.name || 'م').trim().charAt(0);
  return (
    <div className="review-item">
      <div className="rv-head">
        <span className="rv-av">{initial}</span>
        <span className="grow">
          <span className="rv-name">{r.name}</span>
          <div className="rv-date">{r.date}</div>
        </span>
        <span className="rating">{svg('star')}<span>{toPersianDigits(r.rating)}.۰</span></span>
      </div>
      <p className="rv-text">{r.text}</p>
    </div>
  );
}

export function ReviewForm({ scope }) {
  const u = PM.auth.user;
  const [rate, setRate] = React.useState(5);
  const ref = React.useRef(null);
  /* source only writes form.dataset.rating when a star is clicked */
  const pick = v => {
    setRate(v);
    if (ref.current) ref.current.dataset.rating = String(v);
  };
  return (
    <form
      ref={ref}
      className="review-form"
      data-review={scope}
      onSubmit={e => reviewSubmit(e, scope, rate)}
    >
      <div className="co-card" style={{ marginBottom: '16px' }}>
        <h3><span className="step-n">{svg('edit')}</span>نوشتن دیدگاه</h3>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="rv-n">نام شما</label>
            <input className="input" id="rv-n" name="name" defaultValue={u ? u.name : ''}
              placeholder="مثال: سارا محمدی" required />
          </div>
          <div className="field">
            <label>امتیاز شما</label>
            <RatingPicker value={rate} onPick={pick} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="rv-t">متن دیدگاه</label>
          <textarea className="textarea" id="rv-t" name="text"
            placeholder="تجربه‌تان را از این محصول بنویسید…" required />
        </div>
        <button className="btn btn-primary" type="submit">ثبت دیدگاه</button>
      </div>
    </form>
  );
}

export function ReviewSection({ scope, score, count, title, allow }) {
  const dist = PM.data.distribution(score);
  const rows = addedReviews(scope).concat(PM.data.reviewsFor(scope));
  const bars = [
    ['۵', dist.five], ['۴', dist.four], ['۳', dist.three], ['۲', dist.two], ['۱', dist.one]
  ];
  return (
    <section className="section-tight reveal" id="reviews">
      <div className="sec-head">
        <span className="sec-ico">{svg('note')}</span>
        <div className="sec-titles">
          <h2>{title || 'دیدگاه کاربران'}</h2>
          <div className="sec-sub">{toPersianDigits(rows.length)} دیدگاه ثبت‌شده برای این مورد</div>
        </div>
      </div>
      <div className="reviews-wrap">
        <div className="rating-card">
          <div className="big">{toPersianDigits(score.toFixed(1))}</div>
          <div className="rating" style={{ marginTop: '4px' }}>
            {svg('star')}<span>{toPersianDigits(score.toFixed(1))} از ۵</span>
          </div>
          <div className="small muted-2 mt-1">{toPersianDigits(count)} امتیاز کلی</div>
          <div className="rating-bars">
            {bars.map((b, i) => (
              <div className="r-bar" key={i}>
                <span>{b[0]}</span>
                <span className="track"><span className="fill" style={{ width: b[1] + '%' }} /></span>
                <span>{toPersianDigits(b[1])}٪</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          {allow !== false ? <ReviewForm scope={scope} /> : null}
          <div className="review-list">
            {rows.map((r, i) => <ReviewItem key={i} r={r} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- product detail info blocks ---------- */
export function PdBlocks({ list }) {
  const items = (list || []).filter(x => x && x.b);
  if (!items.length) return null;
  return (
    <div className="pd-blocks">
      {items.map((x, i) => (
        <section className="pd-block" key={i}>
          <h4 className="pd-block-t">{x.t}</h4>
          <div className="pd-block-b">{x.b}</div>
        </section>
      ))}
    </div>
  );
}

/* ---------- shared category navigation (store · restaurant · takeaway) ---------- */
export function CatNav({ list, opts }) {
  const o = opts || {};
  return (
    <div className={'cat-nav' + (o.cls ? ' ' + o.cls : '')}>
      {list.map(c => {
        const active = c.active ? ' active' : '';
        const inner = (
          <>
            <span className={'cn-img' + (c.img ? '' : ' cn-ico')}>
              {c.img
                ? <img src={c.img} alt="" loading="lazy" decoding="async" />
                : (svg(c.icon) || svg('grid'))}
            </span>
            <span className="cn-txt">
              <span className="cn-name">{c.fa}</span>
              {c.count != null
                ? <span className="cn-count">
                    {typeof c.count === 'string' ? c.count : toPersianDigits(c.count) + ' ' + (c.countUnit || 'مورد')}
                  </span>
                : (c.en ? <span className="cn-en">{c.en}</span> : null)}
            </span>
          </>
        );
        if (o.button) {
          return (
            <button
              type="button"
              className={'cat-nav-card' + active}
              {...{ [o.attr || 'data-menu-cat']: c.id }}
              key={c.id}
              onClick={o.onPick ? () => o.onPick(c.id) : undefined}
            >
              {inner}
            </button>
          );
        }
        const href = o.hrefPrefix ? o.hrefPrefix + c.id : c.href;
        return (
          <a className={'cat-nav-card' + active} href={href} aria-current={c.active ? 'page' : undefined} key={c.id}>
            {inner}
          </a>
        );
      })}
    </div>
  );
}

/* ---------- compact CTA band with imagery ---------- */
export function CtaBand({ title, text, href, label, img }) {
  return (
    <div className="cta-band reveal">
      <div className="cb-copy">
        <h3>{title}</h3>
        <p>{text}</p>
        <a className="btn btn-primary" href={href}>{label}</a>
      </div>
      <div className="cb-img img-frame">
        <img src={img} alt="" loading="lazy" decoding="async" />
        <span className="img-fallback">{svg('fire')}</span>
      </div>
    </div>
  );
}

/* ---------- cat chips ---------- */
export function Chips({ list, active, hrefPrefix, iconKey, onPick }) {
  return (
    <div className="cat-chips reveal">
      {list.map(c => {
        const href = hrefPrefix ? hrefPrefix + c.id : null;
        const cls = 'cat-chip' + (c.id === active ? ' active' : '');
        const ic = c.icon && hasIcon(c.icon) ? svg(c.icon) : svg('grid');
        return href
          ? <a className={cls} href={href} key={c.id}>{ic}{c.fa}</a>
          : <button type="button" className={cls} data-chip={c.id} key={c.id}
              onClick={onPick ? () => onPick(c.id) : undefined}>{ic}{c.fa}</button>;
      })}
    </div>
  );
}
function hasIcon(name) { return !!I[name]; }

/* ---------- summary block ---------- */
export function Summary({ rows }) {
  return (
    <div className="summary">
      {rows.map((r, i) => (
        <div className={'s-row' + (r.total ? ' total' : '')} key={i}>
          <span>{r.k}</span>
          <span className={r.free ? 'free' : undefined}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- cart item ---------- */
export function CartItem({ it }) {
  const href = it.type === 'store' ? '#/p/' + it.id
    : it.type === 'restaurant' ? '#/restaurant/dish/' + it.id
    : '#/tk/' + it.id;
  return (
    <div className="cart-item">
      <a className="ci-img img-frame" href={href}>
        <img src={it.img} alt={it.name} />
        <span className="img-fallback">{svg('drum')}</span>
      </a>
      <div>
        <div className="ci-name"><a href={href}>{it.name}</a></div>
        {it.variant ? <div className="ci-var">{it.variant}</div> : null}
        <div className="ci-price">{formatAmount(it.price * it.qty)} تومان</div>
        <div style={{ marginTop: '8px' }}>
          <QtyStepper value={it.qty} k={it.key} />
        </div>
      </div>
      <div className="ci-side">
        <button
          type="button"
          className="ci-remove"
          data-del={it.key}
          aria-label="حذف از سبد"
          onClick={() => delKey(it.key)}
        >
          {svg('trash')}
        </button>
        <span className="small muted-2">{formatAmount(it.price)} / واحد</span>
      </div>
    </div>
  );
}
