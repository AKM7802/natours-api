const catchAsync=require('../utils/catchAsync')
const appError=require('../utils/appError')
const APIFeatures=require('../utils/apiFeatures')

// exports.deleteTour=catchAsync(async (req,res,next)=>{
//    const tour=await Tour.findByIdAndDelete(req.params.id) 
//     if(!tour){ //To handle 404 Error
//         return next(new appError('No tour found with the specified ID',404))
//     }
//     res.status(204).json({
//         status:"Success",
//         data:null
//     })
//     }
// )
//The above is made universal by introducing another parameter Model so that we can use it for tour,user,reviews etc
exports.deleteOne= Model =>catchAsync(async (req,res,next)=>{
   

    const doc=await Model.findByIdAndDelete(req.params.id) 

    if(!doc){ //To handle 404 Error
        return next(new appError('No document found with the specified ID',404))
    }

    res.status(204).json({
        status:"Success",
        data:null
    })

   }
)

//Similarly for update and create

exports.updateOne=Model=> catchAsync(async (req,res,next)=>{

    //This should be run in PATCH method and not in PUT
    const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true //ONLY THEN DVs WILL WORK WHICH IS PRESENT IN SCHEMA IN tourModels
    })

    if(!doc){ //To handle 404 Error
        return next(new appError('No document found with the specified ID',404))
    }

    res.status(200).json({
        status:"success",
        updatedData:{
            doc
        }
    })


}
)

exports.createOne=Model=>catchAsync(async(req,res)=>{
    const doc=await Model.create(req.body)
        res.status(201).json({
            status:'success',
           doc
        })
    
   
    }
)

exports.getOne=(Model,popOptions)=>catchAsync( async (req,res,next)=>{
    
    //The below two lines is to check if the data is a reference type and if so we populate it (Mainly used in tourController in getTour)
    let query=Model.findById(req.params.id)
    if(popOptions) query=query.populate('reviews')
    
    const doc=await query
    if(!doc){ 
        return next(new appError('No document found with the specified ID',404))
    }

    res.status(200).json({
        status:"Success",
        data:{
            doc
        }
    })

}
)

exports.getAll=Model=>catchAsync(async (req,res,next)=>{

    //For nested routes for getAllReviews
    let filter={};
    if(req.params.tourId) filter={tour:req.params.tourId}

    const features=new APIFeatures(Model.find(filter),req.query).filter().sort().fieldLimit().page()
    // const doc=await features.query.explain()
    const doc=await features.query
    res.status(200).json({
    status:"Success",
    results: doc.length,
    data:{
        doc
    }
});
}
    
)
