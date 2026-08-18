const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWatchlist);
router.post('/:stockId', protect, addToWatchlist);
router.delete('/:stockId', protect, removeFromWatchlist);

module.exports = router;
