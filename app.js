const fs = require('fs')
const express = require('express')
const morgan = require('morgan')

const app = express()

// 1) MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json()) // to read the req object

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


const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

// 2) ROUTES HANDLERS
const getAllTours = (req, res) => {
  console.log(req.requestTime)
  res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  })
}

const getTour = (req, res) => {

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
}

const createTour = (req, res) => {
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
}

const updateTour = (req,res) => {
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
}

const deleteTour = (req,res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    })
  }

  res.status(204).json({
    status: 'success',
    data: null
  })
}

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined'
  })
}

const getUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined'
  })
}

const createUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined'
  })
}

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined'
  })
}

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined'
  })
}

// we use /api/v1/tours to versioning our API
// in case of future breaking changes
// app.get('/api/v1/tours/', getAllTours)

// we use ':id' to pass a param in url that will be attached
// in the req.params object.
// we can also add one that can be optional '/:otherId?'
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

// 3) ROUTES
// this create a new router middleware to isolate and
// create a sort of sub-app.
// This process is called: Mounting the router
const tourRouter = express.Router()
const userRouter = express.Router()

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour)

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser)

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser)

app.use('/api/v1/tours', tourRouter) // we use a router to handle all request for that path
app.use('/api/v1/users', userRouter)

// 4) START SERVER
const port = 3000
app.listen(port, () => {
  console.log(`App running on port ${port}`)
})


