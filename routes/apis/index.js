const express = require('express')
const router = express.Router()
const restController = require('../../controllers/apis/restaurant-controller')
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../../middlewares/error-handler')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

router.use(apiErrorHandler)
module.exports = router