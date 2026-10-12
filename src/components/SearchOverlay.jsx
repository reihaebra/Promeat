/* ============================================================
   ProMeat — SearchOverlay.jsx
   Full-screen search (port of openSearch/closeSearch/renderSearch
   in js/app.js).  Results reuse the standard shared product card.
   ============================================================ */
import React, { useEffect, useRef, useState } from 'react';
import { PM } from '../lib/state.js';
import { svg } from './icons.jsx';
import { ui } from '../lib/ui.js';
import { ProductCard } from './ui.jsx';

const SUGGEST = ['فیله گوساله', 'کباب کوبیده', 'مرغ سوخاری', 'سالمون', 'دونر', 'پکیج خانوادگی'];

export default function SearchOverlay({ open }) {
  const [term, setTerm] = useState('');
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTerm('');
      const id = setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  /* results reuse the standard shared product card, in a clean grid —
     reveal nodes are made visible immediately (same as source). */
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const els = box.querySelectorAll('.reveal');
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      el.style.setProperty('--rd', Math.min(i % 6, 5) * 0.05 + 's');
      el.classList.add('in');
    }
  }, [term, open]);

  const t = (term || '').trim();
  const rows = t
    ? PM.data.searchIndex.filter(r => r.hay.indexOf(t) !== -1 || r.name.indexOf(t) !== -1).slice(0, 10)
    : [];

  const hint = !t
    ? 'در بخش فروشگاه، رستوران و بیرون‌بر جستجو کنید.'
    : (!rows.length ? 'نتیجه‌ای برای «' + t + '» پیدا نشد' : '');

  const onInput = e => setTerm(e.target.value);
  const pick = s => setTerm(s);
  /* back arrow — exits the selected category/filter: clears the search text
     and returns the search UI to its normal, unfiltered state. */
  const onBack = () => {
    setTerm('');
    if (inputRef.current) inputRef.current.focus();
  };
  /* magnifier button and Enter both execute the current query */
  const runSearch = e => {
    e.preventDefault();
    if (boxRef.current && boxRef.current.children.length) boxRef.current.scrollIntoView({ block: 'nearest' });
    else if (inputRef.current) inputRef.current.focus();
  };
  /* Anywhere outside the search controls closes the overlay.  A
     target/currentTarget test is not enough: on phones the panel spans the
     whole width, so most of the visible backdrop is panel chrome.  pointerdown
     covers touch, pen and mouse in one path. */
  const onOutside = e => {
    const t = e.target;
    if (t && t.closest && t.closest('.search-box, .search-results')) return;
    ui.closeSearch();
  };

  return (
    <div className={'search-overlay' + (open ? ' open' : '')} id="searchOverlay" role="dialog" aria-modal="true" aria-label="جستجو" onPointerDown={onOutside}>
      <div className="search-panel">
        <form className="search-box" onSubmit={runSearch}>
          {t ? (
            <button className="icon-btn" type="button" onClick={onBack} aria-label="بازگشت و حذف دسته انتخاب‌شده">
              {svg('arrowR')}
            </button>
          ) : null}
          <input
            type="search"
            id="searchInput"
            ref={inputRef}
            value={term}
            onChange={onInput}
            placeholder="جستجوی محصول، غذا، برند…"
            autoComplete="off"
            aria-label="عبارت جستجو"
          />
          <button className="icon-btn" type="submit" id="searchGo" aria-label="اجرای جستجو">
            {svg('search')}
          </button>
        </form>

        <div className="search-results" id="searchResults" ref={boxRef}>
          {!t ? (
            <>
              <div className="search-hint">محبوب‌ترین جستجوها</div>
              {SUGGEST.map(s => (
                <button type="button" className="f-option" data-sq={s} style={{ margin: '4px' }} key={s} onClick={() => pick(s)}>
                  {s}
                </button>
              ))}
            </>
          ) : rows.length ? (
            <div className="grid-cards search-grid">
              {rows.map(r => {
                const p = PM.catalog(r.type, r.id);
                return p ? <ProductCard p={p} section={r.type} key={r.type + ':' + r.id} /> : null;
              })}
            </div>
          ) : null}
        </div>

        {hint ? <p className="search-hint" id="searchHint">{hint}</p> : null}
      </div>
    </div>
  );
}
