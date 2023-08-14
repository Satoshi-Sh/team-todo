const express = require("express");
const app = express();
const port = 3001;
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");

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
  createAccount,
  updateAccount,
  userLogin,
  userLogout,
  userDelete,
} = require("./controllers/auth.controller");

const {
  getProjects,
  getProjectById,
  createNewProject,
  updateProject,
  deleteProject,
} = require("./controllers/projects.controller");

const { createProjectNamespace } = require("./controllers/socket.controller");
const { configurePassport, extractToken } = require("./utils/auth");

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

//// Authentication
// signup
app.post("/api/auth/signup", upload.single("selectedFile"), createAccount);
// account update
app.patch("/api/auth/signup", upload.single("selectedFile"), updateAccount);
// login
app.post("/api/auth/login", userLogin);
// logout
app.get("/api/auth/logout", userLogout);
// delete account
app.delete(
  "/api/auth/account",
  passport.authenticate("jwt", { session: false }),
  userDelete
);

////Projects
// get all projects
app.get("/api/projects", getProjects);
// get a project by id
app.get("/api/projects/:id", getProjectById);
// create new project
app.post(
  "/api/projects",
  upload.single("selectedFile"),
  passport.authenticate("jwt", { session: false }),
  createNewProject
);
// update project
app.patch(
  "/api/projects/:projectId",
  upload.single("selectedFile"),
  passport.authenticate("jwt", { session: false }),
  updateProject
);
// delete project
app.delete(
  "/api/projects/:projectId",
  passport.authenticate("jwt", { session: false }),
  deleteProject
);

//// Websocket
// add user info to socket
io.use(extractToken);
// websocket for each project
const projectNamespaces = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  const projectId = socket.handshake.query.projectId;
  createProjectNamespace(io, projectNamespaces, projectId);
  console.log(`Project Room is ready ${projectId}`);
  socket.emit("connectRoom", { message: "All good" });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
