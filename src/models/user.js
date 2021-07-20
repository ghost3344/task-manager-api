const mongoose = require('mongoose')
const validator = require('validator')
const passwordValidator = require('password-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Task = require('../models/task.js');
const { deleteOne } = require('../models/task.js');
var schema1 = new passwordValidator();
schema1.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


var userschema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(!schema1.validate(value))
            {
                throw new Error(error)  // Get a full list of rules which failed
            }
        }
    },
    email:{
        type: String,
        unique : true,
        required: true,
        trim: true,     // to remove extra spaces before or after name
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invailid Email")
            }
        }
    },
    age:{
        type: Number,
        required: true,
        default: 0,
        validate(value){
            if(value <= 0){
                throw new Error("age must be positive number")
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
    },{
        timestamps : true
    })

userschema.virtual('tasks', {
        ref: 'Tasks',
        localField: '_id',
        foreignField: 'owner'
})

userschema.pre('save',async function(next){
            const user = this   // to get user instance when any method is called
            if(user.isModified('password'))
            {
                user.password = await bcrypt.hash(user.password,8)
            }
            next()
})

userschema.pre('remove',async function(next){
    const user= this
    await Task.deleteMany({owner: user._id})
    next()
})

userschema.statics.findUserbyCredentials = async (email,password)=>{
    try{
    const user =await User.findOne({email})
    if(!user)
    {
        throw new Error("Unable to login 1")
    }
    const isvalid = bcrypt.compare(password,user.password)
    if(!isvalid){
        throw new Error("Unable to login 2")
    }
    return user
    }
    catch(e){
        console.log(e)
    }
    
}



userschema.methods.generateAuthtoken = async function (){   // we cant use es6 syntax because we need this binding
    const user = this
    const token = await jwt.sign({_id: user._id.toString()},process.env.JSON_WEB_TOKEN_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userschema.methods.toJSON = function (){   // method will be called when req.send converts user json object to string
    const user=this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

const User = mongoose.model('User',userschema)

module.exports = {User,passwordValidator}
