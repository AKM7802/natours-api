const mongoose=require('mongoose');
const Tour = require('./tourModel');

const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,"Review cannot be empty"]
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'tour',
        required:[true,"Review must belong to a tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user', //This should be the name of the collection, i.e the name we give in ' ' alongside schema while creating model 
        required:[true,'Review must belong to a user']
    }
})

//To prevent duplicate reviews we write the following code which allows review to have unique tour and user id at a time
reviewSchema.index({tour:1,user:1},{unique:true})


reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     select:"name photo"
    // })
    
    //We dont need tour info while using virtual populate in tourModel
    this.populate({
        path:'user',
        select:"name photo"
    })

    next();
})

//To calculate average and number of ratings for a particular tour and update that in that tour db
//It is a staic method so we call call directly by Review without creating its instance EG:- Review.calcAverageRatings
reviewSchema.statics.calcAverageRatings=async function(tourId){
   const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    console.log(stats);

    //To update in database
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })
}
//Now to implement the above when new review is created
reviewSchema.post('save',function(){
    this.constructor.calcAverageRatings(this.tour) //this.constructor refers to Review which cannot be write like that since it is declared later
})

//To implement average while updatind or deleting review 
// findByIdAndUpdate
// findByIdAndDelete
// The Above is same as findOneAnd.... 

//Since find returns a query we cannot directly perform the calculateAverageRatings function so in pre we store the query as an object in 'r' 
//and in post we perform the calc function inside the constructor of the stored model
reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r=await this.findOne().clone();
   
   // console.log(this.r);
    next()
})

reviewSchema.post(/^findOneAnd/,async function(){
   
    await this.r.constructor.calcAverageRatings(this.r.tour) //this.r.constructor returns the Review Model
})

const Review=mongoose.model('Review',reviewSchema)
module.exports=Review;
