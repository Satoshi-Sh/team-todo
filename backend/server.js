const express = require("express");
const app = express();
const port = 3000;
const Member = require("./models/member");
const Image = require("./models/image");
const mongoose = require("mongoose");
const cors = require("cors");

// Connect to MongoDB database
mongoose.connect("mongodb://localhost/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors({ origin: "http://localhost:4000" }));
app.use(express.json());

//signup

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const newMember = new Member({
      username,
      email,
      password,
    });
    newMember.save();
    res.send(`${username} is created.`);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.find({});
    res.send(members);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
