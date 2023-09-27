const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Post = require("../models/post");
const User = require("../models/user");
// const expressJwt = require("express-jwt");
const _ = require("lodash");
const { sendEmail } = require("../helpers");
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

exports.getPosts = (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  let totalItems;
  Post.find({ status: req.query.status })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return (
        Post.find({ status: req.query.status })
          .skip((currentPage - 1) * perPage)
          // .populate("comments.postedBy", "_id photo name")
          .populate("postedBy", "_id login name")
          .select("_id favoriteCount html css theme created type")
          .limit(perPage)
          .sort({ created: -1 })
      );
    })
    .then((posts) => {
      res.status(200).json({
        totalPage: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
        currentPage,
        list: posts,
      });
    })
    .catch((err) => console.log(err));
};

exports.getUsers = (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const name = req.query.name || "";
  let totalItems;
  User.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return User.find({ name: { $regex: name, $options: "i" } })
        .skip((currentPage - 1) * perPage)
        .select("login name email company location role")
        .limit(perPage)
        .sort({ created: -1 });
    })
    .then((users) => {
      res.status(200).json({
        totalPage: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
        currentPage,
        list: users,
      });
    })
    .catch((err) => console.log(err));
};

exports.isAdmin = (req, res, next) => {
  let adminUser = req.post && req.auth && req.auth.role === "admin";
  if (!adminUser) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};

exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ message: "No request body" });
  if (!req.body.email)
    return res.status(400).json({ message: "No Email in request body" });
  const { email } = req.body;
  Admin.findOne({ email }, (err, user) => {
    if (err || !user)
      return res.status("401").json({
        error: "User with that email does not exist!",
      });
    const token = jwt.sign(
      { _id: user._id, iss: process.env.APP_NAME },
      process.env.JWT_SECRET
    );
    const emailData = {
      from: "noreply@node-react.com",
      to: email,
      subject: "Password Reset Instructions",
      html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL}/reset-password?token=${token}</p>`,
    };
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ message: err });
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}!`,
        });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  Admin.findOne({ resetPasswordLink }, (err, user) => {
    if (err || !user)
      return res.status("401").json({
        error: "Invalid Link!",
      });
    const updatedFields = {
      password: newPassword,
      resetPasswordLink: "",
    };
    user = _.extend(user, updatedFields);
    user.updated = Date.now();
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: `Great! login with your new password.`,
      });
    });
  });
};