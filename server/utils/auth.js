const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");
const Member = require("../models/member");
const cookieParser = require("cookie-parser");
require("dotenv").config();

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
        console.log(payload, "test test...");
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

module.exports = { configurePassport, generateToken };
