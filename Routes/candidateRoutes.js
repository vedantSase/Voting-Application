const express = require('express');
const router = express.Router();
const candidate = require('../Models/Candidate');
const user = require('../Models/User');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

// (SIGNIN) Creating a new Candidate
router.post('/signup', jwtAuthMiddleware,async (req, res) => {
    try {
        if(! await isAdmin(req.jwtPayload.id))
            return res.status(403).json({ message: 'Access denied: You are not an admin.' });          
        const data = req.body ;
        const newCandidate = new candidate(data);   
        const savedCandidate = await newCandidate.save();
        console.log("Candidate saved -- ", savedCandidate.name);
        res.status(200).json({message: 'Candidate saved successfully',savedCandidate : savedCandidate});
    } catch (error) {
        console.log("Error----\n", error);
        res.status(500).json({error : 'Internal Server Error\nwhile posting candidate'});
    }   
})


// (UPDATE) Updating a Candidate
router.put('/update/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        if(! (await isAdmin(req.jwtPayload.id)) )
            return res.status(403).json({message:'Your are not admin'});     
        const candidateID = req.params.id ;
        const dataToUpdate = req.body ;
        const updatedCandidate = await candidate.findByIdAndUpdate( candidateID, dataToUpdate, {
            new : true,     // return updated document
            runValidators : true    // run mongoose validation
        });
        if(!updatedCandidate)
            res.status(403).json({error : 'Candidate are not found'});
        console.log("Candidate Updated !!!.\n") ;
        res.status(200).json(updatedCandidate);
    } catch (error) {
        console.log("Error----\n", error);
        res.status(500).json({error : 'Internal Server Error\nwhile Updating candidate'});
    }
})

// (DELETE) Deleting a candidate
router.delete('/delete/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        if(! (await isAdmin(req.jwtPayload.id)) )
            return res.status(403).json({message:'Your are not admin'});
        const candidateID = req.params.id;
        const deletedCandidate = await candidate.findByIdAndDelete(candidateID);
        if(!deletedCandidate)
            return res.status(403).json({error : 'Candidate not found'});
        console.log("Candidate deleted.\n", deletedCandidate);
        res.status(200).json({message : 'Candidate Deleted',deletedCandidate : deletedCandidate});
    } catch (error) {
        console.log("Error----\n", error);
        res.status(500).json({error : 'Internal Server Error\nwhile Deleting candidate'});
    }
})

//define a function to check if the user is admin or not
const isAdmin = async (userID) => {
    try {
        const newUser = await user.findById(userID);
        return  (newUser.role === 'admin') ; 
    } catch (error) {
        return false;        
    }
}

// get the list of candidates
router.get('/candidateList', async (req, res) => {
    try {
        const Candidates = await candidate.find();
        Candidates.forEach(person => {
            console.log(person.name + " - " + person.party);
        });
        const candiList = await Candidates.map((data) => {
            return {
                name : data.name,
                party : data.party
            }
        })
        res.status(200).json(candiList);    
    } catch (error) {
        
    }
})

// voting methods
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    // admin can't vote
    // user can vote only once
    const candidateID = req.params.candidateId ;
    const userId = req.jwtPayload.id ;
    
    try {
        // find the candidate document with the specified candidate ID
        const newCandidate = await candidate.findById(candidateID);
        // find the user document with the specified user ID (which is in token)
        const newUser = await user.findById(userId);
        
        if(newUser.isVoted)     // is user already votes then return
            return res.status(403).json({ message : 'User already voted'});
            
        if(newUser.role == 'admin')     // if user is admin then not allowed to vote
            return res.status(403).json({ message : 'Admin are not allowed to vote'});
            
        // if candidate or user not found
        if(! newCandidate)
            return res.status(403).json({ message : 'Candidate not found' });
        if(! newUser)
            return res.status(403).json({ message : 'User not found' });
    
        // update candidate document to record vote
        newCandidate.votes.push({user : newUser.id}) //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        newCandidate.voteCount++;   // increment the vote count by 1
        newCandidate.save();        // save the new candidate
        
        // update user document to record vote
        newUser.isVoted = true;  // set user as voted
        newUser.save();        // save the new user
        
        console.log("User voted for - \n",newCandidate.name);
        res.status(200).json({ message : 'User voted successfully'});
    } catch (error) {
        console.log("Error----\n", error);
        res.status(500).json({error : 'Internal Server Error\nwhile Voting'});
    }
})

// get the vote count for specific candidate
router.get('/vote/count', async (req, res) => {
    try {
        // find all candidates and sort them in descending order
        const candidates = await candidate.find().sort({voteCount : 'desc'});

        // map the candidate to only return the candidate name and vote count
        const VoteRecords = await candidates.map((data) => {
            return {
                name : data.name, 
                voteCount : data.voteCount
            }
        })
        return res.status(200).json(VoteRecords);
    } catch (error) {
        console.log("Error----\n", error);
        res.status(500).json({error : 'Internal Server Error\nwhile Counting Votes'}); 
    }
})
module.exports = router ;