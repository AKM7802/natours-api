const Review=require('../models/reviewModel')
const catchAsync=require('../utils/catchAsync')
const factory=require('./handlerFactory')

// exports.getAllReviews=catchAsync(async (req,res,next)=>{
//     //The below 2 lines allow to get all reviews of a particular tour
//     let filter={};
//     if(req.params.tourId) filter={tour:req.params.tourId}

//     const reviews=await Review.find(filter);

//     res.status(200).json({
//         status:"success",
//         results:reviews.length,
//         data:{
//             reviews
//         }
//     })
// })
exports.getAllReviews=factory.getAll(Review)

exports.getReview=factory.getOne(Review)

// exports.createReview=catchAsync(async (req,res)=>{
//     //The following 2 steps for nested routes
//     if(!req.body.tour) req.body.tour=req.params.tourId;
//     if(!req.body.user) req.body.user=req.user.id;

//     const newReview=await Review.create(req.body);

//     res.status(200).json({
//         data:{
//             review:newReview
//         }
//     })
// })
exports.setTourUserIds=(req,res,next)=>{
    if(!req.body.tour) req.body.tour=req.params.tourId;
    if(!req.body.user) req.body.user=req.user.id;
    next()
}
//The above is used as middleware in route so that it allows nested routes
exports.createReview=factory.createOne(Review)

exports.updateReview=factory.updateOne(Review)
exports.deleteReview=factory.deleteOne(Review)