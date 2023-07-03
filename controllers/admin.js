const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Post = require("../models/post");
// const expressJwt = require("express-jwt");
const _ = require("lodash");
dotenv.config();
exports.signUp = async (req, res) => {
  const adminExists = await Admin.findOne({ email: req.body.email });
  if (adminExists)
    return res.status(403).json({
      error: "Email is taken!",
    });
  const admin = await new Admin(req.body);
  await admin.save();
  res.status(200).json({ message: "Signup success! Please login." });
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;
  Admin.findOne({ email }, (err, admin) => {
    if (err || !admin) {
      return res.status(401).json({
        error: "Admin with that email does not exist. Please signup.",
      });
    }
    if (!admin.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    const token = jwt.sign(
      { _id: admin._id, role: admin.role },
      process.env.JWT_SECRET
    );
    res.cookie("t", token, { expire: new Date() + 9999 });
    const { _id, name, email, role } = admin;
    return res.json({ token, admin: { _id, email, name, role } });
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "SignOut success!" });
};

exports.updateStatus = (req, res) => {
  console.log(req.post._id);
  Post.findByIdAndUpdate(req.post._id, {
    status: req.body.status,
  }).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({ message: "update status successfully" });
  });
};

// exports.requireSignIn = expressJwt({
//   secret: process.env.JWT_SECRET,
//   algorithms: ["HS256"],
//   userProperty: "auth",
// });
