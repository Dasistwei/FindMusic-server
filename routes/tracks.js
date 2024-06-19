const express = require('express');
const router = express.Router();

const Track = require('../models/track');
const User = require('../models/user');
const { isAuth } = require('../service/auth');

const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');

//user 按讚的所有歌曲
router.get(
  '/getLikeList',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user[0].id;
    const likeList = await Track.find({
      likedBy: { $in: [userId] },
    }).select('-__v -likedBy')
    handleSuccess(res, likeList);
  })
);

//按讚 track
router.post(
  '/:id/likes',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const trackId = req.params.id
    let userId = req.user[0].id;
    let result;
    result = await Track.findOneAndUpdate(
      { trackId: trackId },
      {
        $addToSet: { likedBy: userId }
      },
      {
        runValidators: true,
      }
    );

    // if (result !== null) return
    if (result === null) {
      if (!req.body.uri.startsWith("spotify:track")) return
      // const trackId = req.body.uri.split(":").pop()
      result = await Track.create({
        trackId: trackId,
        artists: req.body.artists,
        artistsUri: req.body.artistsUri,
        title: req.body.title,
        uri: req.body.uri,
        albumUrl: req.body.albumUrl,
        preview_url: req.body.preview_url,
        likedBy: [userId]
      });
    }
    handleSuccess(res, 'like added')
  })
);

// 收回讚
router.delete(
  '/:id/likes',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const trackId = req.params.id
    let userId = req.user[0].id;
    const result = await Track.findByIdAndUpdate(
      trackId,
      {
        $pull: { likedBy: userId },
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

//新增近期搜尋 track
router.post(
  '/recentSearch',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user[0]._id
    const trackId = req.body.trackId
    console.log('use', req.body.trackId)
    if (!trackId) {
      return next(appError(400, '請傳入歌曲資訊'))
    }

    const result = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { recentSearch: trackId },
      },
      {
        runValidators: true,
        new: true,
      }
    )
    // 限制数组长度为 6
    const trimmedResult = await User.findByIdAndUpdate(
      userId,
      {
        $push: { recentSearch: { $each: [], $slice: -6 } }, // 切片操作，保留最后 6 个元素
      },
      {
        runValidators: true,
        new: true,
      }
    );
    // console.log('result: ', result);
    handleSuccess(res, trimmedResult.recentSearch)
  })
);
//取得近期搜尋 track
router.get(
  '/recentSearch',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user[0]._id
    const result = await User.findById(userId)
      .select('recentSearch')
    handleSuccess(res, result.recentSearch);
  })
);

const init = async () => {
  try {

    let trackId = '000'
    let userId = '66630d0127c3137a1a7605c1'
    // const result = await User.findByIdAndUpdate(
    //   userId,
    //   {
    //     $addToSet: { recentSearch: trackId },
    //   },
    //   {
    //     runValidators: true,
    //     new: true,
    //   }
    // )
    const result = await User.findById(userId)
      .select('recentSearch')

    console.log('result: ', result);
  } catch (error) {
    console.log('error', error);
  }
}
// init()
module.exports = router;
