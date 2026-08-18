const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
  getStockChart,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/stock-chart', getStockChart);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
