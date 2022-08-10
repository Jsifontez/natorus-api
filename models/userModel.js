const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    lowercase: true, // transform the input in to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String, // the path of where the photo is store
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Please provide a password with 8 characters length'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
