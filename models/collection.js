const mongoose = require('mongoose');
// const track = {
//   artists: "Pritam",
//   artistsUri: "spotify:artist:1wRPtKGflJrBx9BmLsSwlU",
//   title: "What Jhumka ? (From \"Rocky Aur Rani Kii Prem Kahaani\")",
//   uri: "spotify:track:4QyX8CBSjcoq4iMZuvifyF",
//   albumUrl: "https://i.scdn.co/image/ab67616d00004851a363fadc8b0dfbeea80b240a",
//   preview_url: "https://p.scdn.co/mp3-preview/ff3a54677840a85c4f8ceb66bc248b9915bf5430?cid=6d6c82e90319486a86b127fc46235b9e"
// }
//建立schema
const collectionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, '_id 未填寫'],
    },
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
      type: [mongoose.Schema.ObjectId],
      ref: 'user',
      default: [], // 设置默认值为空数组 一對多(欄位)
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, 'user ID 未填寫'],
    },
  },
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
