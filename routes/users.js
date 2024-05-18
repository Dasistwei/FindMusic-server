const jwt = require('jsonwebtoken');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');

const router = express.Router();
const validator = require('validator');
const bcrypt = require('bcryptjs');

const handleSuccess = require('../service/handleSuccess');
const { isAuth, generateSendJWT, generateUrlJWT } = require('../service/auth');
const passport = require('passport');

router.get(
  '/',
  handleErrorAsync(async (req, res) => {
    const newUser = await User.find({});
    handleSuccess(res, newUser);
  })
);
// 註冊
router.post(
  '/sign_up',
  handleErrorAsync(async (req, res, next) => {
    for (const key in req.body) {
      req.body[key] = req.body[key].trim();
    }

    let { name, email, password, confirmPassword } = req.body;

    //欄位不可為空
    if (!name || !email || !password) {
      return next(appError(400, '欄位未填寫', next));
    }
    // 檢查email格式
    if (!validator.isEmail(email)) {
      return next(appError(400, 'email格式錯誤', next));
    }
    const user = await User.findOne({ email });
    if (user) {
      console.log('email 已被註冊');
      return next(appError(400, 'email 已被註冊'));
    }

    // 暱稱 name 長度需至少 2 個字元以上
    if (!validator.isLength(name, { min: 2 })) {
      return next(appError(400, '暱稱 name 長度需至少 2 個字元以上'));
    }

    // 密碼必須英數混合和 8 碼以上
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 0,
        minNumbers: 1,
        minLowercase: 1,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, '密碼必須英數混合和 8 碼以上', next));
    }
    // 兩次輸入密碼須一致
    if (password !== confirmPassword) {
      return next(appError(400, '密碼不一致', next));
    }

    //存到資料庫前 加密密碼
    password = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password,
    });
    generateSendJWT(newUser, res, 200);
  })
);

// 登入
router.post(
  '/sign_in',
  handleErrorAsync(async (req, res, next) => {
    let { email, password } = req.body;

    if (email === undefined || password === undefined) {
      return next(appError(400, '帳號或密碼不可為空白'));
    }
    // 用email 找user
    const user = await User.findOne({ email }).select('+password');

    //沒有註冊過的帳號
    if (!user) {
      return next(appError(400, '此帳號未註冊'));
    }
    // 核對密碼
    const authPassword = await bcrypt.compare(password, user.password);

    if (!authPassword) {
      return next(appError(400, '帳號或密碼有誤'));
    }
    generateSendJWT(user, res, 200);
  })
);

// 更新密碼
router.patch(
  '/updatePassword',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    let { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(appError(400, '請確認兩次都輸入相同密碼'));
    }
    // 密碼必須英數混合和 8 碼以上
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 0,
        minNumbers: 1,
        minLowercase: 1,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, '密碼必須英數混合和 8 碼以上', next));
    }
    let newPassword = await bcrypt.hash(password, 12);
    const updatedUser = await User.findByIdAndUpdate(req.user[0].id, {
      password: newPassword,
    });

    generateSendJWT(updatedUser, res, 200);
  })
);

// 查看個人資料頁面
// 要驗證是否登入
router.get(
  '/profile',
  isAuth,
  handleErrorAsync(async (req, res) => {
    handleSuccess(res, req.user);
  })
);

// 更新個人資料頁面
router.patch(
  '/profile',
  isAuth,
  handleErrorAsync(async (req, res) => {
    let { photo, name, gender } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user[0].id,
      {
        photo,
        name,
        gender,
      },
      {
        new: true,
      }
    );

    handleSuccess(res, updatedUser);
  })
);

//google 登入
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
  generateUrlJWT(req.user, res);
});

//user 貼文
router.get(
  '/posts',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user[0].id;
    const posts = await Post.find({ user });
    handleSuccess(res, {
      results: posts.length,
      posts,
    });
  })
);

//user 按讚的所有貼文
router.get(
  '/getLikeList',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user[0].id;
    const likeList = await Post.find({
      likes: { $in: [userId] },
    }).populate({
      path: 'user',
      select: 'name _id',
    });
    handleSuccess(res, likeList);
  })
);

//追蹤
router.post(
  '/:id/follow',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user[0].id;
    const userToFollow = req.params.id;
    // console.log('req', req.params.id);
    // 使用者 model following 欄位寫入 following user id
    // 被追蹤 model follower [] 欄位寫入 follower user id
    if (user === userToFollow) {
      return next(appError(400, '您不能追蹤自己'));
    }

    await User.updateOne(
      {
        _id: user,
        'following.user': { $ne: userToFollow },
      },
      {
        $addToSet: { following: { user: userToFollow } },
      },
      {
        new: true,
      }
    );

    await User.updateOne(
      {
        _id: userToFollow,
        'followers.user': { $ne: user },
      },
      {
        $addToSet: { followers: { user } },
      },
      {
        new: true,
      }
    );
    handleSuccess(res, '追蹤成功');
  })
);
//取消追蹤
router.delete(
  '/:id/unfollow',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user[0].id;
    const userToUnFollow = req.params.id;

    if (user === userToUnFollow) {
      return next(appError(400, '您不能取消追蹤自己'));
    }

    await User.updateOne(
      {
        _id: user,
      },
      {
        $pull: { following: { user: userToUnFollow } },
      }
    );

    await User.updateOne(
      {
        _id: userToUnFollow,
      },
      {
        $pull: { followers: { user } },
      }
    );
    handleSuccess(res, '成功取消追蹤');
  })
);
//追蹤名單
router.get(
  '/following',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user[0].id;
    const following = await User.findById(userId).populate({
      path: 'following.user',
      select: 'name', // Only select the 'name' field from the populated user documents
    });
    console.log(following);
    handleSuccess(res, following);
  })
);
// console.log(user);

const init = async () => {
  const user = await User.findById(userId).populate('following.user');

  // console.log(currentUseruser.following);
  console.log(user);
};
// init();

module.exports = router;
