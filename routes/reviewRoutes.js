const express=require('express')
const reviewController=require('../controllers/reviewController')
const authController=require('../controllers/authController')

const reviewRouter=express.Router({mergeParams:true}) //mergeParams is used to use the parameter (tourId in tourRoutes) from another routed url in the following methods of POST and GET

reviewRouter.use(authController.protect)

//GET /reviews - (0)
//POST /tour/12edq12/reviews
//GET /tour/12edq12/reviews -(1)
//The above 3 urls follow the below routes 
reviewRouter.route('/')
    .get(reviewController.getAllReviews) //If there is an id in url like (1) we get all reviews of that tour, if not (like(0)) then we get reviews of every tour
    .post(authController.protect,authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.createReview)

reviewRouter.route('/:id').delete(reviewController.deleteReview).get(reviewController.getReview).patch(authController.restrictTo('user','admin'),reviewController.updateReview);


module.exports=reviewRouter