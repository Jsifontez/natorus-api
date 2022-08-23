const crypto = require('crypto')
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
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

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  // only compare if the document has the property 'changedPasswordAt'
  if (this.passwordChangedAt) {
    // JWTTimestamp comes in seconds. Because that we need to change the
    // changedPasswordAt to the same unit
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )

    // if the token was requested after changed it means that the token
    // doesn't worked anymore
    return JWTTimestamp < changedTimestamps
  }

  // False means NOT changed
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  // password reset token should be a random string but not cryptographic strong as jwt hash
  // so, we use a random string created with crypto module of node
  const resetToken = crypto.randomBytes(32).toString('hex')

  // we should not store a plain reset token in the DB. Because some attacker
  // can get access to our DB and get access to the user. To avoid that we need
  // to encrypt but not strong as the jwt
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  console.log({ resetToken }, this.passwordResetToken)

  this.passwordResetExpires = Date.now + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
