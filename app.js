const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json()) // to read the req object
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use('/api/v1/tours', tourRouter) // we use a router to handle all request for that path
app.use('/api/v1/users', userRouter)

/**
 * We use 'all' method to use this router for every HTTP method
 * We use the '*' all url possible
 **/
app.all('*', (req, res, next) => {
  /**
   * if we pass an argument to the 'next' function express will know
   * that an error happened and the next middleware that will trigger
   * if the error middleware.
   * If we use a class error create, pass a new instance of that class to 'next' method
   **/
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404)
})

/**
 * If we use and middleware with a callback that take 4 arguments
 * Express will know that this is an error handling middleware
 **/
app.use(globalErrorHandler)

// 4) START SERVER
module.exports = app
