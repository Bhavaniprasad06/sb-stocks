const express = require('express');
const router = express.Router();
const {
  getStocks,
  getStock,
  getStockHistory,
  getLiveStocks,
  getSectors,
  getMovers,
  createStock,
  updateStock,
  deleteStock,
} = require('../controllers/stockController');
const { protect, adminOnly } = require('../middleware/auth');

// Public reads
router.get('/', getStocks);
router.get('/meta/sectors', getSectors);
router.get('/meta/movers', getMovers);
router.get('/live', getLiveStocks);
router.get('/:id/history', getStockHistory);
router.get('/:id', getStock);

// Admin mutations
router.post('/', protect, adminOnly, createStock);
router.put('/:id', protect, adminOnly, updateStock);
router.delete('/:id', protect, adminOnly, deleteStock);

module.exports = router;
