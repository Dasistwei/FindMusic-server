const jwt = require('jsonwebtoken')
const appError = require('../service/appError')
const handleErrorAsync = require('../service/handleErrorAsync')
const express = require('express')
const User = require('../models/user')

const router = express.Router()
const validator = require('validator')
const bcrypt = require('bcryptjs')

const handleSuccess = require('../service/handleSuccess')
const {isAuth, generateSendJWT} = require('../service/auth')

router.get('/', handleErrorAsync(async (req, res, next) => {
  
  const newUser = await User.find({});
  handleSuccess(res, newUser)
}
));

// 註冊
router.post('/sign_up', handleErrorAsync(async (req, res, next) => {
  let {name, email, password, confirmPassword} = req.body
  
  //欄位不可為空
  if (!name || !email || !password ) {
    return next(appError(400, "欄位未填寫", next))
  }
  // 密碼必須大於八碼
  if (!validator.isLength(password, {min:8})) {
    return next(appError(400, "密碼數字必須大於或等於八碼", next))
  }
  // 兩次輸入密碼須一致
  if (password !== confirmPassword) {
    return next(appError(400, "密碼不一致", next))
  }
  // 檢查email格式
  if (!validator.isEmail(email)) {
    return next(appError(400, "email格式錯誤", next))
  }

  //存到資料庫前 加密密碼
  password = await bcrypt.hash(password, 12)
  
  const newUser = await User.create({
    name,
    email,
    password
  });
  generateSendJWT(newUser, res, 200)
}
));

// 登入
router.get('/sign_in', handleErrorAsync(async (req, res, next) => {
  let { email, password } = req.body
  
  if(email===undefined|| password === undefined){
    return next(appError(400, '帳號或密碼不可為空白'))
  }
  // 用email 找user
  const user = await User.findOne({email}).select('+password')

  // 核對密碼
  const authPassword = await bcrypt.compare(password, user.password)

  if(!authPassword){
    return next(appError(400, '帳號或密碼有誤'))
  }
  generateSendJWT(user, res, 200)
}
));

// 更新密碼
// 要驗證是否登入
router.put('/update_password', isAuth, handleErrorAsync(async (req, res, next) => {
  let { password, confirmPassword} = req.body

  if(password !== confirmPassword){
    return next(appError(400, '請確認兩次都輸入相同密碼'))
  }
  newPassword = await bcrypt.hash(password, 12)
  const updatedUser = await User.findByIdAndUpdate(req.user[0].id, {
    password: newPassword 
  })

  generateSendJWT(updatedUser, res, 200)

}
));

// 查看個人資料頁面
// 要驗證是否登入
router.get('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
  handleSuccess(res, req.user)
}
));

// 更新個人資料頁面
// 要驗證是否登入
router.put('/update_profile', isAuth, handleErrorAsync(async (req, res, next) => {
  
  let {photo, name, gender} = req.body
  const updatedUser = await User.findByIdAndUpdate(req.user[0].id, {
    photo, 
    name, 
    gender
  },{
    new: true
  })

  handleSuccess(res, updatedUser)
}
));


module.exports = router

