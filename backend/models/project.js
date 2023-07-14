const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  image: { type: Schema.Types.ObjectId, ref: "Image" },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  todos: [{ type: Schema.Types.ObjectId, ref: "Todo" }],
  due: { type: Date },
});

module.exports = mongoose.model("Project", ProjectSchema);
