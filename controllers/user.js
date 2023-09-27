const fs = require("fs");
const _ = require("lodash");
const User = require("../models/user");
const Post = require("../models/post");

exports.userByLogin = (req, res, next, login) => {
  User.findOne({ login }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.hasAuthorization = (req, res, next) => {
  let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
  let adminUser = req.profile && req.auth && req.auth.role === "admin";
  const authorized = sameUser || adminUser;
  if (!authorized) {
    return res.status(403).json({
      error: "User is not authorized to perform this action",
    });
  }
  next();
};

exports.allUsers = (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const name = req.query.name || "";
  let totalItems;
  const Users = User.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return User.find({ name: { $regex: name, $options: "i" } })
        .skip((currentPage - 1) * perPage)
        .select("login name avatar_url location")
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

exports.getUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res, next) => {
  let user = req.profile;
  user = _.extend(user, req.body);
  user.updated = Date.now();
  user.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    const { _id, photo, name, email, role } = user;
    res.json({ _id, photo, email, name, role });
  });
};

exports.deleteUser = (req, res, next) => {
  let user = req.profile;
  user.remove((err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({ message: "User deleted successfully" });
  });
};

exports.findFavorite = (req, res) => {
  if (!req.profile.favoriteCount.includes(req.body.postId)) {
    return res.json(false);
  }
  res.json(true);
};

exports.addFavorite = (req, res) => {
  User.findByIdAndUpdate(
    req.auth._id,
    { $push: { favoriteCount: req.body.postId } },
    (err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json(result);
    }
  );
};

exports.removeFavorite = (req, res) => {
  User.findByIdAndUpdate(
    req.auth._id,
    { $pull: { favoriteCount: req.body.postId } },
    (err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json(result);
    }
  );
};
