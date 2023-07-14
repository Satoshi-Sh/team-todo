const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignee: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  status: {
    type: String,
    enum: ["Open", "Assigned", "Completed"],
    default: "Open",
  },
});

module.exports = mongoose.model("Todo", TodoSchema);
