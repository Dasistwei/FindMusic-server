const mongoose = require('mongoose');

//建立schema
const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name 未填寫'],
    },
    createdAt: {
      type: Date,
      default: Date.now, //確保每筆資料時間不同
      select: false,
    },
    tracks: {
      // type: [mongoose.Schema.ObjectId],
      // ref: 'track',
      type: [String],
      default: [], // 设置默认值为空数组 一對多(欄位)
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, 'user ID 未填寫'],
    }
  },
  { versionKey: false } // 禁用 __v 欄位
  // {
  //   versionKey: false,
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);
// postSchema.virtual('comments', {
//   ref: 'Comment',
//   foreignField: 'post',
//   localField: '_id',
// });
// 建立model
const Collection = mongoose.model('Collection', collectionSchema);
module.exports = Collection;
