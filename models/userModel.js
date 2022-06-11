const mongoose=require('mongoose');
const validator=require('validator')
//To generate some random bits and provide less secured cryptography compared to bcrypt - crypto is inbuilt library
const crypto=require('crypto')

//npm i bcryptjs - Password cryptography script
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"A user must have a name"]
    },
    email:{
        type:String,
        required:[true,"A user must have an email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },
    photo:{
        type:String,
        default:'default.jpg' //For default pic for new users
    },
    password:{
        type:String,
        required:[true,"A user must have a password"],
        select:false
    },
    role:{
        type:String,
        enum:['admin','user','guide','lead-guide'],
        default:'user'
    },
    passwordConfirm:{
        type:String,
        
        validate:{
            //This only works on create and save
            validator:function(el){
                return el===this.password;
            },
            message:"Passwords differ. Please enter same password"
        }
    },
    passwordChangedAt: Date,  //For verification process
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save',async function(next){

    //only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //hash the password with cost of 12
    //hash is a async method so we need to use async and await
    this.password=await bcrypt.hash(this.password,12) //12 refers to amunt of hasinh done . Greater the number greater the security bu takes lof of time to encrypt

    //Delete passwordConfirm
    this.passwordConfirm=undefined;
    next()

})

userSchema.pre('save',function(next){  //Its a step required in resetPassword method
    if(!this.isModified('password') || this.isNew) return next(); //isNew check is new user is created and isModified check if the parameter specified is modified after created . Both are mongoose methods


    this.passwordChangedAt= Date.now() - 1000;
    next()
})
//The above two middlewares must be commented while reading user datas from file into DB since the password there is already encrypted


//Mainly used in deleteMe case
userSchema.pre(/^find/,function(next){ //RE is used which means run this middleware for every query which start with find
    //this points to the current query
    this.find({active:{$ne:false}});
    next()
})

//Instance method is a method which is gonna be available in all documents of that particular collection
userSchema.methods.checkPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}


userSchema.methods.changesPasswordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt){
        //console.log(this.passwordChangedAt,JWTTimestamp)
        const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10) //To convert the date into seconds 10 refers to the base i.e decimal system

        return JWTTimestamp < changedTimestamp;
    }
    //False means not changed
    return false;
}

userSchema.methods.createPasswordForgotToken=function(){
    //generating 32 byte long hexadecimal token 
    const resetToken=crypto.randomBytes(32).toString('hex')

    //encrypting and storing the reset token in db
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetExpires=Date.now() + 10*60*1000 //10 mins- multiplied by 60 to make it secs and 1000 to make it millisecs

    return resetToken //returning non encrypted token

}

const User=mongoose.model('user',userSchema)

module.exports=User;