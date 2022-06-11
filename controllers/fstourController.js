const fs=require('fs')

const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours_simple.json`))

exports.getAllTours=(req,res)=>{
    res.status(200).json({
        status:"Success",
        results:tours.length,
        data:{
            tours
        }
    });
}

exports.getTour=(req,res)=>{
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

exports.createTour=(req,res)=>{
    const newId=tours[tours.length-1].id+1;
    const newTour=Object.assign({id:newId},req.body);  //Object.assign joins 2 objects 
   
    tours.push(newTour);
   
    fs.writeFile(`${__dirname}/../dev-data/data/tours_simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        })
    })

}

exports.deleteTour=(req,res)=>{
    const urlId=req.params.id * 1;
    tours.splice(tours.findIndex(el=>el.id===urlId),1)
    console.log(tours)

    if(!tours) return res.status(404).send("No such id");

    res.status(204).json({
        status:"Success",
        data:null
    })

}

exports.updateTour=(req,res)=>{
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