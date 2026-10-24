# Aurelia Jewellers: MERN jewellery store with an admin panel

A jewellery e-commerce site where **nothing is hard-coded**. Products, prices, banners, categories,
collections, coupons, GST and store details are all controlled from the admin panel. Gold and silver
prices change daily, so a product's price is **never stored**. It is calculated on every request:

```
price = (today's metal rate x weight) + making charges (+ stone charges) + GST
```

When the admin saves new rates, every product price, cart and listing updates immediately.

**Stack:** MongoDB, Express, React (Vite), Node, Tailwind CSS, JWT auth, bcrypt, Multer.

---

## Features

### Customer website
- Home: rotating banners, categories (Rings, Necklaces, Earrings, Bangles), featured jewellery, collections (all from the DB)
- Live rate board in the header (today's gold and silver rate per gram)
- Product listing: search, filter by category / collection / metal / purity / price, sorting, pagination
- Product page: images, weight, purity, stock status, full **price breakup** (rate x weight, making, stone, GST, final price)
- Register, login, profile (hashed passwords, JWT)
- Cart (add, remove, change quantity, live total) and wishlist
- Coupons, checkout with address and Cash on Delivery, My orders with status tracking, cancel while "Placed"

### Admin panel (`/admin`)
- Secure admin login. Normal users are redirected, and the API returns 403 for every `/api/admin/*` call
- Dashboard: total orders, revenue, customers, low-stock products, recent orders, today's rates
- Products: add / edit / delete, multiple image upload, weight, purity, making charges (fixed or %), stone charges, stock, featured and visibility toggles
- **Daily metal rates**: update gold 22K, gold 18K and silver per gram in one save
- Categories, collections, banners, coupons: add / edit / delete
- Orders: full details with price breakup, change status (Placed, Packed, Shipped, Delivered, plus Cancelled, which returns stock)
- Settings: GST %, store name, contact details, low-stock threshold

---

## Run locally

Requirements: Node 18+, MongoDB running locally or a free MongoDB Atlas cluster.

```bash
# 1. Backend
cd server
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed                # demo data + test logins (wipes the collections it fills)
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

In development Vite proxies `/api` and `/uploads` to port 5000, so no frontend `.env` is needed.

### Test logins (created by `npm run seed`)

| Role     | Email                  | Password       | Where            |
|----------|------------------------|----------------|------------------|
| Admin    | admin@jewels.com       | Admin@123      | /admin/login     |
| Customer | customer@example.com   | Customer@123   | /login           |

Coupons to try: `WELCOME10` (10% off, min Rs 5,000, max Rs 3,000) and `FLAT500` (Rs 500 off, min Rs 10,000).

### Quick demo of "admin controls the site"
1. Open a product page and note its price.
2. Log in at `/admin/login` and go to **Daily metal rates**. Change the gold 22K rate and save.
3. Refresh the product page. The price, the rate board and any cart total have changed.
4. Edit the product's weight or making charges, or change GST in **Settings**. Prices follow.
5. Add a banner or a category and it appears on the home page right away.

---

## Screenshots

Add your screenshots to a `screenshots/` folder and link them here:

- Home page: `screenshots/home.png`
- Product page with price breakup: `screenshots/product.png`
- Admin dashboard: `screenshots/admin-dashboard.png`
- Daily metal rates: `screenshots/admin-rates.png`

---

## Project structure

```
server/
  app.js, server.js, seed.js
  models/       User, Product, Category, Collection, Banner, MetalRate, Coupon, Order, Settings
  routes/       auth, public (catalogue), cart, wishlist, orders, admin
  middleware/   auth (protect, adminOnly), upload (multer), error
  utils/        pricing.js (the price formula), coupons.js, payment.js, storage.js, helpers.js
client/
  src/pages/      customer pages
  src/admin/      admin panel (CrudPage is a config-driven list + form used by most admin screens)
  src/context/    Auth and Shop (settings, rates, cart, wishlist) state
```

## Key design decisions
- **No stored prices.** `utils/pricing.js` is the single source of truth. Listing, product page, cart, wishlist, admin product table and order placement all use it.
- **Orders keep a price snapshot** (rate, making, GST per item), so changing rates later never alters old orders. The server re-prices the cart when an order is placed. The client is never trusted for totals.
- **Diamond products** are priced on the gold rate for their purity plus a fixed stone charge. **Silver** is always 925 and uses the silver rate.
- **Price filter and sort** run after pricing, because price depends on today's rate. This is fine for a small catalogue. See "Next steps" for scaling.
- **Stock** is reduced atomically when an order is placed and restored on cancellation.

---

## Deployment

1. **Database:** create a free MongoDB Atlas cluster, allow network access, copy the connection string.
2. **Seed once:** from `server/`, put the Atlas URI in `.env` and run `npm run seed`. Afterwards change the admin password.
3. **Backend (Render / Railway):** root directory `server`, build `npm install`, start `npm start`.
   Environment variables: `MONGO_URI`, `JWT_SECRET` (a long random string), `CLIENT_URL` (your frontend URL, comma-separated if more than one).
4. **Frontend (Vercel / Netlify):** root directory `client`, build `npm run build`, output `dist`.
   Environment variable: `VITE_API_URL=https://YOUR-BACKEND-URL/api`.
   SPA rewrites are already included (`vercel.json`, `public/_redirects`).

> **Image storage on a live server.** Images are saved to `server/uploads`. Free hosts such as Render and
> Railway use a temporary disk, so uploaded images disappear on redeploy or restart. Options:
> (a) attach a persistent disk / volume and mount it at `server/uploads`,
> (b) deploy on a VPS, or
> (c) switch to Cloudinary. Only `server/utils/storage.js` and `server/middleware/upload.js` need to change.
> The database stores image URLs, and the client already accepts full `https://` URLs.

## Payment gateway (not included, but ready)
Only Cash on Delivery is enabled. Orders already store `paymentMethod`, `paymentStatus` and `paymentInfo`,
and checkout renders whatever `GET /api/payment-methods` returns. To add Razorpay, register it in
`server/utils/payment.js` (create the gateway order in `prepare()`), add a verify route that sets
`paymentStatus = 'Paid'`, and open the gateway from the checkout page.

## API overview

| Area      | Endpoints |
|-----------|-----------|
| Public    | `GET /api/home`, `/products` (search, category, collection, metal, purity, minPrice, maxPrice, sort, page), `/products/:id`, `/categories`, `/collections`, `/rates`, `/settings`, `/payment-methods` |
| Auth      | `POST /api/auth/register`, `/login`, `GET/PUT /api/auth/me`, `PUT /api/auth/password` |
| Customer  | `/api/cart` (+ `POST /cart/coupon`), `/api/wishlist`, `/api/orders` (+ `PUT /orders/:id/cancel`) |
| Admin     | `/api/admin/` products, categories, collections, banners, coupons, rates, orders (+ status), dashboard, settings, upload |

## Environment files
`server/.env.example` and `client/.env.example` are committed. Real `.env` files are git-ignored.

## Next steps / known MVP limits
- Admin lists load all rows (no server-side pagination yet).
- Listing price filter/sort is done in memory after pricing. For a large catalogue, cache the rates and use an aggregation pipeline.
- No email notifications, password reset, or ring-size selection yet.
- Add automated tests (the pricing util in `server/utils/pricing.js` is a good first target).
- Add rate limiting and `helmet` before going to production.
