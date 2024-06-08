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
    // console.log('req.user ', req.user)
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
    // console.log('req.user ', req.user)
    const collectionId = req.params.id
    // const following = await User.findById(userId).populate({
    //   path: 'following.user',
    //   select: 'name', // Only select the 'name' field from the populated user documents
    // });
    const collection = await Collection.find({ _id: collectionId })
    // .select('name tracks')
    const trackIds = collection[0].tracks
    // const tracks = await Track.find({ _id: { $in: trackIds } });
    const result = await Track.find({ _id: { $in: trackIds } })
    // console.log('result********************************', result)
    //   .populate({
    //     path: 'user',
    //     select: 'name photo',
    //   })
    //   .populate({
    //     path: 'comments',
    //     select: 'comment user',
    //   })
    //   .sort(timeSort);
    handleSuccess(res, collection);
  })
);

//新增 collection
router.post(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
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

//新增 歌單 track
router.post(
  '/add_track',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { trackId, collectionId } = req.body
    // const objectIdTrackId = mongoose.Types.ObjectId(trackId);
    // console.log('objectIdTrackId********************************', trackId, collectionId);
    // result = await Track.findOneAndUpdate(
    //   { trackId: trackId },
    //   {
    //     $addToSet: { likedBy: userId }
    //   },
    //   {
    //     runValidators: true,
    //   }
    // );
    const result = await Collection.findOneAndUpdate(
      { _id: collectionId },
      {
        $addToSet: { tracks: trackId }
      },
      {
        runValidators: true,
        // new: true,
      }
    );
    console.log("result: *************************************", result)
    if (result !== null) {
      handleSuccess(res, 'result');
    }
  })
);

//編輯 collection 歌曲
// {{URL}}/collections/{{track_id}}/add_track
router.put(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
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
//     const result = await Post.deleteMany();
//     handleSuccess(res, result);
//   })
// );



const init = async () => {
  const req = {
    body: {
      trackId: '4QyX8CBSjqqqcoq4iMZuvifsssysF900',
      collectionId: '6661e38725715e04b9ddec70'
    }
  }
  try {
    const { trackId, collectionId } = req.body
    const result = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $push: { tracks: new mongoose.Types.ObjectId(trackId) },
      },
      {
        runValidators: true,
        // new: true,
      }
    );

    console.log('result: ', result);
  } catch (error) {
    console.log('error', error);
  }
}
// init()
module.exports = router;
