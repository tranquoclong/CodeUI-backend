const fs = require("fs");
const _ = require("lodash");
const Post = require("../models/post");
const formidable = require("formidable");

exports.getPosts = (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  let totalItems;
  const filterType =
    req.query.type !== "all"
      ? { type: req.query.type, status: "approved" }
      : { status: "approved" };
  Post.find(filterType)
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return (
        Post.find(filterType)
          .skip((currentPage - 1) * perPage)
          // .populate("comments.postedBy", "_id photo name")
          .populate("postedBy", "_id login name")
          .select("_id html css theme created type")
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

exports.getFavoritePosts = (req, res) => {
  let favoriteCount = req.profile.favoriteCount;
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  let totalItems;
  Post.find({ _id: { $nin: favoriteCount } })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find({ _id: { $in: favoriteCount } })
        .skip((currentPage - 1) * perPage)
        .populate("postedBy", "_id login name")
        .select("_id html css theme created type")
        .limit(perPage)
        .sort({ created: -1 });
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

exports.postById = (req, res, next, id) => {
  Post.findById(id)
    // .populate("comments.postedBy", "_id photo name")
    .populate("postedBy", "_id login name")
    .select("_id favoriteCount html css theme created type")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: err,
        });
      }
      req.post = post;
      next();
    });
};
exports.getPost = async (req, res) => {
  const currentPage = req.query.page || 1;
  const perPage = 6;
  let totalItems;
  await Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
        .select("_id title body created likes")
        .limit(perPage)
        .sort({ created: -1 });
    })
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => console.log(err));
};
exports.createPost = (req, res) => {
  let post = new Post(req.body);
  post.postedBy = req.profile;
  post.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};
exports.postApprovedByUser = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  let totalItems;
  await Post.find({ postedBy: req.profile._id })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find({ postedBy: req.profile._id, status: "approved" })
        .skip((currentPage - 1) * perPage)
        .populate("postedBy", "_id login")
        .select("_id favoriteCount html css theme type status")
        .limit(perPage)
        .sort("_created");
    })
    .then((posts) => {
      res.status(200).json({
        totalPage: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
        currentPage,
        posts,
      });
    })
    .catch((err) => console.log(err));
};
exports.postReviewByUser = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  let totalItems;
  await Post.find({ postedBy: req.profile._id})
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find({ postedBy: req.profile._id, status: "review" })
        .skip((currentPage - 1) * perPage)
        .populate("postedBy", "_id login")
        .select("_id favoriteCount html css theme type status")
        .limit(perPage)
        .sort("_created");
    })
    .then((posts) => {
      res.status(200).json({
        totalPage: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
        currentPage,
        posts,
      });
    })
    .catch((err) => console.log(err));
};
exports.postRejectedByUser = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  let totalItems;
  await Post.find({ postedBy: req.profile._id })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find({ postedBy: req.profile._id, status: "rejected" })
        .skip((currentPage - 1) * perPage)
        .populate("postedBy", "_id login")
        .select("_id favoriteCount html css theme type status")
        .limit(perPage)
        .sort("_created");
    })
    .then((posts) => {
      res.status(200).json({
        totalPage: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
        currentPage,
        posts,
      });
    })
    .catch((err) => console.log(err));
};
exports.isUser = (req, res, next) => {
  let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!sameUser) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};
exports.isPoster = (req, res, next) => {
  let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  if (!sameUser) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};
exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((err, post) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      message: "Post deleted successfully",
    });
  });
};
exports.updatePost = (req, res) => {
  let post = req.post;
  post = _.extend(post, req.body);
  post.status = "review";
  post.updated = Date.now();
  post.save((err) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(post);
  });
};

exports.singlePost = (req, res) => {
  return res.json(req.post);
};
