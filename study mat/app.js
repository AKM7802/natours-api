const fs=require('fs')
const express=require('express')

const morgan=require('morgan') //Middleware

const app=express();

//MIDDLEWARE FOR POST HTTP METHOD
app.use(express.json());

app.use(morgan('dev')); //An npm module to log http request


const tours=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours_simple.json`))


//Custom Middleware
app.use((req,res,next)=>{
    console.log("Hello from the middleware❤️")
    next(); //It is required so that following lines will get called
})



app.get('/api/v1/tours',(req,res)=>{
    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            tours
        }
    })
})

app.post('/api/v1/tours',(req,res)=>{
    //req.body only works if there is a middleware so first use middleware before post method
    
    //console.log(req.body) //req.body allows to create json file in postman under body > raw > JSON  option
    
    const newId=tours[tours.length-1].id+1;
    const newTour=Object.assign({id:newId},req.body);  //Object.assign joins 2 objects 

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours_simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        })
    })

})

//responding to url parameters

app.get('/api/v1/tours/:id',(req,res)=>{    // ":"-To define variables , "id" is the variale name
   // console.log(req.params) //It shows the variable and its value
    
    const urlId=req.params.id * 1 //*1 is used to convert the string to integer

    const tour=tours.find(el=>el.id === urlId)

    if(!tour) return res.status(404).json({
        status:"Failed",
        message:"invalid ID"
    })

    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })

    
})



//PATCH - IT UPDATES ONLY THE PLACES WHERE ANY CHANGE HAS OCCURED
app.patch('/api/v1/tours/:x',(req,res)=>{

    
    const urlId=req.params.x * 1 //*1 is used to convert the string to integer

    const tour=tours.find(el=>el.id === urlId)

    if(!tour) return res.status(404).json({
        status:"Failed",
        message:"invalid ID"
    })
    
    //Code to change the updated data
    let newTour =tour;
    for(i in tour){
        if(i in req.body){
            newTour[i]=req.body[i]
        }
    }

    
    res.status(200).json({
        status:"success",
        data:{
            tour:newTour
        }
    })

})

//The below middleware will only run if we use the method below it, in this case the delete method
app.use((req,res,next)=>{
    console.log("Second hello from middleware🌍")
    next();
})

//DELETE METHOD

app.delete('/api/v1/tours/:id',(req,res)=>{

    //CODE TO DELETE THAT PROPERTY 
    const urlId=req.params.id * 1;
    tours.splice(tours.findIndex(el=>el.id===urlId),1)
    console.log(tours)

    res.status(204).json({
        status:"Success",
        data:null
    })
})





app.listen(8000,()=>console.log("Listening at port 8000"))
