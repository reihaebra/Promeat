/* ============================================================
   ProMeat — wallet.js
   Wallet SERVICE BOUNDARY (the only place the UI talks to money).

   READ THIS BEFORE TRUSTING ANY NUMBER BELOW:
   This project has no backend and no payment provider wired in, so the
   ledger is a browser-local sandbox persisted in localStorage. Balances
   here are NOT real money, deposits are NOT paid, and nothing is charged
   to any card. Every method is async and returns a result object so a
   real gateway/ledger service can replace the internals without the
   pages changing. When the backend lands, set DEMO = false and swap the
   bodies for API calls; the exported shape is the contract.
   ============================================================ */
import { PM } from './state.js';
import { formatToman } from '../utils/format.js';

/* dev/demo-only behaviour: pending deposits can be simulated as settled,
   and the UI labels that control as a simulation. Kill switch for prod. */
export const WALLET_DEMO = true;

export const MIN_DEPOSIT = 50000;        /* تومان */
export const MAX_DEPOSIT = 50000000;     /* تومان */

export const TX_TYPE = {
  topup: 'شارژ کیف پول',
  payment: 'پرداخت سفارش',
  refund: 'بازگشت وجه'
};

export const TX_STATUS = {
  pending: 'در انتظار تأیید',
  settled: 'ثبت شده',
  canceled: 'لغو شده'
};

const LS_KEY = 'wallet';

function read() {
  try {
    const raw = localStorage.getItem('promeat:' + LS_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && Array.isArray(v.txs) ? v : { txs: [] };
  } catch (e) { return { txs: [] }; }
}

function write(state) {
  try { localStorage.setItem('promeat:' + LS_KEY, JSON.stringify(state)); } catch (e) {}
  PM.store.emit('wallet');
}

function faDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) { return String(iso).slice(0, 10); }
}

/* available = settled top-ups + refunds − settled payments */
function balances(txs) {
  let available = 0, pending = 0;
  txs.forEach(t => {
    const signed = t.type === 'payment' ? -t.amount : t.amount;
    if (t.status === 'settled') available += signed;
    else if (t.status === 'pending' && t.type === 'topup') pending += t.amount;
  });
  return { available: Math.max(0, available), pending: Math.max(0, pending) };
}

function nextId(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4).toString(36);
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms == null ? 220 : ms));
}

/* accepts Persian/Arabic digits and grouped numbers, exactly what a user pastes */
function toLatinDigits(s) {
  return String(s == null ? '' : s)
    .replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
}

function normalizeAmount(input) {
  const raw = toLatinDigits(input).replace(/[^\d]/g, '');
  const n = Math.round(Number(raw));
  if (!raw || !Number.isFinite(n) || n <= 0) return { error: 'مبلغ را به عدد وارد کنید.' };
  if (n < MIN_DEPOSIT) return { error: 'حداقل مبلغ شارژ ' + formatToman(MIN_DEPOSIT) + ' است.' };
  if (n > MAX_DEPOSIT) return { error: 'حداکثر مبلغ هر شارژ ' + formatToman(MAX_DEPOSIT) + ' است.' };
  return { amount: n };
}

/* validation lives here so the confirm step and the ledger can never disagree */
export function validateDeposit(input) {
  const a = normalizeAmount(input && input.amount);
  if (a.error) return { ok: false, error: a.error };
  if (!input.method) return { ok: false, error: 'روش شارژ را انتخاب کنید.' };
  return { ok: true, amount: a.amount };
}

export const Wallet = {
  /* ---- read ---- */
  async getState() {
    await delay(0);
    const txs = read().txs.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const b = balances(txs);
    return { available: b.available, pending: b.pending, txs, demo: WALLET_DEMO };
  },

  /* ---- deposit: recorded as PENDING, never auto-credited ---- */
  async deposit(input) {
    const v = validateDeposit(input);
    if (!v.ok) return { ok: false, error: v.error };

    const tx = {
      id: nextId('w'),
      type: 'topup',
      status: 'pending',
      amount: v.amount,
      method: input.method,
      note: 'در انتظار تأیید پرداخت — این نسخه به درگاه متصل نیست.',
      date: new Date().toISOString()
    };
    const s = read();
    s.txs.push(tx);
    write(s);
    return { ok: true, tx: tx };
  },

  /* ---- DEV ONLY: pretend the gateway confirmed the transfer ---- */
  async simulateSettle(txId) {
    if (!WALLET_DEMO) return { ok: false, error: 'تأیید شارژ فقط از سمت سرور انجام می‌شود.' };
    const s = read();
    const tx = s.txs.find(t => t.id === txId && t.type === 'topup');
    if (!tx || tx.status !== 'pending') return { ok: false, error: 'این شارژ قابل تأیید نیست.' };
    tx.status = 'settled';
    tx.note = 'شبیه‌سازی تأیید در محیط توسعه — مبلغ واقعی پرداخت نشده است.';
    write(s);
    return { ok: true, tx: tx };
  },

  async cancelDeposit(txId) {
    if (!WALLET_DEMO) return { ok: false, error: 'لغو شارژ فقط از سمت سرور انجام می‌شود.' };
    const s = read();
    const tx = s.txs.find(t => t.id === txId && t.type === 'topup');
    if (!tx || tx.status !== 'pending') return { ok: false, error: 'این شارژ قابل لغو نیست.' };
    tx.status = 'canceled';
    write(s);
    return { ok: true, tx: tx };
  },

  /* ---- payment: idempotent per order id, no double debit ---- */
  async pay(opts) {
    const orderId = opts && opts.orderId;
    const amount = Math.round(Number(opts && opts.amount) || 0);
    if (!orderId) return { ok: false, error: 'شناسه سفارش داده نشده است.' };
    if (amount <= 0) return { ok: false, error: 'مبلغ سفارش نامعتبر است.' };

    const s = read();
    const done = s.txs.find(t => t.type === 'payment' && t.orderId === orderId && t.status === 'settled');
    if (done) return { ok: true, tx: done, already: true };

    if (balances(s.txs).available < amount) {
      return { ok: false, error: 'موجودی کیف پول به این مبلغ نمی‌رسد.', code: 'insufficient' };
    }

    const tx = {
      id: nextId('w'),
      type: 'payment',
      status: 'settled',
      amount: amount,
      orderId: orderId,
      note: 'پرداخت از کیف پول',
      date: new Date().toISOString()
    };
    s.txs.push(tx);
    write(s);
    return { ok: true, tx: tx };
  },

  /* ---- synchronous peek for summary rows / checkout guards ---- */
  peek() {
    return balances(read().txs);
  },

  subscribe(fn) {
    return PM.store.subscribe(what => { if (what === 'wallet') fn(); });
  },

  faDate: faDate,
  typeFa: t => TX_TYPE[t] || t,
  statusFa: s => TX_STATUS[s] || s
};

export default Wallet;
