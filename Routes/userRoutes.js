const express = require('express');
const router = express.Router();

const user = require('../Models/User');
const {jwtAuthMiddleware, generateToken} = require('../jwt');



// (SIGNIN) Creating a new User
router.post('/signup', async (req, res) => {
    try {
        const data = req.body ;
        const newUser = new user(data);
        const savedUser = await newUser.save();
        console.log("User saved successfully --- ", savedUser.name);
        
        const payLoad = {
            id : savedUser.id
        }
        const token =  generateToken(payLoad);
        console.log("Token saved successfully", token);
        res.status(200).json({savedUser : savedUser, token : token});
    } catch (error) {
        console.log("Error----\n",error);
        res.status(500).json({error : 'Internal Server Error'});
    }
})


// (LOGIN) Fetching the existing user
router.post('/login', async (req, res) => {
    try {
        const {Aadhar, Password} = req.body;
        
        const isUser = await user.findOne({Aadhar : Aadhar});
        // if user is not found or password not matched
        if(!isUser || !await isUser.comparePassword(Password)){
            res.status(404).json({error : 'Invalid Aadhar or Password'});
        }else{
            const payload = {
                id : isUser.id,
            }
            const token =  generateToken(payload);
            console.log("Logged in successfully - ",isUser.name, token);
            res.status(200).json({message : 'Logged in successfully', token: token});
        }
    } catch (error) {
        console.log("Error--- \n",error);
        res.status(500).json({error : 'Internal server error'}) ;
    }
})

// (GETTING PROFILE) Fetching the existing user profile
router.get('/profile/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.params.id ;

        const isUser = await user.findOne({_id: userId});
        // if user is not found or password not matched
        if(!isUser){
            res.status(404).json({error : 'Invalid id'});
        }
        else{
            console.log("User profile - \n", isUser);
            res.status(200).json({user : isUser});
        }
    } catch (error) {
        console.log("Error--- \n",error);
        res.status(500).json({error : 'Internal server error'})
    }
})

// (CHNAGING PASSWORDS) changing the password of user
router.put('/profile/password/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.params.id ;
        // const userId = req.jwtPayload ;
        const {oldPassword, newPassword} = req.body;
        
        // if the user is not found 
        const isUser = await user.findById(userId);
        if(!isUser) 
            return res.status(404).json({error : 'User not found'});

        // if password doesn't match
        if(!await isUser.comparePassword(oldPassword)) {
            res.status(401).json({error : 'Wrong old Password'});
        }
        else{
            isUser.Password = newPassword;
            await isUser.save();
            console.log("Password changed successfully");
            res.status(200).json({isUser : isUser});
        }
    } catch (error) {
        console.log("Error--- \n",error);
        res.status(500).json({error : 'Internal server error'})
    }
})


// (UPDATING USER) Updating the existing user details
router.put('/profile/update/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;
        const dataToUpdate = req.body;
        // update the user
        const updatedUser = await user.findByIdAndUpdate(userId,dataToUpdate,{
            new : true,     // return updated document
            runValidators : true  // run mongoose validation
        });
        // if user not  found
        if(!updatedUser)
            return res.status(404).json({error : 'User not found'});
        res.status(200).json({success : updatedUser});
        console.log("User Updated\n", updatedUser);
    } catch (error) {
        console.log("Error--- \n",error);
        res.status(500).json({error : 'Internal server error'})
    }
})


// (LOGGING OUT) Logout the user

router.delete('/logout', jwtAuthMiddleware, async (req, res) => {
    try {   
        req.jwtToken = null;
        res.status(200).json({message : 'Logged out successfully'});
    } catch (error) {
        console.log("Error--- \n",error);
        res.status(500).json({error : 'Internal server error'}) ;
    }
})




module.exports = router ;