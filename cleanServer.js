//This should be given at begenning so that it can display the error at which it happens
//An extra safety measure to handle uncaught exception EG:- console.log(x) gives error as x is not defined so give following error details
process.on('uncaughtException',err=>{
    console.log(err)
    console.log(err.name,err.message);
    console.log('UNCAUGHT EXCEPTION! 🫑 Shutting down...')
    process.exit(1); //1 stands for uncaught exception and 0 for success
  
})

const app=require('./entry')
const dotenv=require('dotenv')
const mongoose=require('mongoose')




//Connecting to config file
dotenv.config({path:"../config.env"})

//Connecting to database
const db=process.env.DATABASE.replace('<password>',process.env.DATABASE_PASS)


mongoose.connect(/*process.env.DATABASE_LOCAL*/ db ,{
    useNewUrlParser:true,
    useUnifiedTopology:true
    
}).then(()=>console.log("DB CONNECTION SUCCESSFUL"))


//npm install -g ndb To install debugger
const server=app.listen(8800,()=>console.log("Server started at 8800"))


//An extra safety measure to handle rejected promises
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log('UNHANDLED REJECTION! 🫑 Shutting down...')
    server.close(()=>{
        process.exit(1); //1 stands for uncaught exception and 0 for success
    })
})
// console.log(x) To check uncaught exception error



