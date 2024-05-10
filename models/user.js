const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '請輸入您的名字'],
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    password: {
      type: String,
      required: [true, '請輸入您的密碼'],
      minlength: 8,
      select: false,
    },
    email: {
      type: String,
      required: [true, '請輸入您的 Email'],
      unique: true,
      lowercase: true,
      select: false,
    },
    photo: {
      type: String,
    },
    googleId: String,
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;
