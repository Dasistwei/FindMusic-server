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
    // likes: {
    //   type: [mongoose.Schema.ObjectId],
    //   ref: 'user',
    //   default: [], // 设置默认值为空数组 一對多(欄位)
    // },
    // 多對多
    followers: {
      user: {
        type: [mongoose.Schema.ObjectId],
        ref: 'user',
      },
      createdAt: {
        type: Date,
        default: Date.now, //確保每筆資料時間不同
      },
      default: [],
    },
    following: {
      user: {
        type: [mongoose.Schema.ObjectId],
        ref: 'user',
      },
      createdAt: {
        type: Date,
        default: Date.now, //確保每筆資料時間不同
      },
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;
