const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(null, false, { type: 'error_messages', message: '帳號或密碼錯誤' })
        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, { type: 'error_messages', message: '帳號或密碼錯誤' })
          return cb(null, user, { type: 'success_msg', message: '登入成功!' })
        })
      })
  }
))
// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON
    return cb(null, user)
  })
})
module.exports = passport
