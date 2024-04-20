const express = require('express')
const router = express.Router()

const Post = require('../models/post')
const User = require('../models/user')

const handleSuccess = require('../service/handleSuccess')
const handleError = require('../service/handleError')

// GET all posts
// 設計貼文的 GET API，並需設計篩選功能(從新到舊貼文、從舊到最新、關鍵字搜尋)
router.get('/', async(req, res, next)=> {
  try {
    const timeSort = req.query.timeSort === 'asc' ? "createdAt" : "-createdAt"
    const  q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {}
    const posts = await Post.find(q).populate({
      path: 'user',
      select: 'name photo'
    }).sort(timeSort)    
    
    // console.log(timeSort, q)
    // const allPosts = await Post.find({})
    handleSuccess(res, posts)    
  } catch (error) {
    handleError({res, error})
  }
})

// POST
// 設計貼文 POST API，圖片先傳固定 url
router.post('/', async(req, res, next)=> {
  console.log(req.body)
  const { content, image, name, likes, user } = req.body
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
})

//PUT
router.put('/:id', async(req, res, next)=> {
  try {
    console.log(req.params)
    const { content, image, name, likes } = req.body
    const result = await Post.findByIdAndUpdate(
      req.params.id,
      {
        name,
        content,
        image,
        likes
      }
    )
    if(result !== null){
      handleSuccess(res, result)
    }else{
      handleError({res})  
    }  
  } catch (error) {
    handleError({res})
  }
})
// DELETE
router.delete('/:id', async(req, res, next)=> {
  try {
    console.log('req.params.id', req.params.id)
    const result = await Post.findByIdAndDelete(req.params.id)
    if(result !== null){
      handleSuccess(res, result)
    }else{
      handleError({res})  
    }  
  } catch (error) {
    handleError({error,res})
  }
})
// DELETE ALL
router.delete('/', async(req, res, next)=> {
  try {
    const result = await Post.deleteMany()
    handleSuccess(res, result)
  } catch (error) {
    handleError({error,res})
  }
})

module.exports = router

// const init = async() =>{
//   const req = {query: { timeSort: 'dasc', q: '新增' }}
//   const timeSort = req.query.timeSort === 'asc' ? "createdAt" : "-createdAt"
//   const  q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {}
//   const posts = await Post.find(q).populate({
//     path: 'user',
//     select: 'name photo'
//   }).sort(timeSort)
//   console.log(posts)
//   // console.log(q)
// }
// init()