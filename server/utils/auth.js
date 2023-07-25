const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");
const Member = require("../models/member");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cookie = require("cookie");

const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

// Configure Passport
const configurePassport = (app) => {
  app.use(cookieParser());
  const jwtOptions = {
    jwtFromRequest: (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies["authToken"];
      }
      return token;
    },
    secretOrKey: process.env["SECRET"],
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        // Find the user based on the payload
        const user = await Member.findOne({
          username: payload.username,
        }).populate("avatar");
        if (user) {
          // If user is found, return the user object
          done(null, user);
        } else {
          // If user is not found, return false
          done(null, false);
        }
      } catch (error) {
        done(error, false);
      }
    })
  );
};

const generateToken = async (username) => {
  const token = jwt.sign({ username }, process.env["SECRET"]);
  return token;
};

// add user authentication to the websocket
const extractToken = (socket, next) => {
  // Verify the token (e.g., using JWT verification)
  try {
    console.log(socket.requets.header.cookie);
    const cookies = cookie.parse(socket.request.headers.cookie || "");
    const token = cookies.authToken;
    console.log(token);
    const decoded = jwt.verify(token, process.env["SECRET"]); // Replace "your-secret-key" with your actual secret key
    // If token is valid, associate the authenticated user with the socket (optional)
    socket.user = decoded; // You can store user-specific data in the socket
    next();
  } catch (err) {
    // If token is invalid, reject the WebSocket connection
    next(new Error("Authentication error"));
  }
};

module.exports = { configurePassport, generateToken, extractToken };
