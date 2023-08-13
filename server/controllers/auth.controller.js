const {
  uploadImage,
  getDefaultAvatarID,
  getDefaultProjectImageID,
  getUser,
  hashPassword,
  comparePassword,
  getTodoIds,
  getTodoIds2,
  addMember,
  emitNewData,
  sendError,
  emitNewMessages,
} = require("../utils/utils");
const Member = require("../models/member");
const Image = require("../models/image");

const {
  configurePassport,
  generateToken,
  extractToken,
} = require("../utils/auth");

const createAccount = async (req, res) => {
  try {
    // when file is not attached by the user
    let imageId;
    if (!req.file) {
      // use default image id
      imageId = await getDefaultAvatarID();
    } else {
      try {
        imageId = await uploadImage(req.file);
      } catch (err) {
        res.status(500).json({ error: "Error uploading image." });
      }
    }
    const { username, email, password } = req.body;
    const hash = await hashPassword(password);
    const newMember = new Member({
      username,
      email,
      password: hash,
      avatar: imageId,
    });
    await newMember.save();

    const token = await generateToken(username);
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000);
    res.cookie("authToken", token, { expires: expirationTime });
    const user = await getUser(username);
    res.json({ message: `${username} is created.`, user });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(409).json({ error: "Duplicate username" });
    } else {
      res.status(500).json({ error: "Failed to crate a new user." });
    }
  }
};

const updateAccount = async (req, res) => {
  try {
    const { username, email, userId } = req.body;
    const member = await Member.findById(userId).populate("avatar");
    // remove old image and add new
    if (req.file) {
      // delete old image if it's not defaul avatar
      try {
        if (!member.avatar.fileName) {
          await Image.findByIdAndDelete(member.avatar._id);
        }
        const imageId = await uploadImage(req.file);
        member.avatar = imageId;
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error uploading image." });
        return;
      }
    }

    member.email = email;
    member.username = username;
    try {
      await member.save();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Duplicate username" });
      return;
    }
    const token = await generateToken(username);
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000);
    res.cookie("authToken", token, { expires: expirationTime });
    const user = await getUser(member.username);
    res.send({
      user,
      message: `${member.username} updated`,
    });
  } catch (error) {
    console.error(error);
    res.send({ error: "something wrong" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await getUser(username);
    const hashedPassword = user.password;
    if (await comparePassword(password, hashedPassword)) {
      const token = await generateToken(username);
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000);
      res.cookie("authToken", token, { expires: expirationTime });
      res.json({ message: `Logged in Successfully`, user });
    } else {
      res.json({ error: "Incorrect Username and/or Password" });
    }
  } catch (error) {
    console.error(error);
    res.json({ error: "Incorrect Username and/or Password" });
  }
};

const userLogout = async (req, res) => {
  try {
    res.clearCookie("authToken", { path: "/" });
    res.json({ message: "Cookie Deleted" });
  } catch (err) {
    console.error(err);
    res.json({ error: "Couldn't delete the cookie" });
  }
};

module.exports = {
  createAccount,
  updateAccount,
  userLogin,
  userLogout,
};
