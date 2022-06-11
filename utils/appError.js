class AppError extends Error{
    constructor(message,statusCode){
        super(message);
      
        this.statusCode=statusCode;
        //If status code starts eith 4 then the status is fail and if it start with 5 then it is error
        this.status= `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational=true;

        Error.captureStackTrace(this,this.constructor);

    }
}

module.exports=AppError