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
} = require("./utils/utils");
const {
  configurePassport,
  generateToken,
  extractToken,
} = require("./utils/auth");
const project = require("./models/project");

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
  }
);
// account update
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
    res.json({ error: "Incorrect Username and/or Password" });
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
      .populate("todos")
      .populate({ path: "todos", populate: { path: "assignee" } });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.send(project);
  } catch (err) {
    console.error(err);
    res.send({ message: "Something went wrong..." });
  }
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
      if (!updatedProject.owner.equals(owner)) {
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
      res.json({ message: err.message });
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
      res.json({ error: err.message });
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

      socket.on("joinProject", async (data) => {
        try {
          response = await addMember(projectId, socket.user._id);
          if ("message" in response) {
            emitNewData(projectNamespaces[projectId], projectId);
          }
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
          updatedProject.save();
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
          console.log(todoId);
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
