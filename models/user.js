const mongoose = require("mongoose");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;
const Post = require("./post");

const userSchema = new mongoose.Schema({
  node_id: {
    type: String,
    trim: true,
    required: true,
  },
  login: {
    type: String,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  salt: String,
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  avatar_url: {
    type: String,
    trim: true,
    required: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  html_url: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: "user",
  },
});
userSchema.pre("remove", function (next) {
  Post.remove({ postedBy: this._id }).exec();
  next();
});
module.exports = mongoose.model("User", userSchema);
