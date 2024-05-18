const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
  html: {
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
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    default: "review",
  },
  subscription: {
    type: String,
    required: true,
  },
  postedBy: {
    type: ObjectId,
    ref: "User",
  },
  typeCSS: {
    type: String,
    required: true,
  },
  viewCount: {
    type: String,
    required: true,
  },
  source: {
    type: Object,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  comments: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: { type: ObjectId, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);
