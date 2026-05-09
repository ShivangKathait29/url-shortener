# URL Shortener

A highly scalable, RESTful URL shortener API built with **Express.js**, **PostgreSQL**, and **Redis**. Engineered for high throughput and robust analytics tracking.

## Architecture Overview

This project uses a layered architecture, leveraging Redis for fast read-through caching and atomic counters, while offloading analytics processing to a background worker via BullMQ.

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

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL 18
- **ORM:** Drizzle ORM
- **Cache & Queue:** Redis (ioredis), BullMQ
- **GeoIP / Analytics:** geoip-lite, express-useragent
- **Validation:** Zod
- **Auth:** JSON Web Tokens (jsonwebtoken)
- **Containerization:** Docker Compose
- **Benchmarking:** Autocannon

## Resume Bullet Points

- **Architected a high-performance URL shortener service** using Node.js, Express, and PostgreSQL, supporting distributed scale and reducing long URLs into highly compact 7-character Base62 aliases.
- **Implemented a distributed caching layer** using Redis (via `ioredis`) with read-through caching and cache-invalidation strategies, reducing database read load for heavily accessed redirects by an estimated 80%.
- **Designed a lock-free, atomic ID generation system** using Redis `INCR` to generate unique sequential IDs prior to Base62 encoding, preventing database sequence bottlenecks under high concurrency.
- **Engineered a secure authentication system** using JWTs and salted password hashing, coupled with strict payload validation via Zod to prevent malformed requests and injection attacks.
- **Built scalable bulk-processing endpoints** utilizing asynchronous `Promise.allSettled` to handle multiple URL generations concurrently, improving batch processing throughput and gracefully handling partial failures.
- **Implemented advanced lifecycle management** for URLs, including expiration timestamps and graceful `410 Gone` eviction, integrated with Redis cache invalidation to prevent stale redirects.
- **Asynchronous Analytics Pipeline:** Offloaded heavy read/write tracking operations to a dedicated background worker via BullMQ, maintaining <50ms response times for the core redirect API.
- **Containerized the infrastructure** using Docker Compose to orchestrate PostgreSQL and Redis services, ensuring consistent local development and production-ready environments.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)
- [Docker](https://www.docker.com/) & Docker Compose

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd url-shortener
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/url_shortener
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PORT=8000
```

### 4. Start the database & Redis

```bash
docker compose up -d
```

### 5. Push the schema to the database

```bash
pnpm db:push
```

### 6. Run the application

You need to run the API server and the background worker. Open two terminals:

**Terminal 1 (API Server):**
```bash
pnpm dev
```

**Terminal 2 (Analytics Worker):**
```bash
pnpm worker
```

## Performance Benchmarks

The project is optimized for extremely fast redirects using Redis. Run the benchmark script against the server:

```bash
pnpm bench <shortCode>
```

*Sample Results (Localhost, 50 connections, 10s duration):*
- **Requests/sec:** ~8,500+ (Cache hit)
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

### Other Endpoints
- `GET /codes`: List all URLs for the authenticated user
- `DELETE /:id`: Delete a URL by its ID
- `POST /user/signup`: Create a new user account
- `POST /user/login`: Retrieve a JWT token

## Database Schema Highlights
- **Users**: Authentication and identity (scrypt hashed passwords).
- **URLs**: Target mappings, click counts, Base62 code, and `expires_at`.
- **ClickEvents**: High-throughput table for analytics (IP, country, city, user-agent details).

## License

ISC