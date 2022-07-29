const express = require('express')
const tourController = require('../controllers/tourController')

// this create a new router middleware to isolate and
// create a sort of sub-app.
// This process is called: Mounting the router
const router = express.Router()

// router.param('id', tourController.checkID)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

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
