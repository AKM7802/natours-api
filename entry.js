const fs=require('fs')
const express=require('express')
const ErrorController=require('./controllers/errorController')
const AppError=require('./utils/appError')
const rateLimit=require('express-rate-limit') //npm package to limit number of requests from a single ip address
const helmet=require('helmet')//It specifies some security headers
const mongoSanitize=require('express-mongo-sanitize') //NPM package to Sanitize data
const xss=require('xss-clean')//NPM package to sanitize data

const cors=require('cors') //cross origin resource origin - To allow another website to use this app 
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')
const reviewRouter=require('./routes/reviewRoutes')

const app=express();

//Implement CORS
app.use(cors());  //This allows only simple requests like GET and POST
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
// origin:"https://www.natours.com"
// }))

app.options('*',cors()) //For non simple requests like delete ,patch, use cookies etc
//app.options('/api/v1/tours/:id',cors())

//Security middlewares



//Set security http headers
app.use(helmet())

//req from ip limiter
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000, //This allows a max of 100 requests for 1 hour from a single ip
    message:"Too many requests from this ip . Please try again after some time."
})

app.use('/api',limiter);



//body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'})); //size above 10kb cannot be sent

//Data sanitization against NOSQL query injection EG:- "email":{"$gt":""} - When we give this and any correct password of any user we get logged in , so to avoid that this middleware remove the symbloes like $ from req.body
app.use(mongoSanitize())

//Data sanitization against XSS - Removes Html tags from req body
app.use(xss())


app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)

app.use('/',(req,res)=>{
    res.end("Wellcome to some page.")
})


//(ERROR HANDLING) FOR UNHANDLED ROUTES i.e for routes other than above the below error will show

app.all('*',(req,res,next)=>{ //all - means  every method(GET,POST etc) 
    //SENDING A RESPONSE IN THE TRADITIONAL MANNER

    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on the server`
    // })

    //SPECIFYING AS ERROR AND SENDING DETAILS IN THE ERROR MIDDLEWARE CREATED BELOW

    //WITHOUT USING THE ERROR CLASS WE CREATED
    // const err=new Error(`Can't find ${req.originalUrl} on the server`);
    // err.status='fail';
    // err.statusCode=404;
    // next(err); //Any arguments given inside next() will go to error middleware created

    //USING THE ERROR CLASS WE CREATED
    next(new AppError(`Can't find ${req.originalUrl} on the server`,404))

})

//Any middleware with 4 arguments refer to error handelling middleware
// app.use((err,req,res,next)=>{
//     console.log(err.stack) //this shows where the error is created

//     err.statusCode=err.statusCode || 500;
//     err.status=err.status || 'error';

//     res.status(err.statusCode).json({
//         status:err.status,
//         message:err.message
//     })
// })


//Exporting to a different file named errorController
app.use(ErrorController)


module.exports=app;