const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/', protect, getTransactions);

module.exports = router;
