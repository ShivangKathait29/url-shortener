# 🚀 Scalable URL Shortener

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-Backend-black.svg?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Queue-red.svg?logo=redis)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-yellow.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)

A high-performance, distributed URL shortener service built for scale. It features robust caching, asynchronous analytics tracking, atomic counters, and bulk URL processing. Designed with production-ready patterns to ensure low-latency redirects under high concurrency.

---

## ✨ Features

- **Base62 URL Encoding**: Compresses long URLs into ultra-compact, collision-free 7-character aliases.
- **Distributed Atomic Counter**: Utilizes Redis `INCR` to safely generate sequential IDs at scale without database locking bottlenecks.
- **Read-Through Caching**: Accelerates redirect operations by caching frequent URLs in Redis, minimizing database read loads.
- **Asynchronous Analytics Pipeline**: Employs BullMQ and background workers to handle analytics tracking (GeoIP, Device/Browser parsing) without blocking the main API thread.
- **High-Throughput Bulk Shortening**: Processes multiple URL generation requests efficiently using asynchronous `Promise.allSettled()`.
- **Advanced URL Lifecycle Management**: Supports expiring URLs with graceful `410 Gone` eviction and automatic cache invalidation.
- **Secure Authentication**: Built-in user authentication using JWT and scrypt-hashed passwords.

---

## 🏗️ Architecture

This project uses a highly scalable layered architecture to ensure lightning-fast read operations (redirects) and asynchronous handling of write operations (analytics).

```text
       [ Client ]
           │
     (HTTP Requests)
           ▼
    ┌─────────────┐       (Cache Hit / Atomic Counter)      ┌───────────┐
    │             │ ──────────────────────────────────────▶ │           │
    │ Express API │                                         │   Redis   │
    │             │ ◀────────────────────────────────────── │           │
    └─────────────┘                                         └───────────┘
           │   │                                                  ▲
   (DB Ops)│   │(Enqueue Click)                                   │ (Message Queue)
           ▼   ▼                                                  ▼
   ┌─────────────┐                                          ┌───────────┐
   │             │                                          │           │
   │ PostgreSQL  │ ◀─────────────────────────────────────── │ BullMQ    │
   │             │    (Async Batch Insert/Update)           │ Worker    │
   └─────────────┘                                          └───────────┘
```

---

## 🛠️ Tech Stack

- **Backend Framework:** Node.js, Express.js
- **Database:** PostgreSQL (via Drizzle ORM)
- **Cache & Message Broker:** Redis (ioredis), BullMQ
- **Analytics & Parsing:** geoip-lite, express-useragent
- **Validation:** Zod
- **Security:** jsonwebtoken (JWT), Node.js native `crypto` module
- **Containerization:** Docker Compose
- **Benchmarking:** Autocannon

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & Docker Compose

### 2. Clone & Install
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/url_shortener
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
PORT=8000
```

### 4. Boot Services & Database
Spin up PostgreSQL and Redis using Docker Compose, then push the database schema:
```bash
docker compose up -d
pnpm db:push
```

### 5. Run the Application
The architecture consists of the main API server and an asynchronous background worker.

**Terminal 1 (API Server):**
```bash
pnpm dev
```

**Terminal 2 (Analytics Worker):**
```bash
pnpm worker
```

---

## 📊 Performance Benchmarking

Optimized for speed, the redirect mechanism typically achieves sub-5ms latency by heavily leveraging Redis read-through caching. You can test performance locally using the built-in autocannon benchmark script:

```bash
pnpm bench <shortCode>
```

*Expected Localhost Results (50 connections, 10s duration):*
- **Requests/sec:** ~8,500+ (on Cache hit)
- **Latency:** Average <5ms
- **Throughput:** ~25 MB/sec

*(Note: Actual benchmark results will vary based on your local machine's specs).*

## API Endpoints

### Shorten URL (Single)
`POST /shorten`
```json
{
  "url": "https://example.com/very-long-url",
  "code": "custom-alias" // optional
}
```

### Shorten URL (Bulk)
`POST /shorten/bulk`
```json
{
  "urls": [
    { "url": "https://example.com/1", "expiresIn": 24 },
    { "url": "https://example.com/2" }
  ]
}
```

### Get Analytics
`GET /analytics/:code`
Returns total click count and the last 50 clicks (including IP geo-location, device, and OS data).

### Redirect URL
`GET /:shortCode`
Redirects the user to the original target URL. If the URL has expired, it returns a `410 Gone` status and invalidates the cache.

### Other Endpoints
- `GET /`: Health check endpoint to verify server status
- `GET /codes`: List all URLs for the authenticated user
- `DELETE /:id`: Delete a URL by its ID
- `POST /user/signup`: Create a new user account
- `POST /user/login`: Retrieve a JWT token

## Database Schema Highlights
- **Users**: Authentication and identity (scrypt hashed passwords).
- **URLs**: Target mappings, click counts, Base62 code, and `expiresAt` for lifecycle management.
- **ClickEvents**: High-throughput table for analytics (IP, country, city, user-agent details).

## License

ISC
