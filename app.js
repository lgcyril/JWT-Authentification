const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// User object
const user = {
  id: 45,
  name: "Emma Da Best",
  email: "EmmaDaBest@FBI.GOV",
  admin: true,
};



// Generate an access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1800s",
  });
}

// Route to get the access token
app.post("/api/login", (req, res) => {
    if (req.body.email !== user.email) {
      res.status(401).send("Invalide credentials");
    }
    if (req.body.password !== "EmmaInZMoon") {
      res.status(401).send("Invalide credentials");
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
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" });
}



// Route to get the refresh token
app.post("/api/refreshToken", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  if (token == null) return res.sendStatus(401); // if there isn't any token

  // There is a token but it is not valid
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    // if the token is not valid
    if (err) return res.sendStatus(403); // return 403

    // TO DO : Check if the user is in the database and has the right to get a new token
    delete user.iat; // delete the iat (creation)  and exp (expiration) delay to be able to generate a new token
    delete user.exp;
    const refreshedToken = generateRefreshToken(user);
    res.send({
      accessToken: refreshedToken,
    }); // return the new token
  });
});



// Middleware to authentificate the token
function authentificateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  if (token == null) return res.sendStatus(401); // if there isn't any token

  // There is a token but it is not valid
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // if the token is not valid
    if (err) return res.sendStatus(403); // return 403
    req.user = user; // if the token is valid, save the user in the request
    next(); // continue
  });
}

// Route to get the user
app.get("/api/user", authentificateToken, (req, res) => {
  res.send(req.user);
});



// Listen on port 3000
app.listen(3000, () => console.log("Server started on port 3000"));
