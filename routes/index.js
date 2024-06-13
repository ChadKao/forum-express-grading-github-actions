const express = require('express')
const router = express.Router()
const restaurantController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')
const { generalErrorHandler } = require('../middlewares/error-handler')
const passport = require('../config/passport')
const { authenticated, authenticatedAdmin } = require('../middlewares/auth')
const upload = require('../middlewares/multer')

router.use('/admin', authenticatedAdmin, admin)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restaurantController.getFeeds)
router.get('/restaurants/:id', authenticated, restaurantController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restaurantController.getDashboard)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true,
  successFlash: true
}), userController.signIn)
router.get('/logout', userController.logout)
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', upload.single('image'), authenticated, userController.putUser)
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.use('/', (req, res) => {
  req.flash('error_messages', res.locals.error_messages[0])
  // 只有貼上無效或是無權限的網址會被導至跟目錄並在再次跳轉的頁面上顯示錯誤訊息
  return res.redirect('/restaurants')
})
router.use(generalErrorHandler)

module.exports = router
