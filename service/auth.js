const jwt = require('jsonwebtoken');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const User = require('../models/user');

// jwt => sign 簽名 =>
const generateSendJWT = (user, res, statusCode) => {
  // 產生token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  user.password = undefined;

  //回傳狀態給client端
  res.status(statusCode).json({
    status: 'success',
    user: {
      token,
      name: user.name,
    },
  });
};
const generateUrlJWT = (user, res) => {
  // 產生token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  user.password = undefined;

  res.redirect(`${process.env.GOOGLE_JWT_REDIRECT_URL}?token=${token}&name=${user.name}`);
};

const isAuth = handleErrorAsync(async (req, res, next) => {
  //驗證token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(appError(401, '請登入', next));
  }
  //驗證密碼
  const decode = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });

  const currentUser = await User.find({ _id: decode.id });
  req.user = currentUser;

  next();
});
module.exports = {
  isAuth,
  generateSendJWT,
  generateUrlJWT,
};
