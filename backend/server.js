const express = require("express");
const app = express();
const port = 3000;
const Member = require("./models/member");
const Project = require("./models/project");
const Image = require("./models/image");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const passport = require("passport");

const {
  uploadImage,
  getDefaultAvatarID,
  getDefaultProjectImageID,
  getUser,
  hashPassword,
  comparePassword,
  getTodoIds,
} = require("./utils/utils");
const { configurePassport, generateToken } = require("./utils/auth");
// multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Connect to MongoDB database
mongoose.connect("mongodb://localhost/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
configurePassport(app);
app.use(passport.initialize());
app.use(cors({ origin: "http://localhost:4000", credentials: true }));
app.use(express.json());

//signup

app.post("/api/signup", upload.single("selectedFile"), async (req, res) => {
  try {
    // todo when file is not attached by the user
    let imageId;
    if (!req.file) {
      // use default image id
      imageId = await getDefaultAvatarID();
    } else {
      // error message when file is too big?
      imageId = await uploadImage(req.file);
      console.log(imageId);
    }
    const { username, email, password } = req.body;
    const hash = await hashPassword(password);
    console.log(hash);
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
      res.json({ error: "Duplicate username" });
    } else {
      res.json({ error: "Something went wrong." });
    }
  }
});
//login
app.post("/api/login", async (req, res) => {
  console.log(req.user);
  try {
    const { username, password } = req.body;
    const user = await getUser(username);
    const hashedPassword = user.password;
    if (await comparePassword(password, hashedPassword)) {
      const token = await generateToken(username);
      console.log(token);
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000);
      res.cookie("authToken", token, { expires: expirationTime });
      res.json({ message: `Logged in Successfully`, user });
    } else {
      res.json({ error: "Incorrect Username and/or Password" });
    }
  } catch (error) {
    console.error(error);
    res.json({ error: "Wrong Username" });
  }
});

//logout
app.get("/api/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.json({ message: "Cookie Deleted" });
});

//////Projects
// get all projects
app.get("/api/projects", async (req, res) => {
  const projects = await Project.find({})
    .populate("owner")
    .populate("image")
    .populate({ path: "owner", populate: { path: "avatar" } });
  res.json(projects);
});
// create new project
app.post(
  "/api/project",
  upload.single("selectedFile"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const owner = req.user["_id"];
      const { title, due, description, todos } = req.body;
      // todo when file is not attached by the user
      let imageId;
      if (!req.file) {
        // use default image id
        imageId = await getDefaultProjectImageID();
      } else {
        // error message when file is too big?
        imageId = await uploadImage(req.file);
        console.log(imageId);
      }
      // add todos
      const todoIds = await getTodoIds(todos);
      // save project
      const newProject = new Project({
        title,
        owner,
        due,
        description,
        todos: todoIds,
        image: imageId,
      });
      await newProject.save();
      res.json({ message: `${title} is created.` });
    } catch (err) {
      console.error(err);
      res.json({ message: err.message });
    }
  }
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
