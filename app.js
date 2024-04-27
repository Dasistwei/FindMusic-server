var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({path: './config.env'})
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_ATLAS_URL)
 .then(res => console.log('成功連接資料庫'))
 .catch(err => console.log('資料庫連接有誤',err.message))

// 捕捉預期外的錯誤
 process.on('uncaughtException', err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
	console.error('Uncaughted Exception！')
	console.error(err);
	process.exit(1);
});

const httpController = require('./controllers/http')
var indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts')
const User = require('./models/user')
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
// console.log(qq)
app.post('/register', async (req, res) => {
  try {
    const {nickname, email, password} = req.body
    if (nickname != '' && email != '' && password != '') {
      const newUser = await User.create({
        name: nickname,
        email,
        password
      });
      const allUsers = await User.find({})
      res.status(200).json({
        status: 'success',
        message: `${nickname} 註冊成功`,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use(httpController.pageNotFound)

const errorDev = ({err, res}) =>{
  res.status(500).json(
    {
      message: err.message,
      error: err,
      stack: err.stack
    }
  );
}
const errorProd = ({res, err}) =>{

  if(err.isOperational){
    res.status(err.statusCode).json(
      {
        status: 'false',
        message: err.message
      }
    );
  }else{
    res.status(500).json(
      {
        status: 'false',
        message: '請聯絡客服'
      }
    );
  }
}
//攔截程式碼錯誤
app.use((err, req, res, next) => {  
  if(process.env.NODE_ENV === 'dev'){
    return errorDev({err, res})

    // mongoose 錯誤
  }else if(err.name === 'ValidationError' || err.name === 'CastError' || err.name === 'ReferenceError'){
    err.message = "無此ID或資料未填寫正確"
    err.isOperational = true
    err.statusCode = 400
    return errorProd({res, err})
  }

  errorProd({res, err})
});

// 未捕捉到的 catch 
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
});
module.exports = app;
