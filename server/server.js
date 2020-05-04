require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./router');

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`)
    console.log(process.env.MONGO_URI)
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log(`successfully connected to db`)
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(async (req, res, next) => {

    if (req.headers["x-access-token"]) {

     const accessToken = req.headers["x-access-token"];
     const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);

     // Check if token has expired
     if (exp < Date.now().valueOf() / 1000) { 
      return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
     }

     res.locals.loggedInUser = await User.findById(userId); next(); 
     
    } else { 
     next(); 
    } 
   });
    
   app.use('/', routes); 
   
   app.listen(PORT, () => {
     console.log('Server is listening on Port:', PORT)
   })





