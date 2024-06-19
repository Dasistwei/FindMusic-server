require('dotenv').config({ path: './config.env' });
const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
    title: 'Find Music Api',
    description: 'Find Music Api 文件'
  },
  host: process.env.SERVER_HOST,
  schemes: ['http', 'https']
}

const outputFile = './swagger_output.json' //生成的文件名
const endpointsFiles = ['./app.js']  //進入點

swaggerAutogen(outputFile, endpointsFiles, doc)
// console.log(';hi', process.env.SERVER_HOST)
console.log('hi', process.env.SERVER_HOST)