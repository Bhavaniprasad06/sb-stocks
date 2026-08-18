# SB Stocks 📈

A full-stack **paper trading** platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Users practice buying and selling US stocks with **virtual money** — no financial risk — while tracking portfolio performance with interactive charts and real-time market data.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login/registration, bcrypt-hashed passwords, role-based access (`user` / `admin`)
- 💵 **Virtual Trading** — each new user starts with **$300,000** in virtual cash
- 📊 **Real-Time Market Data** — live US stock prices powered by Yahoo Finance, auto-updated every 5 minutes
- 📈 **Interactive Charts** — Chart.js price history with SMA 20/50 overlays, volume bars, and multiple timeframes (1D – ALL)
- 📰 **Market Overview Dashboard** — selectable stock tabs (AAPL, MSFT, NVDA, TSLA, AMZN, GOOGL, META) with live price graphs
- 💼 **Portfolio Management** — live valuation, cost basis, unrealized gain/loss, and performance tracking
- ⭐ **Watchlist** — follow stocks and trade them in one click
- 📜 **Transaction History** — full log of all buy/sell activities with filtering and search
- 🌗 **Dark / Light Themes** — persistent theme toggle with flash-prevention
- 🧑‍💼 **Admin Panel** — manage stocks, view user accounts, monitor transactions, and track platform stats
- 📱 **Responsive UI** — works seamlessly on desktop and mobile

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Redux Toolkit, React Router, Chart.js, React-Toastify |
| Backend | Node.js, Express.js, Mongoose (ODM) |
| Database | MongoDB |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Market Data | Yahoo Finance API, node-cron (auto-refresh) |

---

## 📁 Project Structure

```
sb-stocks/
├── server/                        # Express + MongoDB backend
│   ├── config/db.js               # MongoDB connection
│   ├── models/                    # User, Stock, Portfolio, Transaction, Watchlist
│   ├── controllers/               # Business logic (auth, stocks, trades, admin)
│   ├── routes/                    # REST API routes
│   ├── middleware/                 # JWT auth, admin guard, error handler
│   ├── services/marketService.js  # Yahoo Finance integration + cron scheduler
│   ├── seed/seedStocks.js         # Seeds 40+ US stocks with 90-day price history
│   ├── server.js                  # Server entry point
│   └── .env.example               # Environment template
│
└── client/                        # React + Vite frontend
    └── src/
        ├── api/client.js          # Axios instance with JWT interceptor
        ├── redux/                 # Redux store + slices (auth, stocks, portfolio…)
        ├── components/            # Navbar, StockTable, TradeModal, LivePriceChart…
        ├── pages/                 # Home, Login, Register, Dashboard, Markets…
        └── index.css              # Global styles + dark/light theme variables
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v16+**
- npm **v8+**
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Backend

```bash
cd server
cp .env.example .env          # edit values as needed
npm install
npm run seed                  # populate 40+ stocks with price history
npm run dev                   # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                   # starts on http://localhost:5174
```

Open **http://localhost:5174** — the Vite dev server proxies `/api` to the backend automatically.

### Default Accounts

The admin account is created automatically on server start using the credentials in your `.env` file. Regular users register from the UI and receive **$300,000** in virtual cash.

> **Note:** Change the admin credentials in `.env` before deploying to production.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create account (returns JWT) |
| POST | `/api/auth/login` | Public | Log in (returns JWT) |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update name / contact |

### Stocks

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/stocks` | Public | List stocks (search, filter, sort, pagination) |
| GET | `/api/stocks/:id` | Public | Single stock by ID or symbol |
| GET | `/api/stocks/:id/history` | Public | Price history with SMA 20/50 overlays |
| GET | `/api/stocks/live` | Public | Batch live prices for all stocks |
| GET | `/api/stocks/meta/movers` | Public | Top gainers, losers, most active |
| GET | `/api/stocks/meta/sectors` | Public | Available sector list |
| POST | `/api/stocks` | Admin | Create stock |
| PUT | `/api/stocks/:id` | Admin | Update stock |
| DELETE | `/api/stocks/:id` | Admin | Deactivate stock |

### Transactions

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/transactions/buy` | Private | Buy shares with virtual cash |
| POST | `/api/transactions/sell` | Private | Sell shares from portfolio |
| GET | `/api/transactions` | Private | Transaction history (paginated) |

### Portfolio

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/portfolio` | Private | Holdings + live valuation summary |
| GET | `/api/portfolio/performance` | Private | Daily account value time series |

### Watchlist

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/watchlist` | Private | User watchlist |
| POST | `/api/watchlist/:stockId` | Private | Add stock to watchlist |
| DELETE | `/api/watchlist/:stockId` | Private | Remove from watchlist |

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/users` | Admin | List all users (search, paginate) |
| GET | `/api/admin/users/:id` | Admin | User detail with portfolio + transactions |
| PUT | `/api/admin/users/:id` | Admin | Edit user (name, role, cash, contact) |
| DELETE | `/api/admin/users/:id` | Admin | Deactivate user |
| GET | `/api/admin/stats` | Admin | Platform-wide stats |

All private routes require `Authorization: Bearer <token>` header.

---

## 📄 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=generate_a_strong_random_string_here
JWT_EXPIRES_IN=7d
DEFAULT_CASH=300000
CLIENT_URL=http://localhost:5174
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin
```

---

## 📝 Notes

- Real-time stock prices are fetched from **Yahoo Finance** and cached in MongoDB. The cron job updates all 40+ stocks every 5 minutes.
- Trades validate before any write and update cash → holdings → history sequentially, so they stay consistent on a **standalone MongoDB** (no replica set required).
- Sensitive values live in `server/.env` — never commit real secrets.
- The app uses a dark trading theme by default with an optional light theme toggle.
