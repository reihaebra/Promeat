/* ============================================================
   ProMeat — utils/format.js
   Presentation-only helpers: Latin digits → Persian digits,
   thousands grouping with the Persian separator, the تومان
   money label, and HTML escaping for injected markup.
   No state, no DOM — pure functions.
   ============================================================ */
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const THOUSANDS_SEPARATOR = '٬';

/* 1234 → ۱٬۲۳۴ */
export function toPersianDigits(value) {
  return String(value).replace(/[0-9]/g, d => PERSIAN_DIGITS[+d]);
}

/* a number as a rounded, thousands-grouped Persian-digit string */
export function formatAmount(value) {
  const digits = Math.round(Number(value) || 0).toString();
  return toPersianDigits(digits.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR));
}

/* formatAmount + the currency word */
export function formatToman(value) {
  return formatAmount(value) + ' تومان';
}

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
