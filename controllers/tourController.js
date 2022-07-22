const Tour = require('../models/tourModel')

// 2) ROUTES HANDLERS (CONTROLLERS)
exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query)
    // BUILD QUERY
    // 1A) filtering
    const queryObj = { ...req.query }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach((el) => delete queryObj[el])

    // 1B) advanced filtering
    // create a string of queryObj
    let queryStr = JSON.stringify(queryObj)
    // replace globally the filtering options
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    // use the queryStr but in object
    let query = Tour.find(JSON.parse(queryStr))

    // 2) Sorting
    if (req.query.sort) {
      // we create a string of fields space separated
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      // we add a default sort
      query = query.sort('-createdAt')
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    } else {
      // we excluede the `__v` field created by mongo in the default query
      query = query.select('-__v')
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 100
    const skip = (page - 1) * limit

    // page=3&limit=10, 1-10, page 1; 11-20, page 2; 21-30, page 3
    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      const numTours = await Tour.countDocuments()
      if (skip >= numTours) throw new Error('This page does not exist')
    }

    // EXECUTE QUERY
    const tours = await query

    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy')

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    })
  }
}

exports.getTour = async (req, res) => {
  try {
    // a shorthand of Tour.findOne({ _id: req.params.id })
    const tour = await Tour.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    })
  }
}

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    })
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    })
  }
}

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    })
  }
}
