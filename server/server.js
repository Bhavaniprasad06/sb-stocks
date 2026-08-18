// override: true so the project's .env wins over machine-level env vars
require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger (dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });
}

// --- Health check ---
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() })
);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

// --- Bootstrap admin account if it does not exist ---
const bootstrapAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@sbstocks.com').toLowerCase();
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'SB Stocks Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      cash: 1000000,
    });
    console.log(`Admin account created: ${email}`);
  }
};

// --- Start ---
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await bootstrapAdmin();
  const { startMarketCron } = require('./services/marketService');
  startMarketCron();
  app.listen(PORT, () => {
    console.log(`SB Stocks server running on http://localhost:${PORT}`);
  });
};

start();
