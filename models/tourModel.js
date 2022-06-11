const mongoose=require('mongoose')
//npm i validator
const validator=require('validator') //Custom DV from git
const User=require('./userModel')
const slugify=require('slugify')

//Creating schema
//DV-Data Validators
//validate is used as field name when using custom or importer DVs

const tourSchema=new mongoose.Schema({
    // name:String,
    name:{
        type:String,
/*DV*/   required:[true,'A tour must have a name'], // required:[boolean,ERROR_TO_SHOW_IF_NOT_HAPPENED]
        unique:true,
        trim:true, //Removes whitespaces from end and beginning
        maxlength:[40,'A tour must have less or equal to 40 characters'],//DV
        minlength:[2,'A tour must have more or equal to 2 characters'], //DV
       // validate:[validator.isAlpha,'All characters of tour name must be in characters '] //Custom DV imported from module validator
    },
    secretTour:{ // This is for query middleware
        type:Boolean,
        default:false
    },
    duration:{
        type:Number,
        required:[true,"A tour must have a duration"]
    },
    maxGroupSize:{
        type:Number,
        required:[true,"A tour must have a group size"]
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum:{ //DV (enum must be used only for string validations)
            values:['easy','medium','difficult'],
            message:'Difficulty must be either: easy,medium or hard'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],//DV
        max:[5,"Rating must be below 5.0"], //DV
        set:val=>Math.round(val*10)/10 //4.6666 , 46.666, 47, 4.7  - To round the values
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:4.5
        
    },
    price:Number,
    priceDiscount:{
        type:Number,
        validate:{ //CUSTOM DV 
           validator:function(val) { //val is the value passed to priceDiscount
               //this always points to initial doc so this wont run on any update methods 
               return val<this.price
           },
           message:'Discount price ({VALUE}) should be below regular price' //VALUE === val This is not JS but rather mongodb so...
        }
    },
    summary:{
        type:String,
        trim:true, //Removes whitespaces from end and beginning
        required:[true,'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false // createdAt wont show when called but will be created
    },
    startDates:[Date],
    startLocation:{
        //GeoJSON (For location details) - It is not a schema type objects like before mentioned. The take objects like type, coordinates etc in whichwe specify the schema type option like inside the type we mention its schema type option. So it is moreover like an embedded object

        type:{
            type:String,
            default:"Point",
            enum:["Point"] //can support polygon, multi-polygon etc
        },
        coordinates:[Number], //coordinates take 2 arguments inside array First longitude then Latitude coordinates:[long,lat]
        address:String,
        description:String
    },
    locations:[
        //GeoJSON
        {
            type:{
                type:String,
                default:"Point",
                enum:["Point"]
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
        
    ],
    // guides:Array //Example for Embedded data model. Here the guides will have ids of users which using middleware before save, finds and place the data in that position which then is saved to DB.
    //Reference type👇
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"user"   //To replace the objectIds with the user data we need to use .populate('guides') to the query(Eg:- getTour,getTours,etc) or as middleware for all find operaions
        }
    ],
    slug:{
        type:String,
        unique:true
    }
    
},
    { //2nd object to enable virtuals
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    })

//Example for Embedded data model (guides:Array)
//{"name":"Embed test",
// "duration":1,
// "maxGroupSize":1,
// "difficulty":"easy",
// "price":200,
// "summary":"Test Tour",
// "imageCover":"tour-3-cover.jpg",
// "ratingsAverage":4,
// "guides":[
//     "61dc3a957bfc2cacecea7a44",
//     "61dc3b226a8d0c8813b8f05e"
//     ]
// }
//If we give above in PostTour method we will get the ids in guides replaced with the user Data

//Creating index in database So that We can fetch info quicker while querying
//We can use .explain() to see the details in getAllTours method
//QueryExample {{URL}}api/v1/tours?price[lt]=1000&ratingsAverage[gte]=4.7 
// tourSchema.index({price:1}) //1- Ascending ,-1 - Descending
tourSchema.index({price:1,ratingsAverage:-1}) //We can create multiple indexes based on the possible usage frequency of querying and the index takes more space than the whole doc itself so use carefully

tourSchema.index({startLocation: '2dsphere'}) //2dSphere of rela points in earth surface

//Virtual properties -These will not be stored in database and hence cannot make moderations to it
//To enable this we need to act a second object to schema
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
})

//Virtual populate - It does not store the array of reviews corresponding to its tour in the database of tour instead it links the review to tourModel and populte the review when we use getTour method
//We need to populate this column created ,so that is done in tour controller under exports.getTour
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'  //To link the field name 'tour' from reviewModel to the '_id' in tourModel so that it fetches the details of the tour id from review model corresponding to the id mentioned in the tour field

})

//DOCUMENT MIDDLEWARE : runs before .save() and .create() SO we need to use POST method to enable this middlware
//this returns the document we are sending using POST
//pre means it runs before the method specified sends data and post runs after the method specified sends data

tourSchema.pre('save',function(next){
   // console.log(this);
    next()
})
//We can use many pre  middlewares
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name) //To create a slug we use slugify package

    console.log("Will save document...")
    next()
})

//For Embedd data model👇
// tourSchema.pre('save',async function(next){ //For Embedded data example
//     const guidePromises=this.guides.map(async id=>await User.findById(id)); //map(Since it has findById()) will provide an array of promise 
//     this.guides=await Promise.all(guidePromises) //To convert an array of promises to datas
//     next();

// })

tourSchema.post('save',function(doc,next){
   // console.log(doc)
    next()  //post returns final document after assigning id by DB and also the virtual properties
})

//Query Middleware
//this points to the query
// tourSchema.pre('find',function(next){
//     this.find({secretTour:{$ne:true}}) //It then shows only the documents with secret tour equals false and the one with true will be hidden
//     next();
// })
//The above will not work for findById so we use a reqular expression instead so it works for every command which starts with find
tourSchema.pre(/^find/,function(next){

    this.find({secretTour:{$ne:true}});
    next()
})

//For References data model - i.e for replacing the object ids with data
// tourSchema.pre(/^find/,function(next){
//     this.populate({
//         path:'guides',
//         select:'-__v -passwordChangedAt'
//     })
// })

tourSchema.post('find',function(doc,next){
    //console.log(docs) It will return the result of find()
    next()
})


//Aggregation middleware
//this returns the agrregation object er are sending
//this.pipeline() will be the location where our datas will be present

// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}}) //unshift adds data at the beginning of array
//     //console.log(this.pipeline())
//     next()
// })


//Creating model
const Tour=mongoose.model('tour',tourSchema) // mongoose.model(COLLECTION_NAME,SCHEMA)

module.exports=Tour;