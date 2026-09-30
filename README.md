# StyleBazaar — Indian Fashion D2C E-commerce Prototype (Myntra-Style)

A production-grade, pixel-perfect, fully clickable frontend prototype of an Indian D2C fashion e-commerce storefront (**StyleBazaar**) with feature parity to Myntra's shopping experience across Men, Women, and Kids.

Built with **React 18 + Vite + TypeScript + Tailwind CSS** (driven by CSS custom property design tokens) + **Zustand (LocalStorage persist)** + **lucide-react** + **react-helmet-async** + **Vitest** + **Razorpay Gateway Integration**.

---

## 🌟 Complete Feature Roadmap

### Phase 1: Storefront Foundation & Catalog
- **Design Token System (`tokens.css`)**: 100% themeable via CSS custom properties (colors, typography, radii, elevations).
- **MegaMenu & Navigation**: Desktop hover MegaMenu for Men, Women, Kids, Brands, and Sale (up to 70% off) + Mobile Drawer + Bottom Tab Bar.
- **10 Home Page Sections**:
  1. *Hero Carousel* with auto-sliding banners and pause-on-hover.
  2. *Deal of the Day* with real-time midnight countdown timer (`HH:MM:SS`).
  3. *Shop by Category* interactive category tiles.
  4. *Bank & Payment Offers* strip with 1-click coupon code copying.
  5. *Grand Steal Deals* (Min 30%, 40%, 50%, 60% off tiles).
  6. *Brand Spotlight* tiles.
  7. *Trending Now* carousel.
  8. *Recommended for You* responsive catalog grid.
  9. *Recently Viewed* items (persisted across sessions).
  10. *Newsletter VIP Club* with instant `WELCOME100` coupon unlock.
- **Faceted Product Listing Pages (`/men`, `/women`, `/kids`, `/:gender/:category`, `/search`)**:
  - Filter by Brand (searchable), Price, Discount, Size, Color, and Customer Rating.
  - 7 Sort options (Recommended, What's New, Price Low to High, Price High to Low, Rating, Discount).
  - Full URL SearchParams two-way synchronization (`?brand=...&sort=...`).
- **Product Detail Page (PDP) (`/product/:slug`)**:
  - Multi-image gallery with full-screen zoom lightbox.
  - Interactive Size Selector with stock alerts and Inches/CM **Size Chart Modal**.
  - Color Swatches, Pincode Delivery Checker, Accordion Specs, and Rating Summary.

### Phase 2: Wishlist, Bag & 3-Step Checkout Flow
- **Wishlist Page (`/wishlist`)**: Saved items grid with instant 1-click "Move to Bag" modal.
- **Shopping Bag Page (`/bag`)**:
  - Pincode delivery estimator bar.
  - Quantity selector (1–10) and size changer modal.
  - Move to wishlist & gift wrap addon options.
  - **Coupons Modal**: 1-click application of `WELCOME100`, `FASHION20`, `FLAT500` with min-spend validation.
  - Detailed price breakdown with total savings highlight.
- **Dedicated 3-Step Checkout Flow**:
  - Distraction-free header (`BAG` → `ADDRESS` → `PAYMENT`).
  - **Address Selection (`/checkout/address`)**: Saved addresses + 6-digit Indian PIN autofill modal.
  - **Payment Methods (`/checkout/payment`)**:
    - **Razorpay Standard Gateway**: Official partner gateway modal simulation.
    - **UPI / QR Code**: Interactive simulated QR code scanner & custom VPA verification.
    - **Cards**: Card validation with **Simulated 3D Secure OTP Modal**.
    - **Cash on Delivery (COD)**: 4-digit visual captcha verification.
    - **Net Banking**: All major Indian banks.
  - **Order Confirmation (`/order-success/:orderId`)**: Invoice breakdown and direct tracking link.

### Phase 3: Indian Phone OTP Auth & Account Center
- **Phone OTP Authentication (`/login`)**:
  - Indian 10-digit mobile number format (`+91`).
  - 4-digit OTP verification with countdown timer and resend capability.
  - **1-Click Instant Demo Login (`Rahul Sharma`)** for zero-friction evaluation.
  - First-time profile setup modal with 500 bonus points reward.
- **Account Center**:
  - **Profile Details (`/account/profile`)**: Completeness progress bar and editable profile attributes.
  - **Saved Addresses (`/account/addresses`)**: Default address management with PIN autofill.
  - **Wallet & Credits (`/account/wallet`)**: Instant quick recharges (+₹500, +₹1,000) and transaction history.
  - **Insider Loyalty Club (`/account/insider`)**: Tier progression (Silver ➔ Gold ➔ Platinum), points balance, and VIP perks.

### Phase 4: Orders Center, Live Tracking & Reviews
- **Orders Management Hub (`/account/orders`)**:
  - Filter tabs: *All Orders*, *In Transit*, *Delivered*, *Cancelled / Returned*.
  - Instant search by Order ID or item title.
  - Order cards with status badges and item thumbnails.
- **Live Order Tracking (`/account/orders/:orderId`)**:
  - Step progress milestone bar (*Order Placed* ➔ *Packed* ➔ *Shipped* ➔ *Out for Delivery* ➔ *Delivered*).
  - Logistics partner info (**Delhivery Express**, **Blue Dart Surface**) with AWB tracking numbers.
  - Chronological timestamped event history.
- **Self-Serve Actions**:
  - **Cancel Order**: Instant refund credited to **StyleBazaar Wallet**.
  - **Return & Exchange Request**: 2-step modal for item return or replacement size with doorstep pickup scheduling.
- **Customer Ratings & Reviews**:
  - Interactive 5-star rating selector, fit sentiment slider (*Runs Small / True to Size / Runs Large*), review headline, comments, and simulated photo attachments.
  - Automatically merges into the live reviews feed on the product detail page.
- **GST-Compliant Tax Invoice (`OrderInvoice.tsx`)**:
  - Printable modal with GSTIN, CIN, HSN codes, and PDF download simulation.
- **Wallet & Insider Points Checkout Redemption**:
  - Allows paying part or all of the checkout total using Wallet credits or Insider Points.

### Phase 5: Production Backend Architecture & Razorpay Gateway
- **Mock Service Layer (`src/services/api/client.ts`)**:
  - Pluggable architecture: switch from mock data to real backend by setting `VITE_USE_MOCK=false`.
- **Razorpay Standard Integration (`src/services/api/payment.ts`)**:
  - Standard Razorpay checkout script loading (`checkout.js`) with sandbox test key support.
  - Fallback prototype simulation with verified HMAC signatures.
- **Bundle Optimization (`vite.config.ts`)**:
  - Configured Rollup manual chunks (`vendor-react`, `vendor-router`, `vendor-icons`, `vendor-state`).
  - Gzip bundle sizes: CSS ~9.5 kB, JS chunks under 330 kB.
- **Comprehensive Vitest Suite**:
  - **36/36 tests passing** across 7 test suites.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18 + Vite 8** |
| Language | **TypeScript 5/6** (Strict Mode) |
| Styling | **Tailwind CSS** + CSS Custom Property Tokens (`tokens.css`) |
| State Management | **Zustand** with `persist` middleware (Namespaced LocalStorage) |
| Routing | **React Router v6** (Nested routes + URL SearchParams synchronization) |
| Icons | **lucide-react** |
| SEO & Meta | **react-helmet-async** |
| Payment Gateway | **Razorpay Checkout SDK** |
| Unit Testing | **Vitest + jsdom** |

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_USE_MOCK` | `true` | `true` for standalone prototype, `false` for live backend |
| `VITE_API_BASE_URL` | `https://api.stylebazaar.com/v1` | Backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_mock_stylebazaar` | Your Razorpay API Key ID |
| `VITE_BRAND_NAME` | `StyleBazaar` | Storefront brand name |

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Unit Test Suite
```bash
npx vitest run
```

### 5. Build for Production
```bash
npm run build
```

---

## 📂 Project Architecture

```
src/
├── __tests__/                  # 36 Unit tests (pricing, filters, auth, orders, payments)
├── components/
│   ├── account/                # AccountSidebar, ProfileCompleteness, WalletCard, InsiderTierCard
│   ├── auth/                   # LoginForm, OtpVerification, ProfileSetupModal, ProtectedRoute
│   ├── cart/                   # BagItemCard, BagDeliveryBar, ChangeSizeModal, CouponModal
│   ├── checkout/               # CheckoutHeader, PriceSummaryCard, PaymentUpi, PaymentCard, PaymentCod
│   ├── home/                   # 10 Homepage sections (HeroCarousel, DealOfTheDay, etc.)
│   ├── layout/                 # Header, MegaMenu, MobileDrawer, BottomTabBar, Footer, Layout
│   ├── listing/                # FilterSidebar, FilterBottomSheet, SortDropdown, Pagination
│   ├── orders/                 # OrderCard, OrderTracker, CancelOrderModal, ReturnExchangeModal, OrderInvoice
│   ├── product/                # ProductCard, ProductGrid, ProductGallery, SizeSelector, etc.
│   ├── reviews/                # WriteReviewModal
│   └── ui/                     # 15 UI Primitives (Button, Modal, Badge, Accordion, etc.)
├── data/                       # Mock data (Products, Categories, Brands, Banners, Pincodes, Coupons)
├── pages/                      # 12 Storefront & Account Routes
├── services/api/               # Service layer (Products, Reviews, Categories, Pincodes, Razorpay Payment)
├── store/                      # 6 Zustand persistent stores (Cart, Wishlist, Auth, Order, Review, UI)
├── styles/                     # tokens.css (Design system) & index.css (Tailwind)
├── types/                      # Complete TypeScript contracts
└── utils/                      # Pricing engine, search algorithms, filters, formatting
```

---

## 🔐 Demo Credentials

To experience full account features without entering real phone numbers:
- Navigate to `/login`
- Click **"Instant Demo Login (Rahul Sharma)"**
- Pre-loaded with:
  - Saved Indiranagar Bangalore address
  - ₹750 StyleBazaar Wallet balance
  - 1,450 Insider Points (Gold Member)
  - 3 realistic demo orders (Delivered with Blue Dart, In Transit with Delhivery, Placed)

---

## 🖥️ Phase 5: Real Backend (Node.js + Express + PostgreSQL)

The backend lives in the `server/` folder and runs alongside the frontend.

### Prerequisites

- **Node.js 20+**
- **Docker Desktop** (for local Postgres) — or a Postgres instance at `localhost:5432`

### Local Setup

```bash
# 1. Install frontend deps (from repo root)
npm install

# 2. Install backend deps
cd server && npm install

# 3. Copy env file and fill in secrets
cp .env.example .env
# Edit server/.env — at minimum set DATABASE_URL and JWT_SECRET

# 4. Start Postgres (Docker)
docker compose up -d   # from server/ directory

# 5. Run migrations and seed
npx prisma migrate dev --name init
npx prisma db seed

# 6. Start the API server (port 4000)
npm run dev

# 7. Start the frontend (separate terminal, from repo root)
cd ..
npm run dev
```

The frontend defaults to **mock mode** (`VITE_USE_MOCK=true`).
To use the real backend, set in `.env.local` at the repo root:

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:4000/api
```

### Key Environment Variables (server/.env)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | — | Secret for signing refresh tokens |
| `PORT` | `4000` | API server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend origin for CORS |
| `AUTH_PHONE_OTP_ENABLED` | `false` | Show phone OTP tab on /login |
| `ONLINE_PAYMENTS_ENABLED` | `false` | Enable UPI/Card/Netbanking/Razorpay |
| `COD_MAX_ORDER_VALUE_PAISE` | `500000` | Max COD order value (500000 = Rs.5000) |
| `COD_FEE_PAISE` | `5000` | COD handling fee (5000 = Rs.50) |

### Feature Flags

Flags are served from `GET /api/config` and consumed by the frontend via `useConfig()`.

| Flag | When false |
|---|---|
| `AUTH_PHONE_OTP_ENABLED` | Phone OTP tab hidden on /login |
| `ONLINE_PAYMENTS_ENABLED` | UPI/Card/Netbanking tabs greyed out with "Coming Soon"; COD is the only active method; Buy Gift Card section hidden |

### In-Memory Fallback

When Postgres is unreachable, the server auto-falls back to a fully-seeded in-memory store.
All API endpoints and tests work without a database.

### Running Tests

```bash
cd server
npm test   # 51 Vitest integration tests across 4 test suites (no DB required)
```

---

## 🔌 Adding a Payment Gateway Later

1. Implement `PaymentProvider` in `server/src/providers/payment/<name>.provider.ts`
2. Swap `CodProvider` for it in `order.service.ts` when `ONLINE_PAYMENTS_ENABLED=true`
3. Set `ONLINE_PAYMENTS_ENABLED=true` in `.env`
4. Set `VITE_RAZORPAY_KEY_ID=rzp_test_...` in `.env.local`

The frontend automatically enables all payment tabs and the Buy Gift Card section — no UI changes needed.

---

## 📱 Adding an SMS Provider Later

1. Implement `SmsProvider` in `server/src/providers/sms/<name>.provider.ts`
2. Replace `DevSmsProvider` in auth service with the real provider
3. Set `AUTH_PHONE_OTP_ENABLED=true` in `.env`

The Phone OTP tab automatically appears on `/login`.
The `DevSmsProvider` logs OTPs to the console for local testing with no code changes.
