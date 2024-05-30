var express = require('express');
var router = express.Router();

const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const upload = require('../service/image');
const { isAuth } = require('../service/auth');
const { v4: uuid4 } = require('uuid');
const firebaseAdmin = require('../connections/firebase');
const bucket = firebaseAdmin.storage().bucket();

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const uploadSounds = multer({ dest: 'uploads/' })
// CommonJS syntax
const { ImgurClient } = require('imgur');
const sizeOf = require('image-size');
const User = require('../models/user');

router.post(
  '/',
  isAuth,
  upload,
  handleErrorAsync(async (req, res, next) => {
    if (!req.files.length) {
      return next(appError(400, '檔案尚未上傳'));
    }
    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENT_ID,
      clientSecret: process.env.IMGUR_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN,
    });
    // 可由前端審核圖片比例
    // const dimensions = sizeOf(req.files[0].buffer);
    // if (dimensions.width !== dimensions.height) {
    //   return next(appError(400, "圖片長寬不符1:1"));
    // }
    const response = await client.upload({
      image: req.files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.IMGUR_ALBUM,
    });
    handleSuccess(res, response.data.link);
  })
);

router.post(
  '/image',
  isAuth,
  upload,
  handleErrorAsync(async (req, res, next) => {
    if (req.files === undefined || !req.files.length) {
      return next(appError(400, '尚未上傳檔案'));
    }
    const file = req.files[0];
    // 基於檔案的原始名稱建立一個 blob 物件
    const blob = bucket.file(`images/${uuid4()}.${file.originalname.split('.').pop()}`);
    // 建立一個可以寫入 blob 的物件
    const blobStream = blob.createWriteStream();

    // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
    blobStream.on('finish', () => {
      const config = {
        action: 'read', // 權限
        expires: '12-31-2500', // 網址的有效期限
      };
      // 取得檔案的網址
      blob.getSignedUrl(config, (err, imgUrl) => {
        return handleSuccess(res, imgUrl);
      });
    });

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on('error', (err) => {
      return next(appError(500, '上傳失敗'));
    });

    // 將檔案的 buffer 寫入 blobStream
    blobStream.end(file.buffer);
  })
);
router.post(
  '/sounds',
  // isAuth,
  uploadSounds.single('audio'),
  handleErrorAsync(async (req, res, next) => {
    const file = req.file
    if (!file) {
      return next(appError(400, '無音檔上傳'))
    }
    const newFileName = `${file.filename}.mp3`
    fs.renameSync(file.path, path.join('uploads', newFileName));
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${newFileName}`;
    console.log('fileUrl', fileUrl)
    res.json({ fileUrl });
    handleSuccess(res, 'sounds')
  })
);

// console.log()
module.exports = router;
