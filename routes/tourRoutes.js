
const express=require('express')
const tourController=require('../controllers/tourController') //This contains an object having all exports
const authController=require('../controllers/authController')

//For implementing nested routes
//const reviewController=require('../controllers/reviewController')
const reviewRouter=require('./reviewRoutes')

const tourRouter=express.Router();


//param middleware - This middleware will run if there is a variable id mentioned in url otherwise won't
tourRouter.param("id",(req,res,next,val)=>{
    console.log(`Tour id is ${val}`)
    next();
})

//Creating a body check parameter for post method

const checkBodyMiddleware=(req,res,next)=>{
    if(!( "name" in req.body) || !("price" in req.body)){
            return res.status(400).send("Bad request. Specified items not present")
    }
    
    console.log(req.body)
    next()
}

//Finding Tours within a specified radius
// /tours-within?distance=233$center=-40,45&unit=mi  -- Like query
// /tours-within/233/center/-40,45/unit/mi - More prettier than query
tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)

//Calculating distances to all tours from our coordinates
tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

tourRouter.route('/').get(tourController.getAllTours).post(authController.protect,authController.restrictTo('admin','lead-guide'),checkBodyMiddleware,tourController.createTour) //In the post method it will first run the checkBody middleware then if it encounter next() then the next middleware will run.
tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours)
tourRouter.route('/tour-stats').get(tourController.getTourStats)
tourRouter.route('/monthlyplan/:year').get(tourController.getMonthlyPlan)
tourRouter.route('/:id').get(tourController.getTour).delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour).patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.uploadTourImages,tourController.resizeTourImages,tourController.updateTour)

//Nested routes
// Examples👇
//POST /tour/1231sd12/reviews
//GET /tour/1231sd12/reviews
//GET /tour/1231sd12(TourID)/reviews/342343fe(reviewID)

//tourRouter.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview)

//Instead of doing like above we can forward to reviewRoute cause the above methods(POST and GET) is same as that of in the reviewRoutes
tourRouter.use('/:tourId/reviews',reviewRouter) //Since tourRouter is a  middleware we can use 'use' method

module.exports=tourRouter;