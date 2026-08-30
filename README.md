# StockFlow – Flash-Sale Inventory Platform

A full-stack flash-sale system built after personally hitting three real bugs during a live e-commerce sale: false rate-limit rejections, overselling, and hanging checkouts. StockFlow solves all three using atomic Redis operations, TTL-based reservations, and a fair waiting-room queue — verified under real concurrent load with k6.

**Live Demo:** https://stock-flow-nu-nine.vercel.app
**Stack:** React (Vite), Node.js/Express, MongoDB, Redis, Socket.IO, k6

---

## Demo Video

https://github.com/user-attachments/assets/eda144e3-8a13-4fb2-a801-e13c7beb69cc



## The Problem → The Fix

| Bug experienced | Root cause | Fix |
|---|---|---|
| "Please try again" rate limit | No queue, just outright rejection | Redis-backed waiting room (Set + Sorted Set) with live position updates |
| Added to cart, then "out of stock" | Race condition — check and decrement stock were separate steps | Atomic Lua script — check + decrement run as one indivisible Redis operation |
| Checkout hung | DB overwhelmed by simultaneous writes | Redis holds real-time state (stock, reservations); MongoDB only written to on final checkout |

---

## How It Works

- **Stock control:** A Lua script (`atomicStockDecrement.lua`) checks and decrements stock as a single atomic operation via Redis `EVAL`, eliminating the check-then-update race condition.
- **Reservations:** A successful buy creates a 5-minute Redis reservation (`SET ... EX`). A background worker polls a sorted set of expiry timestamps every second, auto-releasing abandoned reservations and restoring stock.
- **Waiting room:** Buyers over capacity join a Sorted Set queue, ordered by arrival time. A second Lua script atomically promotes the next buyer whenever a slot frees up.
- **Real-time updates:** Socket.IO pushes stock/queue/promotion updates to buyers instantly, using per-buyer rooms and Redis pub/sub.

## Request Flow

`GET /stock` (reads Redis) → `POST /buy` (atomic reserve) → `POST /checkout` (consumes reservation, writes permanent order to MongoDB, releases slot, promotes next buyer)

---

## Load Testing

Simulated with k6: 100 virtual users, 300 total buy attempts, 50-unit capacity — full buy → wait → checkout lifecycle, not just a single burst.

**Result:** 0% request failures, exactly 50 successful purchases (zero overselling), p95 response time under ~900ms under load.

---

## Deployment

Backend + Redis on Render, frontend on Vercel, MongoDB on Atlas. Cross-origin setup required `SameSite=None; Secure` cookies and explicit CORS config for the buyer-identity cookie to survive requests between the two domains.
