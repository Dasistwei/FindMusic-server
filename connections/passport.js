const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/users/google/callback`,
    },
    async (accessToken, refreshToken, profile, cb) => {
      const user = await User.findOne({ googleId: profile.id });

      if (user) {
        console.log('使用者已存在');
        return cb(null, user);
      }

      const password = await bcrypt.hash(process.env.BCRYPT_PW, 12);

      const newUser = await User.create({
        name: profile.displayName,
        password,
        email: profile.emails[0].value,
        googleId: profile.id,
      });

      // console.log('profile', profile)
      return cb(null, newUser);
    }
  )
);
