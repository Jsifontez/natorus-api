
const fs = require('fs')

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

// 2) ROUTES HANDLERS (CONTROLLERS)
exports.getAllTours = (req, res) => {
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

exports.getTour = (req, res) => {

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

exports.createTour = (req, res) => {
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

exports.updateTour = (req,res) => {
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

exports.deleteTour = (req,res) => {
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
