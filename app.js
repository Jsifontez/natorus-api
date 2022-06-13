const fs = require('fs')
const express = require('express')

const app = express()

app.use(express.json())

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' })
// })

// app.post('/', (req, res) => {
//   res.send('You cand post to this endpoint...')
// })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

// we use /api/v1/tours to versioning our API
// in case of future breaking changes
app.get('/api/v1/tours/', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  })
})

// we use ':id' to pass a param in url that will be attached
// in the req.params object.
// we can also add one that can be optional '/:otherId?'
app.get('/api/v1/tours/:id', (req, res) => {

  // the elements in the params objects are all string
  // we need to convert that id into a number
  const id = req.params.id * 1
  const tour = tours.find(el => el.id === id)

  // checking if the id is greater than the tour existed
  // also we want to check allways is the request of the user
  // is valid or don't have malicious code
  // if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    })
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  })
})

app.post('/api/v1/tours', (req, res) => {
  // we need to handle the creation of new id to sent it to the DB
  // so we need use a best practice to create one
  const newId = tours[tours.length - 1].id + 1

  // we use Object.assign to merge two objects in a single one.
  // in this case is our newId and the data coming from the body
  const newTour = Object.assign({ id: newId}, req.body)

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  })
})

app.patch('/api/v1/tours/:id', (req,res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    })
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  })
})

const port = 3000
app.listen(port, () => {
  console.log(`App running on port ${port}`)
})


