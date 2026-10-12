/* ============================================================
   ProMeat — rsv.js
   Reservation flow state (port of PM.rsv in views-restaurant.js)
   ============================================================ */
import { PM } from './state.js';

export const rsv = {
  step: 1,
  branch: '',
  day: '۲۸', month: 'مرداد', dateFull: '۲۸ مرداد ۱۴۰۴',
  time: '', guests: '', table: '',
  food: {}                       /* { dishId: qty } */
};

export function rsvReset() {
  rsv.step = 1; rsv.time = ''; rsv.guests = ''; rsv.table = ''; rsv.food = {};
  rsv.branch = '';
}

export const DAYS = [
  { day: '۲۶', month: 'مرداد', dateFull: '۲۶ مرداد ۱۴۰۴' },
  { day: '۲۷', month: 'مرداد', dateFull: '۲۷ مرداد ۱۴۰۴' },
  { day: '۲۸', month: 'مرداد', dateFull: '۲۸ مرداد ۱۴۰۴' },
  { day: '۲۹', month: 'مرداد', dateFull: '۲۹ مرداد ۱۴۰۴' },
  { day: '۳۰', month: 'مرداد', dateFull: '۳۰ مرداد ۱۴۰۴' }
];

export const STEPS = ['شعبه و زمان', 'انتخاب میز', 'پیش‌سفارش غذا', 'بررسی و تایید'];

export function foodSubtotal() {
  return Object.keys(rsv.food).reduce((sum, id) => {
    const dish = PM.data.byId(PM.data.dishes, id);
    return dish ? sum + dish.price * rsv.food[id] : sum;
  }, 0);
}
