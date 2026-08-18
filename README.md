# SB Stocks 📈

A full-stack **paper trading** platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Users practice buying and selling US stocks with **virtual money** — no financial risk — while tracking portfolio performance with interactive charts.

## ✨ Features

- 🔐 **Secure authentication** — JWT-based login/registration, bcrypt-hashed passwords, role-based access (`user` / `admin`)
- 💵 **Virtual trading** — each new user starts with **$100,000** in play money
- 📊 **Markets** — browse/search 40+ popular US stock listings with sector filters, sorting and pagination
- 📈 **Charts** — price history and account performance visualizations via Chart.js
- 💼 **Portfolio** — live valuation, cost basis, unrealized gain/loss, performance curve
- ⭐ **Watchlist** — follow stocks and trade them in one click
- 🧑‍💼 **Admin panel** — create, edit price, and deactivate stock listings
- 📱 **Responsive UI** — dark trading theme, works on desktop and mobile

## 🧱 Tech Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React 18, Vite, Redux Toolkit, React Router, Chart.js, Toastify   |
| Backend   | Node.js, Express.js, Mongoose (ODM)                               |
| Database  | MongoDB                                                           |
| Auth      | JSON Web Tokens, bcryptjs                                         |

## 📁 Project Structure

```
stock-trading-app/
├── server/                    # Express + MongoDB backend
│   ├── config/db.js           # MongoDB connection
│   ├── models/                # User, Stock, Portfolio, Transaction, Watchlist
│   ├── controllers/           # Business logic per resource
│   ├── routes/                # API route definitions
│   ├── middleware/            # JWT auth, admin guard, error handler
│   ├── seed/seedStocks.js     # Seeds 40+ stocks with 90-day price history
│   ├── server.js              # Server entry point
│   └── .env.example           # Environment template
└── client/                    # React + Vite frontend
    └── src/
        ├── api/client.js      # Axios instance (JWT interceptor)
        ├── redux/             # Redux store + slices (auth, stocks, portfolio…)
        ├── components/        # Navbar, StockTable, TradeModal, PriceChart…
        └── pages/             # Home, Login, Register, Dashboard, Markets…
```

## 🚀 Getting Started

### Prerequisites

- Node.js **v16+** (tested on v24)
- npm **v8+**
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Backend

```bash
cd server
cp .env.example .env        # edit values as needed
npm install
npm run seed                # populate stocks (optional but recommended)
npm run dev                 # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts on http://localhost:5173
```

Open **http://localhost:5173** — the Vite dev server proxies `/api` to the backend, so no extra CORS config is needed.

### Default accounts

| Role  | Email                  | Password   |
| ----- | ---------------------- | ---------- |
| Admin | `admin@sbstocks.com`   | `admin123` |

The admin account is created automatically on server start. Regular users register from the UI (they receive $100,000 virtual cash).

## 🔌 API Overview

| Method | Endpoint                 | Access  | Description                       |
| ------ | ------------------------ | ------- | --------------------------------- |
| POST   | `/api/auth/register`     | Public  | Create account (returns JWT)      |
| POST   | `/api/auth/login`        | Public  | Log in (returns JWT)              |
| GET    | `/api/auth/me`           | Private | Current user                      |
| GET    | `/api/stocks`            | Public  | List stocks (search/filter/sort)  |
| GET    | `/api/stocks/:id`        | Public  | Single stock (id or symbol)       |
| GET    | `/api/stocks/meta/movers`| Public  | Top gainers / losers / active     |
| POST   | `/api/stocks`            | Admin   | Create stock                      |
| PUT    | `/api/stocks/:id`        | Admin   | Update stock (price → change)     |
| DELETE | `/api/stocks/:id`        | Admin   | Deactivate stock                  |
| POST   | `/api/transactions/buy`  | Private | Buy shares (atomic)               |
| POST   | `/api/transactions/sell` | Private | Sell shares (atomic)              |
| GET    | `/api/transactions`      | Private | Transaction history               |
| GET    | `/api/portfolio`         | Private | Holdings + valuation summary      |
| GET    | `/api/portfolio/performance` | Private | Daily account value series    |
| GET    | `/api/watchlist`         | Private | User watchlist                    |
| POST   | `/api/watchlist/:stockId`| Private | Add to watchlist                  |
| DELETE | `/api/watchlist/:stockId`| Private | Remove from watchlist             |

All private routes require `Authorization: Bearer <token>`.

## 🧪 Testing with Postman

1. `POST /api/auth/register` or `/login` → copy the `token` from the response.
2. Add header `Authorization: Bearer <token>` to protected requests.
3. Try buying: `POST /api/transactions/buy` with `{ "stockId": "<id>", "shares": 10 }`.
4. Verify the portfolio: `GET /api/portfolio`.

## 📝 Notes

- Stock prices are **illustrative seed data** (plausible, not live quotes) so the app runs fully offline. To use real-time data, point the `Stock` model updates at an API like Alpha Vantage / Finnhub / Polygon.
- Trades validate before any write and update cash → holdings → history in order, so they stay consistent on a **standalone MongoDB** (no replica set required).
- Sensitive values live in `server/.env` — never commit real secrets.
