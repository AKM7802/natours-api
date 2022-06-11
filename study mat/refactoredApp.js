const fs=require('fs')
const express=require('express')

//App use and middleware
const app=express();
app.use(express.json());

//File read
const tours=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours_simple.json`))


const getAllTours=(req,res)=>{
    res.status(200).json({
        status:"Success",
        results:tours.length,
        data:{
            tours
        }
    });
}

const getTour=(req,res)=>{
    const reqUrl=req.params.id*1
    const tour=tours.find(el=>el.id===reqUrl);
    if(!tour) return res.status(404).send("ID NOT FOUND.")

    res.status(200).json({
        status:"Success",
        data:{
            tour
        }
    })
}

const createTour=(req,res)=>{
    const newId=tours[tours.length-1].id+1;
    const newTour=Object.assign({id:newId},req.body);  //Object.assign joins 2 objects 
    console.log(req.body)
    tours.push(newTour);
    console.log(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours_simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        })
    })

}

const deleteTour=(req,res)=>{
    const urlId=req.params.id * 1;
    tours.splice(tours.findIndex(el=>el.id===urlId),1)
    console.log(tours)

    if(!tours) return res.status(404).send("No such id");

    res.status(204).json({
        status:"Success",
        data:null
    })

}

const updateTour=(req,res)=>{
    const urlId=req.params.id * 1 
    const tour=tours.find(el=>el.id === urlId)
    if(!tour) return res.status(404).json({
        status:"Failed",
        message:"invalid ID"
    })
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
}

const getAllUsers=(req,res)=>{
    res.status(404).send("Error fetching Users")
}

const createUser=(req,res)=>{
    res.status(404).send("Error creating user.")
}

const getUser=(req,res)=>{
    res.status(404).send("Error fetching specified user")
}

const deleteUser=(req,res)=>{
    res.status(404).send("Error deleting user")
}

const updateUser=(req,res)=>{
    res.status(404).send("Error updating user")
}

// app.get('/api/v1/tours',getAllTours)
// app.get('/api/v1/tours/:id',getTour)
// app.post('/api/v1/tours',createTour)
// app.delete('/api/v1/tours/:id',deleteTour)
// app.patch('/api/v1/tours:id',updateTour)


//Refactoring further - combining codes with same routes
// app.route('/api/v1/tours').get(getAllTours).post(createTour)
// app.route('/api/v1/tours/:id').get(getTour).delete(deleteTour).patch(updateTour)

// app.route('/api/v1/users').get(getAllUsers).post(createUser)
// app.route('/api/v1/users/:id').get(getUser).delete(deleteUser).patch(updateUser)

//Further refactoring using mounting router
   //Creating a router
const tourRouter=express.Router();
const userRouter=express.Router();

tourRouter.route('/').get(getAllTours).post(createTour)
tourRouter.route('/:id').get(getTour).delete(deleteTour).patch(updateTour)

userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).delete(deleteUser).patch(updateUser)

//Mounting Router into a route using middleware
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)

//It is further refactored into different files which includes routes and contoller folders and server and entry js file


app.listen(8800,()=>console.log("Server Started at 8800"))