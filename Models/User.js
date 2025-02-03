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
userSchema.pre('save', async function (next) {
    const user = this ;

    try {
        // if user is new then hash the password field
        if(user.isModified('Password')){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.Password, salt);
            user.Password = hashedPassword ;
        }

        // ensure only one admin exists
        if(user.role === 'admin'){
            const existingAdmin = await User.findOne({ role: 'admin' });
            // If an admin already exists and it's not the current user being updated
            if(existingAdmin && existingAdmin.id !== user.id){
                return next({error: 'Admin already exists'});
            }
        }
        next() ;    // Proceed with saving the user
    } catch (error) {
        return next(error);
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