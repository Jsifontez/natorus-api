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
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  })
})

// 4) START SERVER
module.exports = app
