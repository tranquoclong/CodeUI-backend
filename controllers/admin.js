const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Post = require("../models/post");
const User = require("../models/user");
// const expressJwt = require("express-jwt");
const _ = require("lodash");
const { sendEmail } = require("../helpers");
const { sendMailForgotPassword } = require("../docs/mail");
dotenv.config();
exports.signUp = async (req, res) => {
  const adminExists = await Admin.findOne({ email: req.body.email });
  if (adminExists)
    return res.status(403).json({
      error: "Email is taken!",
    });
  const admin = await new Admin(req.body);
  await admin.save();
  res
    .status(200)
    .json({ id: admin._id, message: "Signup success! Please login." });
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
    const secretKey =
      "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING";
    const issuer = "https://securetoken.google.com/codeui-node";
    const audience =
      "933189481718-in99pgtqbcs8crfpf0go7n0bkhikb17n.apps.googleusercontent.com";
    const { _id, guid, userName, email, role } = admin;
    let claims = {
      jti: require("crypto").randomUUID(),
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": userName,
      nameid: _id,
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
        guid,
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": role,
    };

    const token = jwt.sign(claims, secretKey, {
      algorithm: "HS256",
      expiresIn: "30d",
      issuer: issuer,
      audience: audience,
    });
    res.cookie("t", token, { expire: new Date() + 9999 });
    return res.json({ token, _id, guid, email, userName, role });
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
  const userName = req.query.userName || "tranquoclong";
  let totalItems;
  Admin.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Admin.find({ userName: { $ne: userName } })
        .skip((currentPage - 1) * perPage)
        .select("userName fullName email phone")
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

exports.updateUser = (req, res) => {
  Admin.findOne({ _id: req.body._id }, (err, user) => {
    if (err || !user)
      return res.status("401").json({
        error: "Invalid!",
      });
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: `update mod successfully.`,
      });
    });
  });
};

exports.deleteMod = (req, res) => {
  Admin.findOne({ _id: req.query.id }, (err, user) => {
    if (err || !user)
      return res.status("401").json({
        error: "Invalid!",
      });
    user.remove((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: `remove mod successfully.`,
      });
    });
  });
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
      html: sendMailForgotPassword(token),
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

exports.changePassword = (req, res) => {
  const { email, oldPassword, password } = req.body;
  Admin.findOne({ email }, (err, user) => {
    if (err || !user)
      return res.status("401").json({
        error: "Invalid Link!",
      });
    if (!user.authenticate(oldPassword)) {
      return res.status(401).json({
        error: "password do not match",
      });
    }
    const updatedFields = {
      password: password,
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
        message: `Great! change password success.`,
      });
    });
  });
};

exports.actionFulfillment = (req, res) => {
  const { email, action, type } = req.body;
  const emailData = {
    from: "noreply@node-react.com",
    to: email,
    subject:
      type === "submit"
        ? "This Fulfillment has been submit"
        : type === "reject"
        ? "This Fulfillment has been rejected"
        : "This Fulfillment has been accepted",
    html: sendMailForgotPassword(false, action, type),
  };
  sendEmail(emailData);
  return res.status(200).json({
    message: `Email has been sent to ${email}!`,
  });
};
