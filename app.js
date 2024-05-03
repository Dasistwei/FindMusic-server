var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({path: './config.env'})
const cors = require('cors')

//DB
require('./connections/mongoose')


const httpController = require('./controllers/http')

var indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts')
const usersRouter = require('./routes/users')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use(httpController.pageNotFound)


// 補捉程式錯誤
process.on('uncaughtException', err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
	console.error('Uncaughted Exception！')
	console.error(err);
	process.exit(1);
});
const resErrorProd = (err, res) =>{
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message
    })
  }else{
    res.status(err.statusCode).json({
      message: '出現重大錯誤'
    })
  }
  res.status(400).json({
    status: 'false',
    message: '出現重大錯誤'
  })
}
const resErrorDev = (err, res) =>{
  res.status(err.statusCode).json(
    {
      status: err.statusCode,
      message: err.message,
      error: err,
      stack: err.stack
    }
  );
}


//攔截程式碼錯誤
app.use((err, req, res, next) => {
  console.log('err.statusCode', err)
  err.statusCode = err.statusCode || 500

  if(process.env.NODE_ENV == 'dev' && err.name === 'SyntaxError'){
    err.message = "Unexpected end of JSON input"
    return resErrorDev(err, res)
  }
  if(process.env.NODE_ENV == 'dev'){
    return resErrorDev(err, res)
  }

  if(err.name === 'ValidationError'){
    err.message = "資料未填寫正確，請重新輸入！"
    err.isOperational = true 
    return resErrorProd(err, res)

  }else if(err.name === 'SyntaxError'){
    err.message = "資料格式錯誤"
    err.statusCode = 400
    err.isOperational = true 
    return resErrorProd(err, res)
  }else if(err.name === 'CastError'){
    err.message = "找不到此貼文"
    err.statusCode = 400
    err.isOperational = true 
    return resErrorProd(err, res)
  }
  resErrorProd(err, res)
});

// 補捉未處理的 catch
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
});
module.exports = app;
