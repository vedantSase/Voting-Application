const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {

    // check first request has authorization i.e.(token) or not
    const authorization = req.headers.authorization ;
    if(!authorization)
        return res.status(401).json({error : 'Token not Found'});

    // extract the token form request headers
    const token = req.headers.authorization.split(' ')[1];

    if(!token)
        return res.status(401).json({error : 'Unauthorized'});

    try {
        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user info with token
        req.jwtPayload = decoded ; 
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({error : 'Invalid JWT token'});
    }
}

// function to generate token
const generateToken = (userData) => {
    // Generate a new token
   return jwt.sign(userData, process.env.JWT_SECRET,{expiresIn : 5000}); 
}

module.exports = {jwtAuthMiddleware,generateToken};