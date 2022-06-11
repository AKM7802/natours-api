module.exports=fn=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(err=>next(err)) //next(err) forward err to the error middleware we created
    }
}