const User=require('../models/userModel')
const sharp=require('sharp'); //Sharp is an image processiong library in nodeJS
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory=require('./handlerFactory')
const multer=require('multer') // It is a middleware to handle multi-part form data which is a coding that's used to upload files from a form

//MULTER THINGS FOR PIC UPLOADS
//form-data(instead of raw in body) is used inside postman to upload multi-part datas

//For storage and filename Configuration
// const multerStorage=multer.diskStorage({  
//     destination:(req,file,cb)=>{ //cb is callback function .In cb is where we write the destination path in case of this and filename in case of filename
//         cb(null,'../Natours Server Rendering/public/img/users'); //cb takes 2 arguments . First one is error and second one iss the data .If no error to be specified write null
//     },
//     filename:(req,file,cb)=>{
//         //Filename should be in format user-userid-timestamp.extention . userid is used to replace newly updated file inplace of old file
//         const extention=file.mimetype.split('/')[1];  //File contains all info about file. mimetype is where the type and extention of file exist
//         cb(null,`user-${req.user.id}-${Date.now()}.${extention}`)
//     }
// })

//We do not need the above bcuz when using sharp we store the photo in memory and not in disc so we use the following
const multerStorage=multer.memoryStorage()



//Filter is used to check if the uploading files are images or not
const multerFilter=(req,file,cb)=>{ 
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image! Please upload only images.',400),false);
    }
}


//The below is for simple uploads 
//const upload=multer({dest:'../Natours Server Rendering/public/img/users'}) //dest is used to store the uploaded file in a destination but it also runs without dest but it will be stored in memory and not in disc

//For Advanced upload use the bello code
const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadUserPhoto=upload.single('photo')  //single means we upload only 1 image and the name of the field is mentioned inside single
//form-data(instead of raw in body) is used inside postman to upload multi-part datas

exports.resizeUserPhoto=catchAsync(async (req,res,next)=>{
    if(!req.file) return next();

    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`

    //The image in memory can be accessed using req.file.buffer. Sharp is used to convert the file to square size and change the extention to jpeg and then is stored on the disc in the specified path
    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`../Natours Server Rendering/public/img/users/${req.file.filename}`)

    next()
})



//To filter the fields we require from req.body
const filterObj=(obj,...allowedFields)=>{  
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el]=obj[el]
    })
    return newObj
}

// exports.getAllUsers=async (req,res)=>{

//     const users=await User.find()

//     res.status(200).json({
//         status:"Success",
//         data:{
//             users
//         }
//     })
// }
exports.getAllUsers=factory.getAll(User)

//To update email ,name etc other than password
exports.updateMe=async(req,res,next)=>{
    // console.log(req.file)  //For getting info of uploaded file using multer

    // 1)Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.',400))
    }

    // 2)Update user document
    const filteredBody=filterObj(req.body,'name','email') //To fetch only the fields we allow them to change from the the details they entered in req.body

    if(req.file) filteredBody.photo=req.file.filename  //To add the updated photo

    const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredBody,{new:true,runValidators:true})

    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    })

}
exports.getMe=(req,res,next)=>{ //This acts as middleware which connects with getUser since most codes are same
    req.params.id=req.user.id;
    next()
}

//Here we are not actually deleting the user rather we are making it inactive so that if the user wants his account back we can make it active then
exports.deleteMe=catchAsync(async (req,res,next)=>{ //a miidleware before any find method is created which will run and take care of the rest process
    await User.findByIdAndUpdate(req.user._id,{active:false})
    res.status(200).json({
        status:"success",
        data:null
    })

})

//The below is already created as signup in authController
exports.createUser=(req,res)=>{ 
    res.status(404).send("Error creating user.")
}

// exports.getUser=async (req,res,next)=>{
//     const user=await User.findById(req.params.id)

//     if(!user) return next(new AppError("User not found",400));

//     res.status(200).json({
//         status:"success",
//         data:{
//             user
//         }
//     })
// }
exports.getUser=factory.getOne(User)

// exports.deleteUser=(req,res)=>{
//     res.status(404).send("Error deleting user")
// }
exports.deleteUser=factory.deleteOne(User)

// exports.updateUser=(req,res)=>{
//     res.status(404).send("Error updating user")
// }

exports.updateUser=factory.updateOne(User)