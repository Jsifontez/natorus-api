const express = require('express')
const morgan = require('morgan')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json()) // to read the req object
app.use(express.static(`${__dirname}/public`))

// middleware that is goind to executed of second
// this is a global middleware (is executed before any route)
app.use((req, res, next) => {
  console.log('Hello from the middleware')
  // we need to execute de next() function or else
  // we won't be able to finish our execution
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use('/api/v1/tours', tourRouter) // we use a router to handle all request for that path
app.use('/api/v1/users', userRouter)

// 4) START SERVER
module.exports = app
