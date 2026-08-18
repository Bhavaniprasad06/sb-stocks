const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model — holds account credentials, role and virtual cash balance.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    contact: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    cash: {
      type: Number,
      default: process.env.DEFAULT_CASH ? Number(process.env.DEFAULT_CASH) : 300000,
      min: [0, 'Cash cannot be negative'],
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare candidate password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Strip sensitive fields when serializing
userSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    contact: this.contact,
    role: this.role,
    cash: this.cash,
    totalInvested: this.totalInvested,
    avatar: this.avatar,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
