const mongoose = require("mongoose");
const Member = require("./models/member");
const Project = require("./models/project");
const Image = require("./models/image");
const Todo = require("./models/todo");
const { connectToMongoDB } = require("./settingup_db");
const fs = require("fs");
const { hashPassword } = require("./utils/utils");
require("dotenv").config();

// Create fresh mydb
connectToMongoDB();

mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function insertSampleData() {
  try {
    // Create an image
    const imageBuffer = fs.readFileSync("./assets/default-user-image.png");
    const contentType = "image/png";
    const fileName = "default-user-image.png";
    image1 = await Image.create({
      imageContent: imageBuffer,
      fileName,
      contentType,
    });
    const hash = await hashPassword(process.env["PASSWORD"]);
    // Create a member
    const member = await Member.create({
      username: "john",
      email: "john@example.com",
      password: hash,
      avatar: image1._id,
    });
    const imageBuffer2 = fs.readFileSync("./assets/project-management.png");
    const image2 = await Image.create({
      imageContent: imageBuffer2,
      fileName: "project-management.png",
      contentType,
    });

    // Create a project with references to member and image
    const project = await Project.create({
      title: "Sample Project",
      owner: member._id,
      members: [member._id],
      description: "Sample project description",
      image: image2._id,
    });

    // Create a todo with reference to member and project
    const todo = await Todo.create({
      title: "Sample Todo",
      description: "Sample todo description",
      assignee: member._id,
      project: project._id,
      status: "Open",
    });

    console.log("Sample data inserted successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Call the insertSampleData function
insertSampleData();
