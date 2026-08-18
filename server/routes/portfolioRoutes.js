const express = require('express');
const router = express.Router();
const { getPortfolio, getPerformance } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPortfolio);
router.get('/performance', protect, getPerformance);

module.exports = router;
