const Image = require("../models/image");
const Member = require("../models/member");
require("dotenv").config();
const bcrypt = require("bcrypt");

function hashPassword(
  password,
  saltRounds = Number(process.env["SALTROUNDS"])
) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        // Handle error
        console.error(err);
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

function comparePassword(inputPassword, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(inputPassword, hash, function (err, result) {
      if (err) {
        console.error(err);
        reject(err);
      } else if (result) {
        console.log("Password match");
        resolve(true);
      } else {
        console.log("Password does not match");
        resolve(false);
      }
    });
  });
}

async function uploadImage(file) {
  try {
    const { buffer, mimetype } = file;
    const newImage = new Image({ imageContent: buffer, mimetype });
    await newImage.save();
    return newImage._id;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
}

async function getDefaultAvatarID() {
  try {
    const image = await Image.findOne({ fileName: "default-user-image.png" });
    return image._id;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUser(username) {
  try {
    const member = await Member.findOne({ username });
    return member.password;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  getDefaultAvatarID,
  getUser,
  hashPassword,
  comparePassword,
};
