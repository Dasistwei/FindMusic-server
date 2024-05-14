const mongoose = require('mongoose');

//建立schema user id /post id
const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'Content 未填寫'],
    },
    createdAt: {
      type: Date,
      default: Date.now, //確保每筆資料時間不同
      select: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      // required: [true, 'user ID 未填寫'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'post',
      // required: [true, 'post ID 未填寫'],
    },
  },
  {
    versionKey: false,
  }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name id createdAt',
  });
  next();
});
// 建立model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
// console.log(Comment);
// const init = async () => {
//   const newComment = await Comment.create({
//     content: '留言',
//   });
//   console.log(newComment);
// };
// init();
