const {
  getTodoIds2,
  addMember,
  emitNewData,
  sendError,
  emitNewMessages,
  checkProject,
} = require("../utils/utils");

const { extractToken } = require("../utils/auth");
const Message = require("../models/message");
const Project = require("../models/project");
const Todo = require("../models/todo");

const joinProject = async (projectId, socket, projectNamespaces) => {
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
};

const leaveProject = async (projectId, socket, projectNamespaces) => {
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
    // delete messages
    await Message.deleteMany({ sender: socket.user._id });
    await project.save();
    emitNewData(projectNamespaces[projectId], projectId);
    emitNewMessages(projectNamespaces[projectId], projectId);
  } catch (error) {
    console.error(error);
    sendError("Failed to leave the project", projectNamespaces[projectId]);
  }
};

// function for when user deleted the account
const leaveProjectOnDelete = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId).populate("todos");
    if (!project) {
      throw new Error("Project not found");
    }
    project.members.pull({ _id: userId });
    for (let todo of project.todos) {
      if (todo.assignee && todo.assignee.equals(userId)) {
        todo.assignee = null;
        todo.status = "Open";
        await todo.save();
      }
    }
    // delete messages
    await Message.deleteMany({ sender: userId });
    await project.save();
    console.log(`Left Project:${project.title}`);
  } catch (error) {
    console.error(error);
    sendError("Failed to leave the project", projectNamespaces[projectId]);
  }
};

const assignTask = async (projectId, socket, projectNamespaces, data) => {
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
};

const unassignTask = async (projectId, socket, projectNamespaces, data) => {
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
};
const completeTask = async (projectId, socket, projectNamespaces, data) => {
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
};

const unmarkComplete = async (projectId, socket, projectNamespaces, data) => {
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
};

const updateTodos = async (projectId, socket, projectNamespaces, data) => {
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
};

const deleteTodo = async (projectId, socket, projectNamespaces, data) => {
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
};

const sendMessage = async (projectId, socket, projectNamespaces, message) => {
  try {
    // make sure if the project is there
    await checkProject(projectId);
    const newMessage = new Message();
    newMessage.message = message;
    newMessage.sender = socket.user._id;
    newMessage.project = projectId;
    await newMessage.save();
    emitNewMessages(projectNamespaces[projectId], projectId);
  } catch (err) {
    console.error(err);
    sendError("Failed to send a message.", socket);
  }
};

const deleteMessage = async (projectId, projectNamespaces, messageId) => {
  try {
    // make sure if the project is there
    await checkProject(projectId);
    await Message.findByIdAndDelete(messageId);
    emitNewMessages(projectNamespaces[projectId], projectId);
  } catch (err) {
    console.error(err);
    sendError("Failed to send a message.", socket);
  }
};

const disconnect = async (projectId, io, projectNamespaces) => {
  const Namespace = io.of(`/${projectId}`);
  if (Namespace.sockets.size == 0) {
    // close the empty room
    Namespace.removeAllListeners();
    delete projectNamespaces[projectId];
  }
  console.log(Object.keys(projectNamespaces).length, "open room");
  console.log("Client disconnected from Project Socket");
};

const createProjectNamespace = (io, projectNamespaces, projectId) => {
  if (!projectNamespaces[projectId]) {
    projectNamespaces[projectId] = io.of(`/${projectId}`);
    projectNamespaces[projectId].use(extractToken);
    projectNamespaces[projectId].on("connection", (socket) => {
      // Handle socket events within this project's namespace
      console.log(`User connected to Project: ${projectId}`);
      // send Messages on project when user
      emitNewMessages(socket, projectId);

      socket.on("joinProject", () => {
        joinProject(projectId, socket, projectNamespaces);
      });
      socket.on("leaveProject", () => {
        leaveProject(projectId, socket, projectNamespaces);
      });
      socket.on("assignTask", (data) => {
        assignTask(projectId, socket, projectNamespaces, data);
      });
      socket.on("unassignTask", (data) => {
        unassignTask(projectId, socket, projectNamespaces, data);
      });
      socket.on("completeTask", (data) => {
        completeTask(projectId, socket, projectNamespaces, data);
      });
      socket.on("unmarkComplete", (data) => {
        unmarkComplete(projectId, socket, projectNamespaces, data);
      });
      socket.on("updateTodos", (data) =>
        updateTodos(projectId, socket, projectNamespaces, data)
      );
      socket.on("deleteTodo", (data) =>
        deleteTodo(projectId, socket, projectNamespaces, data)
      );
      socket.on("sendMessage", ({ message }) => {
        sendMessage(projectId, socket, projectNamespaces, message);
      });
      socket.on("deleteMessage", ({ messageId }) => {
        deleteMessage(projectId, socket, projectNamespaces, messageId);
      });

      socket.on("disconnect", () =>
        disconnect(projectId, io, projectNamespaces)
      );
    });
  }
};

module.exports = {
  createProjectNamespace,
  leaveProjectOnDelete,
};
