const { builtinModules } = require("module");

class APIFeatures{
    constructor(query,queryString){  //req.query == queryString , query==Tour.find() - i.e the object tour
        this.query=query;
        this.queryString=queryString
        
    }
    filter(){
        const queryObj={...this.queryString} // To Duplicate 
        const excludeFields=['page','sort','limit','fields']; 
        excludeFields.forEach(el=>delete queryObj[el])
        let queryStr=JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g ,el=>`$${el}`)

        // let query=Tour.find(JSON.parse(queryString))
        this.query=this.query.find(JSON.parse(queryStr))
        return this // This returns the object itself , this step is must since we are chaining methods
    }
    sort(){
        if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join(' ') // If there is more than one conditions then we need to remove the comma and add space so that it checks for all other specified conditions when more than one items have equal value.
            this.query=this.query.sort(sortBy)
        }else{
            this.query=this.query.sort('-createdAt')
        }
        return this
    }
    fieldLimit(){
        if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(' ')
            //query=query.select('name duration price') - Then it shows the specified fields only
            this.query=this.query.select(fields)
        }else{
            this.query=this.query.select('-__v')
        }
        return this
    }
    page(){
        const page=this.queryString.page*1 ||1
        const limit=this.queryString.limit*1 || 100
        const skip=(page-1)*limit

        this.query=this.query.skip(skip).limit(limit);
        // if(this.queryString.page){
        //     const numTours=await Tour.countDocuments();
        //     console.log(numTours)
        //     if(skip>=numTours) throw (" Pages Over")
        // }
        return this
    }
    
}

module.exports=APIFeatures