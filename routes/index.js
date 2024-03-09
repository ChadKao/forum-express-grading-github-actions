const express = require('express')
const router = express.Router()
const restaurantController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middlewares/error-handler')
const passport = require('../config/passport')

router.use('/admin', admin)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/restaurants', restaurantController.getRestaurants)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true,
  successFlash: true
}), userController.signIn)
router.get('/logout', userController.logout)

router.use('/', (req, res) => { res.redirect('/restaurants') })
router.use(generalErrorHandler)

module.exports = router
