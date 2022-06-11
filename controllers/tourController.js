const Tour=require('../models/tourModel')
//Refactored Contents from getAllTours which is stored in utils
const APIFeatures=require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const appError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const factory=require('./handlerFactory')

//Multer more definition in userController
const multer=require('multer')
const sharp=require('sharp');

const multerStorage=multer.memoryStorage()
const multerFilter=(req,file,cb)=>{ 
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image! Please upload only images.',400),false);
    }
}
const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

//Since we need to upload multiple photos 
exports.uploadTourImages=upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
])


//if upload.single('image') ,the data can be fetched by req.file
//if upload.array('images',5) .the data can be fetched by req.files
//maxCount more than 3 are arrays so we use req.files


exports.resizeTourImages=catchAsync(async (req,res,next)=>{
    //console.log(req.files)
    
    if(!req.files.imageCover || !req.files.images) return next();


    //1) COVER IMAGE
    const imageCoverFilename=`tour-${req.params.id}-${Date.now()}-cover.jpeg`

    //The image in memory can be accessed using req.file.buffer. Sharp is used to convert the file to square size and change the extention to jpeg and then is stored on the disc in the specified path
    await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`../Natours Server Rendering/public/img/tours/${imageCoverFilename}`)
    req.body.imageCover=imageCoverFilename

    //2) Images
    req.body.images=[]
    await Promise.all(
        req.files.images.map(async (file,i)=>{
            const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({auality:90})
                .toFile(`../Natours Server Rendering/public/img/tours/${filename}`)
            
            req.body.images.push(filename);
        })
    )

    next()
})


//Creating a function to eliminate try catch block
// const catchAsync=fn=>{
//     return (req,res,next)=>{
//         fn(req,res,next).catch(err=>next(err)) //next(err) forward err to the error middleware we created
//     }
// }

//Predifined queries for 'top-5-cheap' route
exports.aliasTopTours=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
}


exports.getAllTours=async (req,res)=>{

    try{
        //localhost:8800/api/v1/tours?duration=5&rating=4.5 - AFTER ? IS QUERIES WHICH CAN BE ACCESSED BY req.query WHICH GIVES AN OBJECT
        // console.log(req.query)
       
        //WITH QUERY
        //const tours=await Tour.find(req.query)
        //OR
        //const tours=await Tour.find({ duration: '5', rating: '4.5' })
        //OR
        //const tours=await Tour.find().where(duration).equals(5).where(rating).equals(4.5)
//----------------------------------------------------------------------------------------
        //FILTERING
        //NOW PROPERLY MANIPULATING QUERIES
    //     const queryObj={...req.query} // To Duplicate 
    //     const excludeFields=['page','sort','limit','fields']; 
    //     excludeFields.forEach(el=>delete queryObj[el]) //To exclude the above items from query

    //     //const tours=await Tour.find(queryObj)
        
    //     //ADVANCED QUERY OPEARTIONS
    //     //localhost:8800/api/v1/tours?duration[gte]=5&rating=4.5&page=2 - THIS IS HOW GREATER THAN etc SHOULD BE SPECIFIED 
    //     //{ duration: { gte: '5' }, rating: '4.5', page: '2' } - THIS IS HOW req.query RETURNS BUT WE NEED $ INFRONT OF gte FOR WORKING SO WE NEED TO REPLACE THAT
    //     let queryStr=JSON.stringify(queryObj)
    //     queryString = queryStr .replace(/\b(gte|gt|lte|lt)\b/g ,el=>`$${el}`) // /g-means replace all words if there is more than one , \b - means replace only the independent words specified and dont if it comes between other words
    //    // console.log(JSON.parse(queryString)) - Convert String to object
    //     let query=Tour.find(JSON.parse(queryString))

//----------------------------------------------------------------------------------------------------------------
        //SORTING
        // -ve means sort in descending order
        //localhost:8800/api/v1/tours?duration[lte]=5&rating[gte]=4.5&sort=-price,ratingsAverage
        // if(req.query.sort){
        //     const sortBy=req.query.sort.split(',').join(' ') // If there is more than one conditions then we need to remove the comma and add space so that it checks for all other specified conditions when more than one items have equal value.
        //     query=query.sort(sortBy)
        // }else{
        //     query=query.sort('-createdAt')
        // }

        //Field Limiting 
        //-ve means skip that field that show rest of fields
        //localhost:8800/api/v1/tours?fields=name,duration  EG2-  localhost:8800/api/v1/tours?fields=-name
        // if(req.query.fields){
        //     const fields=req.query.fields.split(',').join(' ')
        //     //query=query.select('name duration price') - Then it shows the specified fields only
        //     query=query.select(fields)
        // }else{
        //     query=query.select('-__v')
        // }

        //PAGINATION

        //page=2&limit=10, 1-10,page 1 , 11-20, page 20,21-30 page 3
        //query=query.skip(10).limit(10) //This means single page must contain only 10 data and so obviously we skip 10 data if the page number is 2

        // const page=req.query.page*1 ||1
        // const limit=req.query.limit*1 || 100
        // const skip=(page-1)*limit

        // query=query.skip(skip).limit(limit);
        // if(req.query.page){
        //     const numTours=await Tour.countDocuments();
        //     console.log(numTours)
        //     if(skip>=numTours) throw (" Pages Over")
        // }


        //Refactored material(from class)
        const features=new APIFeatures(Tour.find(),req.query).filter().sort().fieldLimit().page()
       // console.log(features)
        const tours=await features.query


        //const tours=await query - THIS IS FOR NON REFACTORED API FEATURES
        //WITHOUT QUERY
        //const tours=await Tour.find()
        res.status(200).json({
            status:"Success",
            results: tours.length,
            data:{
                tours
            }
        });

    }catch(err){
        res.status(400).json({
            status:"Error",
            message:err
        })
    }

    
}



//Using the created function to eliminate try catch block from below onwards
// exports.getTour= catchAsync( async (req,res,next)=>{
    
    
//         const tour=await Tour.findById(req.params.id).populate('reviews')//This populate is for virtualPopulate in tourMode
//         // Tour.findOne({_id:req.params.id})

//         //For reference data model
//        // const tour=await Tour.findById(req.params.id).populate('guides')
//         //OR
//         // const tour=await Tour.findById(req.params.id).populate({
//         //     path:'guides',
//         //     select:"-__v -passwordChangedAt"
//         // })  //We have mentioned populate as a middleware so we don't need to use this

//         if(!tour){ //To handle 404 Error
//             return next(new appError('No tour found with the specified ID',404))
//         }

//         res.status(200).json({
//             status:"Success",
//             data:{
//                 tour
//             }
//         })
    
//     }
// )
exports.getTour=factory.getOne(Tour,{path:"reviews"})

// exports.createTour=catchAsync(async(req,res)=>{
   
//     // const testTour=new Tour(req.body)
//     // testTour.save()

//         //OR

//     // Tour.create(req.body)        

   
//         const newTour=await Tour.create(req.body)
//         res.status(201).json({
//             status:'success',
//            tour:newTour
//         })
    
   
//     }
// )
exports.createTour=factory.createOne(Tour)


// exports.deleteTour=catchAsync(async (req,res,next)=>{
   

//     const tour=await Tour.findByIdAndDelete(req.params.id) 

//     if(!tour){ //To handle 404 Error
//         return next(new appError('No tour found with the specified ID',404))
//     }

//     res.status(204).json({
//         status:"Success",
//         data:null
//     })

//    }
// )
//We are generalising the delete method with handlerFactory
exports.deleteTour=factory.deleteOne(Tour);



// exports.updateTour=catchAsync(async (req,res,next)=>{

//         //This should be run in PATCH method and not in PUT
//         const uTour=await Tour.findByIdAndUpdate(req.params.id,req.body,{
//             new:true,
//             runValidators:true //ONLY THEN DVs WILL WORK WHICH IS PRESENT IN SCHEMA IN tourModels
//         })

//         if(!uTour){ //To handle 404 Error
//             return next(new appError('No tour found with the specified ID',404))
//         }

//         res.status(200).json({
//             status:"success",
//             updatedData:uTour
//         })
    
    
//     }
// )
exports.updateTour=factory.updateOne(Tour)

//AGGREGATION PIPELINE - MONGODB framework for aggregating data
exports.getTourStats=catchAsync(async(req,res)=>{
        const stats=await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    //_id:null, //if null then fetch all matches ,if for example 'difficulty' then it fetches and group together acoording to easy,medium and hard
                    //_id:'$difficulty',
                    _id:{$toUpper:'$difficulty'},
                    numTours:{$sum:1}, // Adds one when encountered with data that satisfy $match . Basically it is used to calculate number of data
                    numRatings:{$sum:'$ratingsQuantity'}, //$sum calculate sum
                    avgRating:{$avg:'$ratingsAverge'},
                    avgPrice:{$avg:'$price'}, //$avg calculate average
                    minPrice:{$min:'$price'},//$min finds out minimum value
                    maxPrice:{$max:'$price'} //$max finds out maximum

                }
            },
            {
                $sort:{avgPrice:1} //1 means ascending order
            }
            // {
            //     $match:{_id:{$ne:"EASY"}} //We can use match again but we need to specify the names present only in group cuz all other names will be removed by the time
            // }
        ])
        res.status(200).json({
            status:"success",
            data:{
                stats
            }
        })
   }
)

exports.getMonthlyPlan=catchAsync(async(req,res)=>{
    
        const year=req.params.year*1
        const plan= await Tour.aggregate([
            {
                $unwind:'$startDates' //Unwind the array startDates into multiple objects
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push:'$name'} //Push creates an array and push into that array
                }
            },
            {
                $addFields:{month:'$_id'}// Creates an extra fields named month and assing the value od id to it
            },
            {
                $project:{
                    _id:0  //0 means id wont be showing, if it is 1 then id will be displayed
                }
            },
            {
                $sort:{
                    numTourStarts:-1
                }
            },
            {
                $limit:12 //Only 12 results will be showed
            }

        ])
        res.status(200).json({
            status:"Success",
            data:{plan}
        })


    }
    
)

//For finding tours within a specified radius

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/-40,45/unit/mi
exports.getToursWithin=catchAsync(async (req,res,next)=>{
    const {distance,latlng,unit}=req.params;
    const [lat,lng]=latlng.split(',');

    //The radius must be in radians to be used within centerSphere
    //dist/radius_of_Earth - To convert to radians 
    //Unit can be miles(mi) or km
    const radius=unit==='mi' ? distance/3963.2 : distance/6378.1 

    if(!lat || !lng){
        next(new AppError("Please provide latitide and longitue in the format lat,lng.",400))
    }

   // console.log(distance,lat,lng,unit);

    //WE use geospatial queries here
    //Inorder to use geoSpatial queries we need to attribute an index for geoSpatial data Which is done in tourModel
    const tours=await Tour.find({startLocation:{ $geoWithin: {$centerSphere:[[lng,lat],radius]} }})

    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            data:tours
        }
    })
})

//Calculating distances to all tours from our coordinates
exports.getDistances=catchAsync(async (req,res,next)=>{
    const {latlng,unit}=req.params;
    const [lat,lng]=latlng.split(',');

    //To convert meters to miles or km
    const multiplier=unit==="mi" ? 0.000621371 : 0.001

    if(!lat || !lng){
        next(new AppError("Please provide latitide and longitue in the format lat,lng.",400))
    }

    //geoNear should be always in the beginning of the pipeline and it is the only geoSpatial query for a pipeline
    const distances=await Tour.aggregate([
        {
            $geoNear:{
                near:{             //From where to calculate distances
                    type:"Point",
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance', //The name of the field
                //distanceMultiplier: 0.001 //Output distance will be in meters so to convert to km we multiply by 0.001
                distanceMultiplier:multiplier
            }                                                  
        },
        {
            $project:{  // To select which of the fields should show in the output
                distance:1, //1 means true i.e distance should be shown
                name:1
            }
        }
    ])

    res.status(200).json({
        status:"Success",
        data:{
            distances
        }
    })
})