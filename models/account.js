const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
  },
  id: {
    type: String,
    trim: true,
    required: true,
  },
  isActive: {
    type: String,
    trim: true,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    required: true,
  },
  profileId: {
    type: String,
    trim: true,
  },
  totalElement: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: "FreeCreator",
  },
});
module.exports = mongoose.model("Account", userSchema);
