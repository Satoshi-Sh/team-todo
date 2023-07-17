const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  imageContent: {
    type: Buffer,
  },
  contentType: {
    type: String,
  },
  fileName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", ImageSchema);
