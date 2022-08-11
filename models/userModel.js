const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // tihs only works on CREATE and SAVE!!!
      // doesn't work for findOneAndUpdate
      validator: function (el) {
        return el === this.password
      },
      message: 'Passwrods are not the same',
    },
  },
})

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()

  // Hash the password with a cost of 12 CPU
  // The cost is how much CPU process will need
  // The hash is an asynchrounous version
  this.password = await bcrypt.hash(this.password, 12)

  // Delete the passwordConfirm fiel
  // We set to be required as input, but not persisted in the DB
  this.passwordConfirm = undefined
  next()
})

// we create an instance method that all documents can access
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // the compare function of bcrypt encrypt the first argument and compare it
  // with the second
  return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User
