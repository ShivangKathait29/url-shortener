# URL Shortener

A RESTful URL shortener API built with **Express.js**, **PostgreSQL**, and **Drizzle ORM**. Supports user authentication via JWT and secure password hashing with scrypt.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL 18
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Auth:** JSON Web Tokens (jsonwebtoken)
- **Password Hashing:** Node.js `crypto` (scrypt + random salt)
- **Containerization:** Docker Compose

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
JWT_SECRET=your-secret-key
PORT=8000
```

### 4. Start the database

```bash
docker compose up -d
```

### 5. Push the schema to the database

```bash
pnpm db:push
```

### 6. Run the development server

```bash
pnpm dev
```

The server starts on `http://localhost:8000` (or the port specified in `.env`).

## Available Scripts

| Script | Description |
| ------------- | ----------------------------------------- |
| `pnpm dev` | Start the server in watch mode |
| `pnpm db:push` | Push the Drizzle schema to the database |
| `pnpm db:studio` | Open Drizzle Studio to browse the database |

## API Endpoints

### Health Check

```
GET /
```

**Response** `200`

```json
{ "status": "Server is up and running..." }
```

---

### Sign Up

```
POST /user/signup
```

**Request Body**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Notes |
| ---------- | ------ | -------- | --------------------------------- |
| firstname | string | Yes | |
| lastname | string | No | |
| email | string | Yes | Must be a valid email |
| password | string | Yes | Minimum 8 characters |

**Response** `201`

```json
{ "data": { "userId": "uuid" } }
```

---

### Login

```
POST /user/login
```

**Request Body**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** `200`

```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

---

### Authenticated Requests

Include the JWT token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <token>
```

## Project Structure

```
├── index.js                   # Express app entry point
├── docker-compose.yml         # PostgreSQL container setup
├── drizzle.config.js          # Drizzle Kit configuration
├── package.json
├── db/
│   └── index.js               # Database connection
├── middlewares/
│   └── auth.middleware.js     # JWT authentication middleware
├── models/
│   ├── index.js               # Model exports
│   ├── user.model.js          # Users table schema
│   └── url.model.js           # URLs table schema
├── routes/
│   └── user.routes.js         # Signup & login routes
├── services/
│   └── user.service.js        # User query helpers
├── utils/
│   ├── hash.js                # Password hashing (scrypt)
│   └── token.js               # JWT creation & validation
└── validation/
    ├── request.validation.js  # Zod schemas for request bodies
    └── token.validation.js    # Zod schema for token payloads
```

## Database Schema

### Users

| Column | Type | Constraints |
| ---------- | ------------- | -------------------------------- |
| id | UUID | Primary key, auto-generated |
| firstname | VARCHAR(55) | Not null |
| lastname | VARCHAR(55) | Nullable |
| email | VARCHAR(255) | Not null, unique |
| password | TEXT | Not null (hashed) |
| salt | TEXT | Not null |
| created_at | TIMESTAMP | Not null, defaults to `now()` |
| updated_at | TIMESTAMP | Auto-updated on change |

### URLs

| Column | Type | Constraints |
| ---------- | ------------- | -------------------------------- |
| id | UUID | Primary key, auto-generated |
| code | VARCHAR(155) | Not null, unique |
| target_url | TEXT | Not null |
| user_id | UUID | Not null, FK → users.id |
| created_at | TIMESTAMP | Not null, defaults to `now()` |
| updated_at | TIMESTAMP | Auto-updated on change |

## License

ISC