const express = require("express");
const app = express();
const port = 3001;
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");

const Member = require("./models/member");
const Project = require("./models/project");
const Image = require("./models/image");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const passport = require("passport");

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["*"],
    credentials: true,
  },
});

const {
  uploadImage,
  getDefaultAvatarID,
  getDefaultProjectImageID,
  getUser,
  hashPassword,
  comparePassword,
  getTodoIds,
  addMember,
} = require("./utils/utils");
const {
  configurePassport,
  generateToken,
  extractToken,
} = require("./utils/auth");
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
      res.json({ error: "Duplicate username" });
    } else {
      res.json({ error: "Something went wrong." });
    }
  }
});
//login
app.post("/api/login", async (req, res) => {
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
  try {
    const projects = await Project.find({})
      .populate("owner")
      .populate("image")
      .populate({ path: "owner", populate: { path: "avatar" } });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.json({ message: "Something went wrong.." });
  }
});
// get a project by id
app.get("/api/project/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("owner")
      .populate("image")
      .populate({ path: "owner", populate: { path: "avatar" } })
      .populate("members")
      .populate({ path: "members", populate: { path: "avatar" } })
      .populate("todos");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.send(project);
  } catch (err) {
    console.error(err);
    res.send({ message: "Something went wrong..." });
  }
});

// add user info to socket
io.use(extractToken);
// websocket for each project

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("joinProject", async (data) => {
    console.log(`${socket.user.username}: ${data.message}`);
    try {
      response = await addMember(data.projectId, socket.user._id);
      console.log(response);
      if ("message" in response) {
        const newProject = await Project.findById(data.projectId)
          .populate("owner")
          .populate("image")
          .populate({ path: "owner", populate: { path: "avatar" } })
          .populate("members")
          .populate({ path: "members", populate: { path: "avatar" } })
          .populate("todos");
        io.emit("newProjectData", newProject);
      }
    } catch (err) {
      console.error("Error adding member to project: ", err);
      socket.emit("joinProjectError", {
        errorMessage: "Failed to join the project",
      });
    }
  });
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

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
