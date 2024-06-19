const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Collection = require('../models/collection');
const Track = require('../models/track');
const User = require('../models/user');
const { isAuth } = require('../service/auth');

const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');

// 取得全部歌單
router.get(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']
    const userId = req.user[0].id
    const collections = await Collection.find({ user: userId })
      .select('_id name')
    //   .populate({
    //     path: 'user',
    //     select: 'name photo',
    //   })
    //   .populate({
    //     path: 'comments',
    //     select: 'comment user',
    //   })
    //   .sort(timeSort);
    handleSuccess(res, collections);
  })
);
// 取得單筆歌單
router.get(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']

    const collectionId = req.params.id
    // let result
    const collection = await Collection.find({ _id: collectionId })
    const trackIds = collection[0].tracks
    let result = await Track.find({ trackId: { $in: trackIds } })
    // if (trackIds.length > 0) {
    //   result = await Track.find({ trackId: { $in: trackIds } })
    // } else {
    //   result = collection
    // }

    handleSuccess(res, { tracks: result, collectionName: collection[0].name });
  })
);

//新增 collection
router.post(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']
    const { name } = req.body;
    const userId = req.user[0].id
    console.log('name', name)
    console.log('userId', userId)
    // 欄位填寫錯誤
    if (name === undefined) {
      return next(appError(400, '欄位填寫有誤', next));
    }
    const result = await Collection.create({
      name: name,
      user: userId
    });
    handleSuccess(res, result);
  })
);

//歌單 新增 track
router.post(
  '/add_track',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']
    const { trackId, collectionId, track } = req.body
    let trackResult;
    trackResult = await Track.find(
      { trackId: trackId }
    );

    if (trackResult.length === 0) {
      trackResult = await Track.create({
        trackId: trackId,
        artists: track.artists,
        artistsUri: track.artistsUri,
        title: track.title,
        uri: track.uri,
        albumUrl: track.albumUrl,
        preview_url: track.preview_url,
      });
    }
    const result = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $addToSet: { tracks: trackId }
      },
      {
        runValidators: true,
        // new: true,
      }
    );
    if (result !== null) {
      handleSuccess(res, result);
    }
  })
);
//歌單 移除track
router.delete(
  '/remove_track',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']
    const { trackId, collectionId } = req.body

    const result = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $pull: { tracks: trackId }
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

//編輯 collection 歌曲
// {{URL}}/collections/{{track_id}}/add_track
router.put(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']
    const { name } = req.body
    const collectionId = req.params.id
    const result = await Collection.findByIdAndUpdate(
      collectionId,
      {
        name
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (result !== null) {
      handleSuccess(res, result);
    }
    if (result === null) {
      next(appError(400, "無此歌單或欄位填寫錯誤"))
    }
  })
);

// DELETE 歌單
router.delete(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // #swagger.tags= ['Collections']
    const result = await Collection.findByIdAndDelete(req.params.id);

    if (result !== null) {
      handleSuccess(res, result);
    } else {
      next(appError(400, '歌單錯誤或查無此歌單'));
    }
  })
);
// // DELETE ALL
// router.delete(
//   '/',
//   isAuth,
//   handleErrorAsync(async (req, res, next) => {
// #swagger.tags= ['Collections']
//     const result = await Post.deleteMany();
//     handleSuccess(res, result);
//   })
// );



const init = async () => {
  const req = {
    body: {
      trackId: '0mflMxspEfB0VbI1kyLiAv',
      collectionId: '666807b3fd93fd25f842673c'
    }
  }
  try {
    const { trackId, collectionId } = req.body
    const result = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $pull: { tracks: trackId }
      },
      {
        runValidators: true,
        new: true,
      }
    );
    console.log('result: ', result);
  } catch (error) {
    console.log('error', error);
  }
}
// init()
module.exports = router;
