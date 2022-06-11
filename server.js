const app=require('./entry')
const dotenv=require('dotenv')
const mongoose=require('mongoose')

//Connecting to config file
dotenv.config({path:"../config.env"})
//console.log(process.env.DATABASE)
//npm i mongoose@5

//Connecting to database
const db=process.env.DATABASE.replace('<password>',process.env.DATABASE_PASS)


mongoose.connect(/*db*/ process.env.DATABASE_LOCAL ,{
    useNewUrlParser:true,
    useUnifiedTopology:true
    // useCreateIndex:true,
    // useFindAndModify:false
}).then(()=>console.log("DB CONNECTION SUCCESSFUL"))

//To create a document we must first create schema, then model and then the doc

//THE BELOW IS COPIED TO tourModel 
//Creating schema
const tourSchema=new mongoose.Schema({
    // name:String,
    name:{
        type:String,
        required:[true,'A tour must have a name'], // required:[boolean,ERROR_TO_SHOW_IF_NOT_HAPPENED]
        unique:true
    },
    rating:{
        type:Number,
        default:4.5
        
    },
    price:Number
})

// //Creating model
const Tour=mongoose.model('tour',tourSchema) // mongoose.model(COLLECTION_NAME,SCHEMA)

//This part will be in tourController
//Creating doc
const testTour=new Tour({
    name:"The Forest Hiker",
    rating:4.7,
    price:342
})
testTour.save().then(doc=>console.log(doc)).catch(err=>console.log("ERROR🫑",err))

app.listen(8800,()=>console.log("Server started at 8800"))