const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  text: { type: String, required: true },
  // null for bot...
  sender: { type: Schema.Types.ObjectId, ref: "Member", default: null },
  responses: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
});
userSchema.set("timeStamps", true);

module.exports = mongoose.model("Message", MessageSchema);
