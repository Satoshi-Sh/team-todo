const Image = require("../models/image");
const Member = require("../models/member");
const Todo = require("../models/todo");
require("dotenv").config();
const bcrypt = require("bcrypt");

async function hashPassword(
  password,
  saltRounds = Number(process.env["SALTROUNDS"])
) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (err) {
    console.error(err);
    return err;
  }
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

async function getDefaultProjectImageID() {
  try {
    const image = await Image.findOne({ fileName: "project-management.png" });
    return image._id;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUser(username) {
  try {
    const member = await Member.findOne({ username });
    return member.populate("avatar");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTodoIds(todos) {
  const todoIds = [];
  const todosArray = JSON.parse(todos);
  for (const title of todosArray) {
    const newTodo = new Todo({ title });
    await newTodo.save();
    todoIds.push(newTodo._id);
  }
  return todoIds;
}

module.exports = {
  uploadImage,
  getDefaultAvatarID,
  getDefaultProjectImageID,
  getUser,
  hashPassword,
  comparePassword,
  getTodoIds,
};
