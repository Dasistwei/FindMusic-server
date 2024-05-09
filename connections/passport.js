const passport = require('passport')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/users/google/callback`
  },
  async (accessToken, refreshToken, profile, cb) => {
    const user = await User.findOne({googleId: profile.id})

    if(user){
      console.log("使用者已存在")
      return cb(null, user)
    }

    const password = await bcrypt.hash(process.env.BCRYPT_PW, 12)

    const newUser = await User.create({
      name: profile.displayName,
      password,
      email: profile.emails[0].value,
      googleId: profile.id
    })

    // console.log('profile', profile)
    return cb(null, newUser)
  }
));

// let profile = {
//   id: '111055374770584860766',
//   displayName: 'Wei',
//   name: { familyName: undefined, givenName: 'Wei' },
//   emails: [ { value: 'wei02919@gmail.com', verified: true } ],
//   photos: [
//     {
//       value: 'https://lh3.googleusercontent.com/a/ACg8ocIC59HFPt00nG9TMK1d9o-QSB6SEvrqXWAx1XTCnjeXDvwPCQ=s96-c'
//     }
//   ],
//   provider: 'google',
//   _raw: '{\n' +
//     '  "sub": "111055374770584860766",\n' +
//     '  "name": "Wei",\n' +
//     '  "given_name": "Wei",\n' +
//     '  "picture": "https://lh3.googleusercontent.com/a/ACg8ocIC59HFPt00nG9TMK1d9o-QSB6SEvrqXWAx1XTCnjeXDvwPCQ\\u003ds96-c",\n' +
//     '  "email": "wei02919@gmail.com",\n' +
//     '  "email_verified": true,\n' +
//     '  "locale": "zh-TW"\n' +
//     '}',
//   _json: {
//     sub: '111055374770584860766',
//     name: 'Wei',
//     given_name: 'Wei',
//     picture: 'https://lh3.googleusercontent.com/a/ACg8ocIC59HFPt00nG9TMK1d9o-QSB6SEvrqXWAx1XTCnjeXDvwPCQ=s96-c',
//     email: 'wei02919@gmail.com',
//     email_verified: true,
//     locale: 'zh-TW'
//   }
// }
// const init = async() =>{
//   const user = await User.findOne({googleId: profile.id})
//   if(user){
//     console.log("使用者已存在")
//   }
//   const password = await bcrypt.hash(process.env.BCRYPT_PW, 12)
//   const newUser = await User.create({
//     name: profile.displayName,
//     password,
//     email: profile.emails[0].value,
//     googleId: profile.id
//   })
//   return cb(null, newUser)
//   // console.log(password)
// }
// init()
// console.log(profile.emails[0].value)