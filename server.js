const express = require('express');
const app = express();
const nodash = require('nodash');
const db = require('./db');
require('dotenv').config();

// initialing body parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.Port || 3000 ;

// getting middleware Authentication
const {jwtAuthMiddleware} = require('./jwt');

//logging the request (MIDDLEWARE FUNCTIONS)
const logRequest = (req, res, next) => {
    console.log("\n-----------------------\n");
    console.log(`[${new Date().toLocaleString()}] Request mode to : ${req.originalUrl}`);
    next() ;
  }
app.use(logRequest);

// importing the routes
const userRoutes = require('./Routes/userRoutes');  
const candidateRoutes = require('./Routes/candidateRoutes');  

// // user the user routes
app.use('/user',userRoutes);
app.use('/candidate', candidateRoutes);

app.get('/', (req, res) =>{
    res.send('Welcome Vote For the Nation...');
})

app.listen(PORT, () => {
    console.log(`Listening on port - ${PORT}`);
})