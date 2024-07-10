const bcrypt = require('bcryptjs')
const db = require('../models')
const { User } = db

const userServices = {
  signUp: (req, cb) => {
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
      .then(newUser => cb(null, { user: newUser }))
      .catch(err => cb(err))
  }
}

module.exports = userServices
