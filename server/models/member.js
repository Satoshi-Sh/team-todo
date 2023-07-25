const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: Schema.Types.ObjectId, ref: "Image" },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Member", MemberSchema);
