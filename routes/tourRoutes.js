const express = require('express')
const tourController = require('../controllers/tourController')

// this create a new router middleware to isolate and
// create a sort of sub-app.
// This process is called: Mounting the router
const router = express.Router()

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

module.exports = router