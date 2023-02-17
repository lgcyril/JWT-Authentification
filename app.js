const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true }));


// console.log("Secret is " + process.env.ACCESS_TOKEN_SECRET)
const user = { 
    id: 45,
    name: "John Doe",
    email: "jd@fbi.gov",
    admin: true,
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}



// Routes
app.post('/api/login', (req, res) => { 
    if (req.body.email !== user.email) {
        res.status(401).send('Invalide credentials');
    }
    if (req.body.password !== "toto") {
        res.status(401).send('Invalide credentials');
    }
    const accessToken = generateAccessToken(user);
    res.send({accessToken}); // return the new token

})

// Listen on port 3000
app.listen(3000, () => console.log('Server started on port 3000')); 