const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');
const { asyncHandler } = require('../middleware/errorHandler');

// Sign a JWT for the user
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and create their portfolio + watchlist
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, contact } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({ name, email, password, contact: contact || '' });
  await Portfolio.create({ user: user._id, holdings: [] });
  await Watchlist.create({ user: user._id, stocks: [] });

  const token = signToken(user._id);
  res.status(201).json({ token, user: user.toSafeJSON() });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({ token, user: user.toSafeJSON() });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update the logged-in user's profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, contact } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (name) user.name = name;
  if (contact !== undefined) user.contact = contact;
  await user.save();
  res.json({ user: user.toSafeJSON() });
});

module.exports = { register, login, getMe, updateProfile };
