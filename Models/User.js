const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const isMatch = require('lodash');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    Aadhar : {
        type : String,
        required : true,
        unique : true
    },
    age : {
        type : Number,
        required : true
    },
    email : {
        type : String,
        unique : true
    },
    mobile : {
        type : String,
    },
    Address : {
        type : String,
        required : true
    },
    Password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['admin','user'],
        default : 'user'
    },
    isVoted : {
        type : Boolean,
        default : false
    }
})

// hashing the password field
userSchema.pre('save',async function(next){
    const user = this ;

    //hash the password only if the user is new
    if(!user.isModified('Password')) 
         return next() ;
    try {
         // hash salt generation 
         const salt = await bcrypt.genSalt(10);
         // generate hash password
         const hashedPassword = await bcrypt.hash(user.Password, salt);
         // override the plain password with hashed password
         user.Password = hashedPassword ; 
    } catch (error) {
         return next(error) ;
    }
})

userSchema.methods.comparePassword = async function(clientPassword){
    try {
       const isMatch = await bcrypt.compare(clientPassword, this.Password);
       return isMatch ;   
    } catch (error) {
         throw error ;
    }
}
const User = mongoose.model('User',userSchema);
module.exports = User;