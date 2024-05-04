const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.passwordCheck !== req.body.password) throw new Error('Password does not match')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('User already exists')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_msg', 'You have successfully signed up')
        res.redirect('/signin')
      })
      .catch(next)
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_msg', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error('User not found')
        return res.render('profile', { user: user.toJSON() })
      })
  }
}
module.exports = userController
