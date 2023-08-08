const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message: { type: String, required: true },
  // null for bot...
  sender: { type: Schema.Types.ObjectId, ref: "Member", default: null },
  responses: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
});
MessageSchema.set("timestamps", true);

module.exports = mongoose.model("Message", MessageSchema);
