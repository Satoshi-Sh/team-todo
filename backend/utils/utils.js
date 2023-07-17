const Image = require("../models/image");
const Member = require("../models/member");
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

module.exports = { uploadImage, getDefaultAvatarID, getUser };
