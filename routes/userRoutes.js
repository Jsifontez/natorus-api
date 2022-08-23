const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

// 3) ROUTES
// this create a new router middleware to isolate and
// create a sort of sub-app.
// This process is called: Mounting the router
const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword)

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
