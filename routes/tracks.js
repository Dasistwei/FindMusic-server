const express = require('express');
const router = express.Router();

// const Post = require('../models/post');
const Track = require('../models/track');
const User = require('../models/user');
const { isAuth } = require('../service/auth');

const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');

// const req = {
//   body: {
//     _id: "4QyX8CBSjcoq4iMZuvifsssysF9",
//     artists: "Pritam",
//     artistsUri: "spotify:artist:1wRPtKGflJrBx9BmLsSwlU",
//     title: "What Jhumka ? (From \"Rocky Aur Rani Kii Prem Kahaani\")",
//     uri: "spotify:track:4QyX8CBSjcoq4iMZuvifyF",
//     albumUrl: "https://i.scdn.co/image/ab67616d00004851a363fadc8b0dfbeea80b240a",
//     preview_url: "https://p.scdn.co/mp3-preview/ff3a54677840a85c4f8ceb66bc248b9915bf5430?cid=6d6c82e90319486a86b127fc46235b9e",
//   }
// }



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
    result = await Track.findByIdAndUpdate(
      trackId,
      {
        $push: { likedBy: userId },
      },
      {
        runValidators: true,
        new: true,
      }
    );

    if (result === null) {
      if (!req.body.uri.startsWith("spotify:track")) return
      const trackId = req.body.uri.split(":").pop()
      result = await Track.create({
        _id: trackId,
        artists: req.body.artists,
        artistsUri: req.body.artistsUri,
        title: req.body.title,
        uri: req.body.uri,
        albumUrl: req.body.albumUrl,
        preview_url: req.body.preview_url,
        likedBy: [userId]
      });
    }

    handleSuccess(res, { 'result': result })
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


const init = async () => {
  try {
    // let trackId = '000'
    let userId = '66607758db59b9d5cec3a266'
    const result = await Track.find({
      likedBy: { $in: [userId] },
    }).select('-__v -likedBy')

    console.log('result: ', result);
  } catch (error) {
    console.log('error', error);
  }
}
// init()
module.exports = router;
