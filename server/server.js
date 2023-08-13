const express = require("express");
const app = express();
const port = 3001;
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");

const Member = require("./models/member");
const Project = require("./models/project");
const Image = require("./models/image");
const Todo = require("./models/todo");
const Message = require("./models/message");
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
  getTodoIds2,
  addMember,
  emitNewData,
  sendError,
  emitNewMessages,
} = require("./utils/utils");

const {
  createAccount,
  updateAccount,
  userLogin,
  userLogout,
} = require("./controllers/auth.controller");

const {
  getProjects,
  getProjectById,
  createNewProject,
  updateProject,
  deleteProject,
} = require("./controllers/projects.controller");

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

//// Authentication
// signup
app.post("/api/auth/signup", upload.single("selectedFile"), createAccount);
// account update
app.patch("/api/auth/signup", upload.single("selectedFile"), updateAccount);
// login
app.post("/api/auth/login", userLogin);
// logout
app.get("/api/auth/logout", userLogout);

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
function createProjectNamespace(projectId) {
  if (!projectNamespaces[projectId]) {
    projectNamespaces[projectId] = io.of(`/${projectId}`);
    projectNamespaces[projectId].use(extractToken);
    projectNamespaces[projectId].on("connection", (socket) => {
      // Handle socket events within this project's namespace
      console.log(`User connected to Project: ${projectId}`);
      // send Messages on project when user
      emitNewMessages(socket, projectId);

      socket.on("joinProject", async (data) => {
        try {
          response = await addMember(projectId, socket.user._id);
          if ("message" in response) {
            emitNewData(projectNamespaces[projectId], projectId);
          }
          emitNewMessages(socket, projectId);
        } catch (err) {
          console.error("Error adding member to project: ", err);
          sendError("Failed to join the project", projectNamespaces[projectId]);
        }
      });
      socket.on("leaveProject", async (data) => {
        try {
          const project = await Project.findById(projectId).populate("todos");
          if (!project) {
            throw new Error("Project not found");
          }
          project.members.pull({ _id: socket.user._id });
          for (let todo of project.todos) {
            if (todo.assignee && todo.assignee.equals(socket.user._id)) {
              todo.assignee = null;
              todo.status = "Open";
              await todo.save();
            }
          }
          await project.save();
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (error) {
          console.error(error);
          sendError(
            "Failed to leave the project",
            projectNamespaces[projectId]
          );
        }
      });
      socket.on("assignTask", async (data) => {
        try {
          const userId = socket.user._id;
          const { todoId } = data;
          const newTodo = await Todo.findById(todoId);
          newTodo.assignee = userId;
          newTodo.status = "Assigned";
          await newTodo.save();
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (error) {
          console.error(error);
          sendError("Failed to assign a task.", socket);
        }
      });
      socket.on("unassignTask", async (data) => {
        try {
          const userId = socket.user._id;
          const { todoId } = data;
          const newTodo = await Todo.findById(todoId);
          if (!newTodo.assignee.equals(userId)) {
            throw new Error("This is not user's task.");
          }
          newTodo.assignee = null;
          newTodo.status = "Open";
          await newTodo.save();
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (error) {
          console.error(error);
          sendError("Failed to unassign a task.", socket);
        }
      });
      socket.on("completeTask", async (data) => {
        try {
          const userId = socket.user._id;
          const { todoId } = data;
          const newTodo = await Todo.findById(todoId);
          if (!newTodo.assignee.equals(userId)) {
            throw new Error("This is not user's task.");
          }
          newTodo.status = "Completed";
          await newTodo.save();
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (error) {
          console.error(error);
          sendError("Failed to complete a task.", socket);
        }
      });
      socket.on("unmarkComplete", async (data) => {
        try {
          const userId = socket.user._id;
          const { todoId } = data;
          const newTodo = await Todo.findById(todoId);
          if (!newTodo.assignee.equals(userId)) {
            throw new Error("This is not user's task.");
          }
          newTodo.status = "Assigned";
          await newTodo.save();
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (error) {
          console.error(error);
          sendError("Failed to unmark complete.", socket);
        }
      });
      socket.on("updateTodos", async (data) => {
        try {
          let newTodos = [];
          for (let todo of data) {
            // existed todo
            if (todo.hasOwnProperty("_id")) {
              const updateTodo = await Todo.findById(todo._id);
              updateTodo.title = todo.title;
              await updateTodo.save();
            }
            // newTodo
            else {
              newTodos.push(todo.title);
            }
          }
          const todoIds = await getTodoIds2(newTodos);
          const updatedProject = await Project.findById(projectId);
          updatedProject.todos = [...updatedProject.todos, ...todoIds];
          await updatedProject.save();
          // send updated project
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (err) {
          console.error(err);
          sendError("Failed to update todos.", socket);
        }
      });
      socket.on("deleteTodo", async (data) => {
        try {
          const { todoId } = data;
          // send updated project
          const newProject = await Project.findById(projectId);
          if (!newProject) {
            throw new Error("Project not found");
          }
          newProject.todos = newProject.todos.filter((id) => id !== todoId);
          await newProject.save();
          await Todo.findByIdAndDelete(todoId);
          emitNewData(projectNamespaces[projectId], projectId);
        } catch (err) {
          console.error(err);
          sendError("Failed to update todos.", socket);
        }
      });
      socket.on("sendMessage", async ({ message }) => {
        try {
          const newMessage = new Message();
          newMessage.message = message;
          newMessage.sender = socket.user._id;
          newMessage.project = projectId;
          await newMessage.save();
          emitNewMessages(projectNamespaces[projectId], projectId);
        } catch (err) {
          console.error(err);
          // send error message??
        }
      });
      socket.on("deleteMessage", async ({ messageId }) => {
        try {
          await Message.findByIdAndDelete(messageId);
          emitNewMessages(projectNamespaces[projectId], projectId);
        } catch (err) {
          console.error(err);
        }
      });

      socket.on("disconnect", async () => {
        const Namespace = io.of(`/${projectId}`);
        if (Namespace.sockets.size == 0) {
          // close the empty room
          Namespace.removeAllListeners();
          delete projectNamespaces[projectId];
        }
        console.log(Object.keys(projectNamespaces).length, "open room");
        console.log("Client disconnected from Project Socket");
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

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
