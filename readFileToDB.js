const mongoose=require('mongoose')
const fs=require('fs')
const dotenv=require('dotenv')
const Tour=require('./models/tourModel')
const User=require('./models/userModel')
const Review=require('./models/reviewModel')

dotenv.config({path:'../config.env'})
const db=process.env.DATABASE.replace('<password>',process.env.DATABASE_PASS)

mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(con=>console.log("DB successfully connected"))


const tours=JSON.parse(fs.readFileSync('./dev-data/data/tours.json','utf-8'))
const users=JSON.parse(fs.readFileSync('./dev-data/data/users.json','utf-8'))
const reviews=JSON.parse(fs.readFileSync('./dev-data/data/reviews.json','utf-8'))

//Read items from file into DB

const importData=async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false}); //We need to turn validator and middlewares for password encryptions off since the password in the file is already encrypted
        await Review.create(reviews);
        console.log("Data successfully loaded")
    }catch(err){
        console.log(err)
    }
    process.exit() // Exit from terminal after import is done
}


const deleteData=async ()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("Data successfully deleted")
    }catch(err){
        console.log(err)
    }
    process.exit()
}

console.log(process.argv) // This reads the commands from terminal 
//EXAAMPLE👇
// node readFileToDB.js --import  (If this is the command then process.argv provides the below result)
// [
//   'C:\\Program Files\\nodejs\\node.exe',
//   'C:\\L\\UPLOADS\\Node\\nodeJS\\natours\\readFileToDB.js',
//   '--import'
// ]

if(process.argv[2]==="--import"){
    importData()
}else if(process.argv[2]==="--delete"){
    deleteData()
}

//node readFileToDB.js --delete - THIS WILL RUN deleteData() and similarly for --import