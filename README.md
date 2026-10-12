# ProMeat

A single-page storefront for the ProMeat brand, combining three shopping areas — a protein
**store**, a **restaurant** with table reservation, and a **takeaway** menu — plus a customer
account area with orders, favourites, addresses, settings and a wallet.

The interface is Persian (`lang="fa"`, `dir="rtl"`) and is built as a React SPA served from the
filesystem-relative base `./`, so the production bundle can be opened from any sub-path.

---

## Verified feature set

Everything below was exercised in the running app while preparing this repository:

- **Three sections with independent state**: store (`#/store`), restaurant (`#/restaurant`), takeaway (`#/takeaway`), plus a landing dashboard (`#/`).
- **Hash routing** for 16+ distinct views, including product/dish detail, category, checkout and order-done pages.
- **Listing pipeline**: category chips, multi-type filters, price-range filter, minimum rating, "popular only", and five sort orders (newest, cheapest, most expensive, best reviewed, most popular). Filters are held per section and are reset per section.
- **Product cards** with quick add-to-cart, favourite toggle, rating, badge and image fallback.
- **Detail pages** with variant/weight/size/sauce/extra selection; the price and cart line key are computed the same way as the quick-add so both hit the same cart line.
- **Cart drawer + checkout**: quantity steppers, per-line remove, totals, order creation, order confirmation page.
- **Favourites, orders, reservations, addresses** persisted per browser.
- **Authentication (local only)**: login/register gates cart, favourites and the account area.
- **Restaurant reservation**: 4-step flow (branch & time → table → pre-order dishes → review & confirm) with its own confirmation page.
- **Wallet**: top-up request with validation, pending/settled/cancelled transactions, balance derived from the ledger.
- **Global search overlay** across all three catalogues (`Ctrl`/`Cmd` + `K`), profile and filter drawers, modal host, toast zone, keyboard `Escape` handling, scroll-reveal animations and section slide transitions.
- **Responsive layout** down to mobile widths with a bottom tab bar.

## Tech stack

| Concern | Choice |
| --- | --- |
| UI library | React 19 (`react`, `react-dom`) |
| Build tool / dev server | Vite 7 with `@vitejs/plugin-react` |
| Language | JavaScript + JSX (no TypeScript) |
| Routing | Custom hash router (`src/lib/router.js`) — no router dependency |
| State | Custom observable store + React hooks (`src/lib/state.js`, `src/lib/hooks.js`) — no state library |
| Styling | Plain hand-written CSS in `public/css`, loaded as static `<link>` files |
| Persistence | `localStorage` only |
| Fonts | Self-hosted `.woff2` (Yekan Bakh Fa Num) — no Google Fonts or CDN |
| Tests / lint / CI | None configured (see *Known limitations*) |

## Project structure

```
.
├── index.html                 # RTL shell, font preload, 4 stylesheet links, #root
├── vite.config.js             # base './', dev server 127.0.0.1:5180, outDir dist
├── package.json
├── public/                    # copied verbatim to dist/ by Vite
│   ├── css/
│   │   ├── base.css           # @font-face, design tokens (:root), reset, layout primitives
│   │   ├── components.css     # header, drawers, cards, buttons, modals
│   │   ├── pages.css          # per-section page styling
│   │   └── app.css            # page-specific refinements (loaded last)
│   └── assets/
│       ├── fonts/             # 7 YekanBakhFaNum .woff2 weights (100–800)
│       ├── img/               # 56 .jpg product / dish / hero images
│       └── logo/              # 7 logo mark variants
└── src/
    ├── main.jsx               # createRoot entry
    ├── App.jsx                # global shell: routing, chrome, overlays, keyboard, reveal
    ├── components/
    │   ├── icons.jsx          # <svg> builder + inline icon paths
    │   ├── ui.jsx             # shared widgets: cards, stars, filters, selects, toasts
    │   ├── shell.jsx          # Header, Footer, TabBar, Scrim, ToastZone, ModalHost
    │   ├── drawers.jsx        # ProfileDrawer, CartDrawer, FilterDrawer
    │   └── SearchOverlay.jsx  # cross-section search
    ├── pages/
    │   ├── views.jsx          # route name → page component dispatch
    │   ├── dashboard.jsx      # landing (#/)
    │   ├── store.jsx          # store home, category, product, checkout, order done
    │   ├── restaurant.jsx     # home, branches, menu, dish, reserve, reserve done
    │   ├── takeaway.jsx       # home, category, product
    │   └── account.jsx        # auth + the whole account area incl. wallet
    ├── lib/
    │   ├── state.js           # PM store: cart, auth, favourites, orders, reservations, addresses
    │   ├── data.js            # catalogue seed data (store / restaurant / takeaway / mocks)
    │   ├── router.js          # hash grammar → route descriptor (pure)
    │   ├── hooks.js           # usePM / useHash / useRoute / go / bump
    │   ├── viewstate.js       # filter + sort + price-range pipeline
    │   ├── actions.js         # shared interaction handlers (add to cart, favourites, flows)
    │   ├── wallet.js          # wallet service boundary (see below)
    │   ├── rsv.js             # reservation flow state
    │   ├── reviews.js         # user-submitted review persistence
    │   └── ui.js              # imperative UI events (open drawer / search / modal)
    ├── utils/format.js        # Persian digits, Toman amount formatting, escapeHtml
    └── assets/icons/registry.js  # icon path data
```

## Prerequisites

- **Node.js 20.19.0+, or 22.12.0+** (Vite 7 engine requirement). Verified on Node v22.18.0.
- **npm 10+** (verified on npm 10.9.3). npm is the package manager; `package-lock.json` is committed.

## Installation

```bash
npm install
```

## Environment configuration

**No environment variables are required.** The app has no backend: all catalogue content comes from
`src/lib/data.js` and all state lives in the browser. There is nothing to configure before running
`npm run dev` or `npm run build`, so the repository intentionally ships no `.env.example`.

The one configuration-like switch is a source constant, not an env var: `WALLET_DEMO` in
`src/lib/wallet.js` (currently `true`). While it is `true`, the wallet exposes the "settle pending
top-up" simulation control and labels the wallet as a demo. Set it to `false` when a real payments
backend is connected — the service already refuses the client-side confirmation calls in that case.

## Development server

```bash
npm run dev
```

Serves on **http://127.0.0.1:5180/** (`strictPort: true`, so Vite fails instead of silently moving
to another port). Host is loopback-only by design.

## Production build

```bash
npm run build     # emits dist/
npm run preview   # serves the built dist/ locally
```

`npm run build` prints four warnings of the form `css/base.css doesn't exist at build time`. **These
are expected and harmless**: the stylesheets live in `public/css/` and are referenced by relative URL
from `index.html`, so they are not part of the module graph. Vite copies `public/` into `dist/`
verbatim. Current output: one JS chunk (~426 kB, ~123 kB gzipped) plus the copied `css/` and `assets/`.

## Testing and linting

None are configured. There is no test runner, no ESLint or Prettier dependency, and no CI workflow;
`package.json` exposes only `dev`, `build` and `preview`. The refactor was instead validated with a
temporary headless-browser verification harness, which has been removed from the tree — see
*Known limitations* item 8 for what it proved and how to reproduce it.

## Routing and architecture

Routes are hash-based; `src/lib/router.js` parses the hash into a `{ name, section, ...params }`
descriptor and `src/pages/views.jsx` maps that name to a page component.

| URL | Route name | Section |
| --- | --- | --- |
| `#/` | `dash` | – |
| `#/store`, `#/store/c/:cat`, `#/p/:id` | `storeHome` / `category` / `product` | store |
| `#/checkout`, `#/order/:id/done` | `checkout` / `orderDone` | store |
| `#/restaurant`, `#/restaurant/menu`, `#/restaurant/branches` | `restaurantHome` / `menu` / `branches` | restaurant |
| `#/restaurant/dish/:id`, `#/restaurant/reserve`, `#/restaurant/reserve/:id/done` | `dish` / `reserve` / `reserveDone` | restaurant |
| `#/takeaway`, `#/takeaway/c/:cat`, `#/tk/:id` | `takeawayHome` / `tkCategory` / `tkProduct` | takeaway |
| `#/auth`, `#/auth/register` | `login` / `register` | – |
| `#/account`, `#/orders`, `#/reservations`, `#/favorites`, `#/addresses`, `#/settings`, `#/wallet` | matched by segment | – |
| anything else | `notFound` | – |

State flows through a single `PM` object (`src/lib/state.js`) exposing namespaced modules
(`PM.cart`, `PM.auth`, `PM.fav`, `PM.orders`, `PM.reservations`, `PM.addresses`, `PM.section`). Each
mutation writes to `localStorage` and emits on `PM.store`; React components subscribe through
`usePM()`, and non-React call sites repaint with `bump()`. Route changes are the only source of
navigation; `App.jsx` owns the chrome (header/footer/tab bar), the overlays and the view transition.

Persistence uses the `promeat:` key prefix: `cart`, `user`, `favorites`, `orders`, `reservations`,
`addresses`, `section`, `wallet`, `userReviews`, plus `pref:<name>` for individual account settings
toggles.

## Assets and design tokens

All images, logos and fonts are local under `public/assets/` and referenced by relative URL
(`assets/img/…`), so the deployed site makes no third-party network requests.

`public/css/base.css` holds the token layer in `:root`:

- **Brand**: `--red: #790003` (primary fill), `--red-hover: #8d0306`, `--red-ghost`, `--red-bright` /
  `--red-bright-glow`, `--white`, `--black`.
- **Neutrals**: warm ink/background/line ramp (`--bg`, `--card`, `--ink*`, `--line`, `--line-2`).
- **Typography**: `--font-family-primary` — the single self-hosted Yekan stack, with numeric glyphs
  handled by the same face.
- **Layout**: `--shell`, `--gutter`, `--header-h`, `--page-gap`, radii `--r-sm` … `--r-xl`, the
  `--btn-*` button scale, motion durations `--fast` / `--mid` / `--slow`.

RTL is the default; the few intentionally left-to-right spots (prices, phone numbers, Latin strings)
are carried by dedicated utility classes rather than per-component overrides.

**Unreferenced assets kept on purpose.** An automated audit (every `assets/…` URL and `url()` in
`src/`, `public/css/` and `index.html`, resolved against disk) reports **zero missing references** and
these files as not referenced by the app:

- `assets/img/hero-side-store.jpg`, `hero-side-restaurant.jpg`, `hero-side-takeaway.jpg`
- `assets/logo/cow.png`, `assets/logo/logo.png` (the dark-background counterparts of the currently
  used `cow-white.png` / `logo-white.png`)
- `assets/logo/preview-color-light.png`, `assets/logo/preview-white-dark.png` (brand-preview sheets)

They are brand/image source material rather than dead weight, so they were kept — usage could not be
ruled out with confidence. The eight orphaned takeaway/restaurant beverage and dessert photos that a
previous approved work order removed from the menu were deleted, and no byte-duplicate images exist.

## Git workflow

The project is a Git repository on the `main` branch. `.gitignore` and `.editorconfig` define what is
tracked and how files are normalised:

- `.gitignore` excludes `node_modules/`, `dist/`, `.vite/`, local env files (keeping `.env.example`
  trackable), editor directories, OS artifacts, logs, `.backup-phaseK/` (a local, untracked copy of
  `src/` and `public/` from before the refactor pass — safe to delete once the work is committed) and
  `vibe_images/` (an unreferenced image-generation scratch pool). Sources, `public/assets/` (fonts,
  images, logos) and `package-lock.json` are **not** ignored.
- `.editorconfig` enforces UTF-8, LF, final newline, trimmed trailing whitespace and 2-space
  indentation for JS/CSS/HTML; Markdown keeps trailing whitespace so hard line breaks survive.
- `.gitattributes` normalises text files to LF in the repository and on checkout, overriding a
  machine-level `core.autocrlf=true`, and marks the font/image files as binary.

Daily workflow: branch off `main`, keep changes small, run `npm run build` before pushing, and use
Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`). Never commit `dist/`
or `node_modules/`.

## Known limitations

1. **No backend.** There is no API integration, no server authentication and no real payment
   provider. Login accepts any phone/password pair; orders, favourites and the wallet are browser
   state. Wallet balances are a browser-local ledger and do **not** represent real money — that is why
   `WALLET_DEMO` is `true` and why the wallet page prints a "numbers are not real" notice.
   `src/lib/wallet.js` is deliberately isolated as the seam where a gateway/ledger service can be
   dropped in without touching the pages.
2. **Catalogue content is seed data** in `src/lib/data.js`, not a CMS or database. It is structured
   (products, dishes, branches, reviews, mock orders) and is the contract the UI renders against.
3. **Stylesheets bypass the bundler** (loaded at runtime from `public/css` in the order
   base → components → pages → app). This keeps specificity and cascade behaviour exactly as the
   original project but means CSS is not minified or hashed by Vite, and produces the four expected
   build warnings.
4. **No tests, linter, formatter or CI.** Recommend adding, in this order: a smoke test per route,
   ESLint with `eslint-plugin-react`, then Prettier configured so it never reformats Persian string
   literals.
5. **Pre-existing issues found during the audit and intentionally left alone** (fixing any of them
   changes behaviour, which the refactor explicitly forbade):
   - `.nav-card` reads `var(--bg-primary)`, which is never defined (`public/css/base.css`), so that
     declaration resolves to the initial value.
   - `PM.cart.stepLine()` creates lines without a `unit`, unlike `PM.cart.add()`.
   - `addFromDetail()`'s `isTk` branch is never taken by the current call sites.
   - The checkout form collects six fields (`#coAddr`, `#fPhone`, `#fState`, `#fCity`, `#fZip`,
     `#fPlaque`) that are read but not stored on the created order.
   - Footer social links point at the `#/` placeholder.
   - Several `data-rsv-*`, `data-d` and `data-m` attributes are written but never read by JS; they
     are kept because CSS selectors may target them.
   - Unreachable font weights (100/300) are kept because the work order required preserving the
     original typography assets.
   - The empty `catch {}` blocks (13 sites) are intentional guards: around `localStorage`
     read/write (private-browsing safety) and around store/listener dispatch (one faulty subscriber
     must not break the others).
6. **`vibe_images/`** at the project root is an image-generation scratch pool (~3 MB, one file). It
   is referenced by nothing in `src/`, `public/css/` or `index.html`, so it is listed in `.gitignore`
   and kept locally rather than published. Delete it whenever you like.
7. **Font files carry their original vendor filenames** and remain uncommitted to any license audit —
   confirm the Yekan Bakh web-font license permits redistribution before publishing this repository.
8. **Manual verification only.** Behaviour was verified by comparing a per-element computed-style
   fingerprint of 16 routes before and after the refactor — byte-identical at 1280, 768 and 390 px —
   plus a 29-route health sweep at the same three widths (0 console errors, 0 failed subresources,
   247 images all decoded, 0 px horizontal overflow) and a clean `npm run build`. There is no
   automated regression suite to run after future changes.
