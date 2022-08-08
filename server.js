const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './.config.env' })

const app = require('./app')

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)

// using mongoose to connect to mongodb
// this connect method returns a promise
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`)
})

/**
 * We use process.on to subscribe to all the possible unhandled rejections that
 * may occurs and we no have any backup. So, this is our final backup for all
 * errors.
 * Here we use the 'server.close()' to await to all handled request finish
 * before 'exit' the process
 **/
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down the app...')
  console.log(`Error: ${err.name}. Message: ${err.message}`)
  server.close(() => {
    process.exit(1)
  })
})
