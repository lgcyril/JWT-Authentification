const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// TODO : create Users in SQL
const user = {
  id: 45,
  name: 'Emma Da Best',
  email: 'EmmaDaBest@FBI.GOV',
  admin: true,
};



// Generate an access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1800s', // if the user is inactive for 30 minutes, he will have to log in again
    // but if you delete the user, he will still be able to use the token during 30 minutes
    // but if don't want the user to log in again every 30 mn, we can generate a refresh token and use it to generate a new access token
    // but we will check in DB if the user is still in the DB and has the right to get a new token?
  });
}

// Route to get the access token
app.post('/api/login', (req, res) => {
  // TODO: check in DB the user and password 
    if (req.body.email !== user.email) {
      res.status(401).send('Invalide credentials');
      return
    }
    if (req.body.password !== 'EmmaInZMoon') {   // TODO : to change with SQL request
      res.status(401).send('Invalide credentials');
      return
    }
  
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
  
    res.send({
      accessToken,
      refreshToken,
    }); // return the new token
  });



// Generate an refresh token to get a new access token
function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
}



// Route to get the refresh token
app.post('/api/refreshToken', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.sendStatus(401); // if there isn't any token

  // There is a token but it is not valid
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    // if the token is not valid
    if (err) return res.sendStatus(401); // return 403

    // TODO : Check if the user is in the database and has the right to get a new token
    delete user.iat; // delete the iat (creation)  and exp (expiration) delay to be able to generate a new token
    delete user.exp;
    const refreshedToken = generateAccessToken(user);
    res.send({
      accessToken: refreshedToken,
    }); // return the new token
  });
});



// Middleware to authentificate the token
function authentificateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.sendStatus(401); // if there isn't any token

  // There is a token but it is not valid
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // if the token is not valid
    if (err) { return res.sendStatus(401)}; // return 403
    req.user = user; // if the token is valid, save the user in the request
    next(); // continue
  });
}

// Route to get the user
app.get('/api/user', authentificateToken, (req, res) => {
  res.send(req.user);
});



// Listen on port 3000
app.listen(3000, () => {console.log('Server running on port 3000')});

