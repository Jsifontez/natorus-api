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
app.listen(port, () => {
  console.log(`App running on port ${port}`)
})
