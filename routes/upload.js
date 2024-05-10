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

// CommonJS syntax
const { ImgurClient } = require('imgur');
const sizeOf = require('image-size');

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
    if (!req.files.length) {
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
        handleSuccess(res, imgUrl);
      });
    });

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on('error', (err) => {
      next(appError(500, '上傳失敗'));
    });

    // 將檔案的 buffer 寫入 blobStream
    blobStream.end(file.buffer);
  })
);

module.exports = router;
