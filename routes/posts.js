const express = require('express')
const router = express.Router()

const Post = require('../models/post')
const User = require('../models/user')

const handleSuccess = require('../service/handleSuccess')
const handleError = require('../service/handleError')
const appError = require('../service/appError')
const handleErrorAsync = require('../service/handleErrorAsync')

// GET all posts
// 設計貼文的 GET API，並需設計篩選功能(從新到舊貼文、從舊到最新、關鍵字搜尋)
router.get('/', handleErrorAsync(async(req, res, next)=> {
  const timeSort = req.query.timeSort === 'asc' ? "createdAt" : "-createdAt"
  const  q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {}
  const posts = await Post.find(q).populate({
    path: 'user',
    select: 'name photo'
  }).sort(timeSort)    
  handleSuccess(res, posts)    
}))

// POST
// 設計貼文 POST API，圖片先傳固定 url
router.post('/', handleErrorAsync(async(req, res, next)=> {
  const data = req.body
  for (const key in data) {
    if(typeof data[key] === 'string'){
      data[key]= data[key].trim()
    }
  }
  const { content, image, name, likes, user } = data
  // 自訂錯誤
  if(content === undefined){
    return next(appError(400, "content未填寫"))
  }
  const result = await Post.create(
    {
      name,
      content,
      image,
      likes,
      user
    }
  )  
  handleSuccess(res, result)         
}))

//PUT
router.put('/:id', handleErrorAsync(async(req, res, next)=> {
  const { content, image, name, likes } = req.body

  if(Object.keys(req.body).length === 0){
    return next(appError(400, "請填寫欲更改欄位"))
  }
  const result = await Post.findByIdAndUpdate(
    req.params.id,
    {
      name,
      content,
      image,
      likes
    },{
     new: true 
    }
  )
  handleSuccess(res, result)

}))
// DELETE
router.delete('/:id', handleErrorAsync(async(req, res, next)=> {
  const result = await Post.findByIdAndDelete(req.params.id)

  if(result !== null){
    handleSuccess(res, result)
  }else{
    next(err)
  }  
}))
// DELETE ALL
router.delete('/', handleErrorAsync(async(req, res, next)=> {
  const result = await Post.deleteMany()
  handleSuccess(res, result)
}))

module.exports = router
