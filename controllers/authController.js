const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError(' Please provide email and password', 400))
  }

  // 2) check if user exist && password is correct
  // we use the '+password' because 'password' is a hide field in our model
  const user = await User.findOne({ email }).select('+password')

  // we'll use the correctPassword instance method to compare passwords
  if (!user || !(await user.correctPassword(password, user.password))) {
    // we put the two erros together to avoid to a hacker know if the password
    // or the email that is been using is correct or not
    return next(new AppError('Incorrect email or password', 401))
  }

  // 3) Everything is ok. Send token to client
  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token,
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting  token and check of it's there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    // error 401 = unauthorized
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    )
  }
  // 2) Verification token
  /**
   * we use the verify method of jwt. But this is a function that reutrn can a
   * Promise if a callback is provided. But in order to continue our
   * async/await use, we'll use a method from node called: 'promisify' that take a
   * function as argument and then
   * executed (A sort of IIFE)
   **/
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  /**
   * If the user doesn't exist anymore or if the user have change his password
   * the it's not going to work. It can happen that someone take the token and
   * the user change his password to avoid someone login with his old password
   **/

  // 3) Check if user still exist
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    )
  }

  // 4) Check if user changed password after the token was issued
  /**
   * Due the password verification have to be consulted the DB, we need an
   * instance method to check that for us
   **/
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    )
  }

  // 5) Grant Acees to protected route
  req.user = currentUser
  next()
})

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is ['adnmin', 'lead-guid']
    // role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }

    next()
  }

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })

  // 1.5) verify if the user exist
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404))
  }

  // 2) Generate the random reset token
  // We use a instance method of our model because the reset password if more
  // a DB subjet than the controller
  const resetToken = user.createPasswordResetToken()

  // with the instance method we're changing the user data. Now we need to save it
  // but we need to pass and option to invalid all validators set in out model
  // otherwise it throw and error, because the save method need al elements
  // required in our model
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
})

exports.resetPassword = (req, res, next) => {}
