# StockFlow – Flash-Sale Inventory Platform

A full-stack, real-time flash-sale system built to solve three real bugs experienced during a live e-commerce ₹1 sale: false rate-limit rejections, overselling due to race conditions, and hanging checkouts. StockFlow provably eliminates all three using atomic Redis operations, a TTL-based reservation system, and a fair waiting-room queue — verified under real concurrent load with k6.

**Live Demo:** https://stock-flow-nu-nine.vercel.app
**Backend:** https://stockflow-q733.onrender.com

---

## The Problem

During a real flash sale, three things broke:

1. **"A little too much love, please try again"** — a blunt rate limit with no path forward for buyers who arrived during a traffic spike.
2. **Added to cart, then "out of stock" at checkout** — a classic race condition: two buyers both saw stock as available, both proceeded, and the system oversold.
3. **Checkout hung/froze** — the database, used as the real-time source of truth, couldn't keep up with simultaneous write load.

StockFlow was built specifically to solve all three, using Redis as a fast, in-memory concurrency-control layer sitting in front of MongoDB's durable, permanent storage.

---

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, Socket.IO client, React Router
**Backend:** Node.js, Express
**Databases:** MongoDB (permanent records — products, orders, users), Redis (real-time state — stock, reservations, queue)
**Real-time:** Socket.IO, Redis pub/sub
**Load testing:** k6
**Deployment:** Render (backend + Redis), Vercel (frontend), MongoDB Atlas

---

## Architecture Overview

Redis and MongoDB serve different purposes by design:

- **MongoDB** is disk-backed and durable — it's the permanent record of products, orders, and users. Data here must never disappear.
- **Redis** lives in RAM — extremely fast, but only used for the real-time, high-churn state during an active sale: current stock count, who's actively buying, who's waiting in line, and temporary reservations.

Redis also processes commands single-threaded, meaning two operations can never truly execute at the same instant — this is the core mechanism that makes atomic stock control possible.

---

## How Each Original Bug Was Solved

### 1. Overselling → Atomic stock decrement (Redis + Lua)

A single Redis command is atomic, but a real "buy" involves multiple steps (check stock, decrement, create reservation, log stats). Running these as separate commands from Node would reopen the same race condition. Instead, the entire sequence is written as a **Lua script** (`atomicStockDecrement.lua`) and executed via Redis's `EVAL`, so Redis runs the whole multi-step operation as a single, indivisible unit — no other request can interleave in the middle.

```
Check stock → SOLD_OUT if insufficient → decrement → create reservation → done
```
All in one atomic block. Verified with k6: 300 concurrent buy attempts against 50 units of capacity resulted in exactly 50 successes and zero oversells.

### 2. False "add to cart" / hanging checkout → Reservation system with TTL

A successful buy doesn't finalize a purchase — it creates a temporary **reservation** (`SET key value EX ttl`) using Redis's native key expiry, holding the item for 5 minutes. Checkout atomically consumes this reservation via a second Lua script (`consumeReservation.lua`). If checkout never happens, Redis expires the key automatically — but restoring stock and freeing the buyer's slot requires more than passive expiry, so a **second structure**, a sorted set scored by expiration timestamp, lets a background worker (`reservationExpiryWorker.js`) poll every second for anything that's expired and clean it up: restore stock, release the buyer's slot, promote the next person waiting.

### 3. False rate-limit rejection → Waiting room queue

Instead of rejecting excess traffic, buyers beyond capacity are placed into an ordered line:

- **Active buyers** — a Redis Set, capped at a configured capacity
- **Waiting buyers** — a Redis Sorted Set, scored by microsecond-precision arrival time

`trafficGate.lua` handles entry (admit if room, otherwise queue). `promoteBuyer.lua` handles advancement — atomically pulling the next waiting buyer into the active set whenever a slot frees up, looped until capacity is full or the queue is empty.

---

## Real-Time Updates

Every browser holds a Socket.IO connection, joined to a private room keyed by their `clientId` cookie (`buyer:<clientId>`) on connect. Stock changes broadcast to everyone watching a product (`product:<id>` room); queue position and promotion events go only to the specific buyer's private room. Promotion events are routed through **Redis pub/sub** (`publishPromotion` / `subscribeToPromotions`) rather than emitted directly, decoupling "something happened" from "push the notification" — important for supporting multiple server instances in the future.

---

## Request Lifecycle (One Buyer's Journey)

1. `GET /flashsale/:id/stock` — reads live stock directly from Redis (not MongoDB), the real-time source of truth during a sale.
2. `POST /flashsale/:id/buy` — passes through `clientIdMiddleware` → `flashSaleGate` (traffic gate) → atomic Lua purchase attempt. Returns either a reservation + TTL, `SOLD_OUT`, or a waiting-room position.
3. `POST /flashsale/:id/checkout` — atomically consumes the reservation, writes a permanent `Order` to MongoDB, updates the product's stock record, and releases the buyer's active slot — triggering the next waiting buyer's promotion.
4. If checkout never happens, the reservation expiry worker performs the same release/promote automatically once the TTL lapses.

---

## Deployment Notes

- Backend and Redis run on **Render**; frontend runs on **Vercel** — different origins, which required explicit CORS configuration and `SameSite=None; Secure` cookies for the buyer-identity cookie to survive cross-site requests.
- Environment variables (`REDIS_URL`, `MONGODB_URI`, `VITE_API_URL`) allow the same codebase to run against `localhost` in development and real deployed services in production, with no hardcoded URLs.
- MongoDB Atlas requires IP allowlisting for the Render backend to connect.

---

## Load Testing

Verified end-to-end correctness and performance using **k6**, simulating realistic buyer behavior — not a single burst, but the full lifecycle: attempt to buy, poll while waiting, and complete checkout on success.

**Result (500 virtual users, 1000 total attempts, capacity of 100):**
- 100% of requests received a valid response, 0% failure rate
- Exactly 100 successful purchases — zero overselling
- p95 response time under ~900ms under full concurrent load

---

## Admin / Ops Features

- Product CRUD extended with flash-sale scheduling fields (`isFlashSale`, `saleStartTime`, `saleEndTime`, `saleStock`)
- A scheduler (`flashSaleScheduler.js`) automatically seeds Redis with allocated stock when a scheduled sale goes live
- Live Ops Dashboard: real-time requests/sec, stock depletion, queue length, active reservations, and an oversell-attempts-blocked counter (which should always read the count of blocked attempts, never a false positive)

---

## Origin

This project began as a generic real-time inventory dashboard ("StockFlow") before being reshaped around a real problem the author personally encountered during a live flash sale. The admin/inventory side of the original build was retained; the user-facing side was rebuilt entirely around solving the three specific failure modes described above.
