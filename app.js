const jwt = require('jsonwebtoken');
require('dotenv').config();



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

const accessToken = generateAccessToken(user);
console.log("Access Token is ", accessToken);
