/* ============================================================
   ProMeat — views.jsx
   Route → page component (port of renderView() in js/app.js)
   ============================================================ */
import React from 'react';
import { setMenuCat } from '../lib/viewstate.js';

import { Dash } from './dashboard.jsx';
import { StoreHome, Category, Product, Checkout, OrderDone } from './store.jsx';
import { RestaurantHome, Branches, Menu, Dish, Reserve, ReserveDone } from './restaurant.jsx';
import { TakeawayHome, TkCategory, TkProduct } from './takeaway.jsx';
import {
  Login, Register, About, Account, Orders, Reservations,
  Favorites, Addresses, Settings, Wallet, NotFound
} from './account.jsx';

/* the account area shares one shell: route name → page component */
const ACCOUNT_PAGES = {
  account: Account,
  orders: Orders,
  reservations: Reservations,
  favorites: Favorites,
  addresses: Addresses,
  settings: Settings,
  wallet: Wallet
};

/* remembers which ?c= value has already been applied, so repaints that are not
   navigations never re-run the side effect (see case 'menu') */
let lastMenuQC = null;

export function Page({ route }) {
  if (route.name !== 'menu') lastMenuQC = null;

  const Acc = ACCOUNT_PAGES[route.name];
  if (Acc) return <Acc />;

  switch (route.name) {
    case 'dash': return <Dash />;

    case 'storeHome': return <StoreHome />;
    case 'category': return <Category cat={route.cat} />;
    case 'product': return <Product id={route.id} />;
    case 'checkout': return <Checkout />;
    case 'orderDone': return <OrderDone id={route.id} />;

    case 'restaurantHome': return <RestaurantHome />;
    case 'branches': return <Branches />;
    case 'menu':
      /* source: if (r.q && r.q.c) PM.views.setMenuCat(r.q.c) — applied only when the
         query actually changes, so clicking a category chip (which does not touch the
         URL) is not undone by the repaint it triggers. */
      if ((route.q && route.q.c || null) !== lastMenuQC) {
        lastMenuQC = (route.q && route.q.c) || null;
        if (lastMenuQC) setMenuCat(lastMenuQC);
      }
      return <Menu />;
    case 'dish': return <Dish id={route.id} />;
    case 'reserve': return <Reserve />;
    case 'reserveDone': return <ReserveDone id={route.id} />;

    case 'takeawayHome': return <TakeawayHome />;
    case 'tkCategory': return <TkCategory cat={route.cat} />;
    case 'tkProduct': return <TkProduct id={route.id} />;

    case 'login': return <Login />;
    case 'register': return <Register />;
    case 'about': return <About />;

    default: return <NotFound />;
  }
}

export default Page;
