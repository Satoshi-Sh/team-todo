const {
  uploadImage,
  getDefaultProjectImageID,
  getTodoIds,
} = require("../utils/utils");

const Image = require("../models/image");
const Project = require("../models/project");
const Todo = require("../models/todo");
const Message = require("../models/message");

const getProjects = async (req, res) => {
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
};

const getProjectById = async (req, res) => {
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
};

const createNewProject = async (req, res) => {
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
    const project = await newProject.save();
    res.json({ projectId: project._id, message: `${title} is created.` });
  } catch (err) {
    console.error(err);
    res.json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const owner = req.user["_id"];
    const { title, due, description } = req.body;
    const updatedProject = await Project.findById(projectId).populate("image");
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
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const owner = req.user["_id"];
    const deletedProject = await Project.findById(projectId).populate("image");

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
    // delete all messages
    await Message.deleteMany({ project: projectId });
    const deleted = await Project.findByIdAndDelete(projectId);

    res.json({ message: `${deleted.title} is deleted.` });
  } catch (err) {
    console.error(err);
    res.json({ error: err.message, message: "Failed to delete the project" });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createNewProject,
  updateProject,
  deleteProject,
};
