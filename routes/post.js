const express = require("express");
// const validator = require("../validator");
const controllersUser = require("../controllers/user");
const controllersPost = require("../controllers/post");
const { requireSignIn } = require("../controllers/auth");
const router = express.Router();
router.get("/posts", controllersPost.getPosts);
router.post(
  "/post/new/:login",
  // requireSignIn,
  controllersPost.createPost
  // validator.createPostValidator
);
router.get(
  "/getFavorite/:login",
  // requireSignIn,
  controllersPost.getFavoritePosts
);
router.get(
  "/postApproved/by/:login",
  controllersPost.postApprovedByUser
);
router.get(
  "/postReview/by/:login",
  // requireSignIn,
  controllersPost.isUser,
  controllersPost.postReviewByUser
);
router.get(
  "/postRejected/by/:login",
  // requireSignIn,
  controllersPost.isUser,
  controllersPost.postRejectedByUser
);
router.get("/post/:postId", controllersPost.singlePost);
router.put(
  "/post/:postId",
  // requireSignIn,
  controllersPost.isPoster,
  controllersPost.updatePost
);
router.delete(
  "/post/:postId",
  // requireSignIn,
  controllersPost.isPoster,
  controllersPost.deletePost
);
router.param("login", controllersUser.userByLogin);
router.param("postId", controllersPost.postById);
module.exports = router;
