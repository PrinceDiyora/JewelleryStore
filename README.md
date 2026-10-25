# Aurelia Jewellers — MERN E-Commerce Store

> A full-stack jewellery e-commerce platform with dynamic, real-time metal pricing and a comprehensive admin management panel.

---

## 📌 Executive Summary

Unlike standard e-commerce stores where product prices are static, **Aurelia Jewellers never stores hard-coded prices**. Because gold and silver market rates fluctuate daily, product prices are calculated dynamically on every request:

$$\text{Price} = (\text{Daily Metal Rate} \times \text{Weight}) + \text{Making Charges} + \text{Stone Charges} + \text{GST}$$

When an admin updates daily metal rates (Gold 22K, Gold 18K, Silver 925), all catalog prices, carts, and wishlists update instantaneously across the platform.

---

## ⚡ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), Tailwind CSS, React Router 6, Axios |
| **Backend** | Node.js, Express.js, JWT Authentication, Multer |
| **Database** | MongoDB (Mongoose ORM) |
| **Storage & Media** | Cloudinary (Multi-image product upload) |
| **Payment Gateway** | Razorpay (Ready) & Cash on Delivery |
| **Deployment** | Vercel (Frontend) & Render (Backend) |

---

## 🚀 Key Features

### 🛍️ Customer Storefront
- **Dynamic Price Breakdown**: Transparent breakdown per product (metal rate × weight, making charges, stones, and GST).
- **Live Metal Rate Board**: Real-time header ticker showing today's Gold & Silver rates per gram.
- **Catalog & Discovery**: Search, pagination, and multi-faceted filtering (metal type, purity, category, collection, price range).
- **Cart & Wishlist**: Real-time server-side recalculated totals with promotional coupon support (`WELCOME10`, `FLAT500`).
- **Checkout & Tracking**: Multi-step checkout with address validation, Cash on Delivery, and live order status tracking.

### 🛡️ Admin Management Panel (`/admin`)
- **Metal Rate Manager**: Update Gold 22K/18K and Silver rates globally in a single click.
- **Catalog Management**: Add/edit/delete products with multi-image Cloudinary upload, weight, purity, and making charges (fixed or %).
- **Order Lifecycle**: Review full price snapshots and update order statuses (`Placed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered` / `Cancelled`).
- **CMS & Promotions**: Manage banners, categories, collections, and discount coupons.
- **Store Configuration**: Live control over store details, GST percentage, and low-stock alerts.

---

## 📁 Project Architecture

```
jewellery-store/
├── client/                 # React (Vite) Frontend
│   ├── src/admin/          # Config-driven admin dashboards & CRUD views
│   ├── src/components/     # UI components (Header, RateBoard, Cards)
│   ├── src/context/        # Auth & Store global states
│   ├── src/pages/          # Customer storefront pages
│   └── vercel.json         # SPA routing rewrites for Vercel
├── server/                 # Express.js REST API
│   ├── config/             # DB & Cloudinary configs
│   ├── controllers/        # Order, product, and admin logic
│   ├── middleware/         # JWT auth, error handlers, upload
│   ├── models/             # Mongoose schemas (Products, Rates, Orders, etc.)
│   ├── routes/             # REST endpoints (auth, public, admin, orders)
│   └── utils/              # Dynamic pricing engine (pricing.js), coupons, payments
└── README.md
```

---

## 💻 Quick Start (Local Setup)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a free MongoDB Atlas connection string

### 2. Backend Setup
```bash
cd server
cp .env.example .env     # Configure MONGO_URI and JWT_SECRET
npm install
npm run seed             # Seeds database with demo products, rates & accounts
npm run dev              # Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev              # Runs on http://localhost:5173 (auto-proxies /api to 5000)
```

---

## 🔑 Demo & Test Credentials

| Role | Email | Password | URL |
|---|---|---|---|
| **Admin** | `admin@jewels.com` | `Admin@123` | `/admin/login` |
| **Customer** | `customer@example.com` | `Customer@123` | `/login` |

*Sample Coupons*: `WELCOME10` (10% off, min ₹5,000) & `FLAT500` (₹500 off, min ₹10,000).

---

## 🌐 Production Deployment Summary

- **Backend (Render)**:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Key Env Vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`
- **Frontend (Vercel)**:
  - Root Directory: `client`
  - Framework Preset: `Vite`
  - Key Env Vars: `VITE_API_URL=https://<your-render-url>/api`

---

## 🔌 API Overview

| Scope | Prefix | Highlights |
|---|---|---|
| **Public** | `/api` | `/home`, `/products`, `/categories`, `/rates`, `/settings` |
| **Auth** | `/api/auth` | `/register`, `/login`, `/me`, `/password` |
| **Customer** | `/api` | `/cart` (+ coupons), `/wishlist`, `/orders` (+ cancel) |
| **Admin** | `/api/admin` | Full CRUD for products, orders, rates, banners, coupons |

---

## 📄 License
ISC © 2026 Aurelia Jewellers.
