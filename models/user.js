const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { USER_STATUSES } = require('../commons/constants');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
    },
    birthday: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    status: {
      type: String,
      default: USER_STATUSES.ACTIVE,
      enum: Object.values(USER_STATUSES),
    },
    reviews: [{ type: String, ref: 'Review' }],
    searchIndex: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Arrow function don't get their own 'this'. So 'this' variable will empty if use arrow function

userSchema.virtual('reviewData', {
  ref: 'Review',
  localField: 'reviews',
  foreignField: '_id',
  justOne: false, // Vì 'reviews' là mảng
});

userSchema.pre('save', async function (next) {
  this.searchIndex = `${this.name} ${this.phone}`;
  // Chỉ hash mật khẩu nếu mật khẩu bị thay đổi
  if (!this.isModified('password')) {
    return next();
  }

  // Hash mật khẩu với bcrypt
  const hashedPassword = await bcrypt.hash(this.password, 6);
  this.password = hashedPassword;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
