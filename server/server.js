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
const image = require("./models/image");

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

app.post(
  "/api/auth/signup",
  upload.single("selectedFile"),
  async (req, res) => {
    try {
      // when file is not attached by the user
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
  }
);
app.patch(
  "/api/auth/signup",
  upload.single("selectedFile"),
  async (req, res) => {
    //if no file keep original
    try {
      const { username, email, userId } = req.body;
      const member = await Member.findById(userId).populate("avatar");
      // remove old image and add new
      if (req.file) {
        // delete old image if it's not defaul avatar
        if (!member.avatar.fileName) {
          await Image.findByIdAndDelete(member.avatar._id);
        }
        const imageId = await uploadImage(req.file);
        member.avatar = imageId;
      }

      member.email = email;
      member.username = username;

      await member.save();
      const token = await generateToken(username);
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000);
      res.cookie("authToken", token, { expires: expirationTime });
      const user = await getUser(member.username);
      res.send({
        user,
        message: `${member.username} updated`,
      });
      // delete old image if it's not default avatar image
      if (req.file) {
      }
    } catch (error) {
      console.error(error);
      res.send({ error: "something wrong" });
    }
  }
);
//login
app.post("/api/auth/login", async (req, res) => {
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
app.get("/api/auth/logout", (req, res) => {
  try {
    res.clearCookie("authToken", { path: "/" });
    res.json({ message: "Cookie Deleted" });
  } catch (err) {
    console.error(err);
    res.json({ error: "something went wrong" });
  }
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
app.get("/api/projects/:id", async (req, res) => {
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
const projectNamespaces = {};
function createProjectNamespace(projectId) {
  if (!projectNamespaces[projectId]) {
    projectNamespaces[projectId] = io.of(`/${projectId}`);
    projectNamespaces[projectId].use(extractToken);
    projectNamespaces[projectId].on("connection", (socket) => {
      // Handle socket events within this project's namespace
      console.log(`User connected to Project: ${projectId}`);

      socket.on("greeting", (data) => {
        console.log(data);
      });
      socket.on("joinProject", async (data) => {
        try {
          const { message } = data;
          console.log(socket.user);
          response = await addMember(projectId, socket.user._id);
          console.log(response);
          if ("message" in response) {
            const newProject = await Project.findById(projectId)
              .populate("owner")
              .populate("image")
              .populate({ path: "owner", populate: { path: "avatar" } })
              .populate("members")
              .populate({ path: "members", populate: { path: "avatar" } })
              .populate("todos");
            projectNamespaces[projectId].emit("newProjectData", newProject);
          }
        } catch (err) {
          console.error("Error adding member to project: ", err);
          projectNamespaces[projectId].emit("joinProjectError", {
            errorMessage: "Failed to join the project",
          });
        }
      });
    });
  }
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  const projectId = socket.handshake.query.projectId;
  createProjectNamespace(projectId);
  console.log(`Project Room is ready ${projectId}`);
  socket.emit("connectRoom", { message: "All good" });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// create new project
app.post(
  "/api/projects",
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
