const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
  hmtl: {
    type: String,
    required: true,
  },
  css: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  postedBy: {
    type: ObjectId,
    ref: "User",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  saves: [{ type: ObjectId, ref: "User" }],
  // comments: [
  //   {
  //     text: String,
  //     created: { type: Date, default: Date.now },
  //     postedBy: { type: ObjectId, ref: "User" },
  //   },
  // ],
});

module.exports = mongoose.model("Loader", postSchema);
