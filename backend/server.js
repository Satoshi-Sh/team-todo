const express = require("express");
const app = express();
const port = 3000;
const Member = require("./models/member");
const mongoose = require("mongoose");

// Connect to MongoDB database
mongoose.connect("mongodb://localhost/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());

//signup

app.post("/api/signup");

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
