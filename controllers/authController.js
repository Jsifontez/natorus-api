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

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

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
