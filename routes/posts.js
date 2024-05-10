const express = require('express');
const router = express.Router();

const Post = require('../models/post');
const User = require('../models/user');
const { isAuth } = require('../service/auth');

const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');

// GET all posts
// 設計貼文的 GET API，並需設計篩選功能(從新到舊貼文、從舊到最新、關鍵字搜尋)
// 檢查會員是否登入
router.get(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const timeSort = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt';
    const q = req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
    const posts = await Post.find(q)
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .sort(timeSort);

    handleSuccess(res, posts);
  })
);

// POST
// 設計貼文 POST API，圖片先傳固定 url
// 檢查會員是否登入
router.post(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { content, image } = req.body;
    const { name, id } = req.user[0];
    // mongoose 錯誤
    // if (content === undefined || image === undefined || name === undefined || likes === undefined || user === undefined) {
    //   return next(appError(400, '欄位填寫有誤', next));
    // }
    const result = await Post.create({
      name,
      content: content.trim(),
      image,
      user: id,
    });
    handleSuccess(res, result);
  })
);

//PUT
router.put(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { content, image, name, likes } = req.body;
    const result = await Post.findByIdAndUpdate(
      req.params.id,
      {
        name,
        content: content.trim(),
        image,
        likes,
      },
      {
        runValidators: true,
      }
    );
    if (result !== null) {
      handleSuccess(res, result);
    }
  })
);
// DELETE
router.delete(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const result = await Post.findByIdAndDelete(req.params.id);

    if (result !== null) {
      handleSuccess(res, result);
    } else {
      next(appError(400, '查無此貼文'));
    }
  })
);
// DELETE ALL
router.delete(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const result = await Post.deleteMany();
    handleSuccess(res, result);
  })
);

//按讚
router.post(
  '/:id/likes',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    let postId = req.params.id;
    let userId = req.user[0].id;

    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: userId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (result !== null) {
      handleSuccess(res, result);
    }
  })
);

// 收回讚
router.delete(
  '/:id/likes',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    let postId = req.params.id;
    let userId = req.user[0].id;
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (result !== null) {
      handleSuccess(res, result);
    }
  })
);

const init = async () => {
  console.log(result);
};
// init();
module.exports = router;
