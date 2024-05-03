const jwt = require('jsonwebtoken')
const appError = require('../service/appError')
const handleErrorAsync = require('../service/handleErrorAsync')
const express = require('express')
const User = require('../models/user')

// jwt => sign 簽名 =>
const generateSendJWT = (user, res, statusCode) =>{
  // console.log('user', user)
  // 產生token
  const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  })
  user.password = undefined

  //回傳狀態給client端
  res.status(statusCode).json({
    status: 'success',
    user:{
      token,
      name: user.name
    }
  })
}
const isAuth = async(req, res, next) =>{
  //驗證token
  let token;
  if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    return next(appError(401, '請登入', next))
  }
  //驗證密碼
  const decode = await new Promise((resolve, reject)=>{
    // let token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MzBiMWMwZTNlNjZjM2M4MGM0MGJlYSIsImlhdCI6MTcxNDQ2NzI2NCwiZXhwIjoxNzE0NjQwMDY0fQ.TUakA4HKdqg8te2bkBAsSxn5ZmhCy4cj5mUNd68Q24o"
    jwt.verify(token, process.env.JWT_SECRET, (err, payload)=>{
      if(err){
        reject(err)
      }else{
        resolve(payload)
      }
    })
  })

  const currentUser = await User.find({ _id: decode.id})
  req.user = currentUser  

  next()
}
module.exports = {
  isAuth, 
  generateSendJWT
}
// User.find({ _id: '66336d36a0f70c5891890ec9'})
// .then(res=> console.log(res))