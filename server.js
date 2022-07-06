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
  })
  .then(() => console.log('DB connection successful!'))

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
})

const Tour = mongoose.model('Tour', tourSchema)

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// })

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc)
//   })
//   .catch((err) => {
//     console.log('ERROR :c', err)
//   })

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App running on port ${port}`)
})
