/* ============================================================
   ProMeat — dashboard.jsx
   Landing switcher (port of dashboardHTML() in js/app.js)
   ============================================================ */
import React from 'react';
import { PM } from '../lib/state.js';
import { ui } from '../lib/ui.js';
import { EntryCard } from '../components/ui.jsx';

export function Dash() {
  const sec = PM.section.id;
  const u = PM.auth.user;

  return (
    <div className="dash">
      <div className="dash-top">
        <a className="logo-link" href="#/" aria-label="پرومیت">
          <img className="logo-cow" src="assets/logo/cow-white.png" alt="" />
          <img className="logo-word" src="assets/logo/wordmark-white.png" alt="پرومیت promeat" />
        </a>
        <button className="btn btn-ghost btn-sm" type="button" data-open-profile="" onClick={() => ui.openProfile()}>
          <span>{u ? 'حساب من' : 'ورود / ثبت‌نام'}</span>
        </button>
      </div>

      <div className="dash-main">
        <div className="dash-slogan">
          <h1 className="dash-title">پروتئین، سبک زندگی ماست</h1>
          <p className="dash-sub">عرضه مستقیم محصولات پروتئینی، رستوران و بیرون بر— کیفیت، تنوع، اعتماد.</p>
        </div>

        <div className="entry-grid dash-cards">
          {PM.data.sections.map((s, i) => (
            <EntryCard key={s.id} sec={s} i={i} active={s.id === sec} />
          ))}
        </div>
      </div>

      <div className="dash-foot">
        © ۱۴۰۴ پرومیت · ارائه مستقیم محصولات پروتئینی
      </div>
    </div>
  );
}
export default Dash;
