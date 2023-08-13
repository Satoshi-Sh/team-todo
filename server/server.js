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
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("owner")
      .populate("todos")
      .populate("image")
      .populate({ path: "owner", populate: { path: "avatar" } });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve projects.." });
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
      .populate("todos")
      .populate({ path: "todos", populate: { path: "assignee" } });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.send(project);
  } catch (err) {
    console.error(err);
    res.send({ message: "Failed to retrieve the project..." });
  }
});

// create new project
app.post(
  "/api/projects",
  upload.single("selectedFile"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User has to be logged in" });
        return;
      }
      const owner = req.user["_id"];
      const { title, due, description, todos } = req.body;
      // todo when file is not attached by the user
      let imageId;
      try {
        if (!req.file) {
          // use default image id
          imageId = await getDefaultProjectImageID();
        } else {
          // error message when file is too big?
          imageId = await uploadImage(req.file);
        }
      } catch {
        throw new Error("Failed to upload the image file");
      }
      let todoIds;
      try {
        // add todos
        todoIds = await getTodoIds(todos);
      } catch {
        throw new Error("Failed to uplaod the todos");
      }
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

// update project

app.patch(
  "/api/projects/:projectId",
  upload.single("selectedFile"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const owner = req.user["_id"];
      const { title, due, description } = req.body;
      const updatedProject = await Project.findById(projectId).populate(
        "image"
      );
      if (!updatedProject) {
        res.status(404).json({ error: "Project is not found.." });
      } else if (!updatedProject.owner.equals(owner)) {
        throw new Error("Only owner can edit the project..");
      }
      if (req.file) {
        // error message when file is too big?
        const imageId = await uploadImage(req.file);
        // delete old one if it's not default
        if (!updatedProject.image.fileName) {
          await Image.findByIdAndDelete(updatedProject.image);
        }
        updatedProject.image = imageId;
      }
      updatedProject.title = title;
      updatedProject.due = due;
      updatedProject.description = description;
      const project = await updatedProject.save();
      res.json({ message: `${project.title} is updated.` });
    } catch (err) {
      console.error(err);
      res.json({ error: err.message, message: "Failed to update the project" });
    }
  }
);

// delete project

app.delete(
  "/api/projects/:projectId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const owner = req.user["_id"];
      const deletedProject = await Project.findById(projectId).populate(
        "image"
      );

      if (!deletedProject.owner.equals(owner)) {
        throw new Error("Only owner can delete the project..");
      }
      // delete old image if it's not default
      if (!deletedProject.image.fileName) {
        await Image.findByIdAndDelete(deletedProject.image);
      }
      // delete all the todos
      for (let todo of deletedProject.todos) {
        await Todo.findByIdAndDelete(todo);
      }
      const deleted = await Project.findByIdAndDelete(projectId);

      res.json({ message: `${deleted.title} is deleted.` });
    } catch (err) {
      console.error(err);
      res.json({ error: err.message, message: "Failed to delete the project" });
    }
  }
);

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
          const updatedProject = await project.findById(projectId);
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
          const newProject = await project.findById(projectId);
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
