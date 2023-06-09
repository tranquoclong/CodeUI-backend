const express = require("express");
const validator = require("../validator");
const controllersUser = require("../controllers/user");
const controllersPost = require("../controllers/post");
const { requireSignIn } = require("../controllers/auth");
const router = express.Router();

router.get("/posts", controllersPost.getPosts);
router.put("/post/like", requireSignIn, controllersPost.like);
router.put("/post/unlike", requireSignIn, controllersPost.unlike);
router.put("/post/comment", requireSignIn, controllersPost.comment);
router.put("/post/uncomment", requireSignIn, controllersPost.uncomment);
router.put("/post/updateComment", requireSignIn, controllersPost.updateComment);
router.post(
  "/post/new/:login",controllersPost.createPost
  // validator.createPostValidator
);
router.get("/postApproved/by/:login", controllersPost.postApprovedByUser);
router.get("/postReview/by/:login", controllersPost.postReviewByUser);
router.get("/postRejected/by/:login", controllersPost.postRejectedByUser);
router.get("/post/:postId", controllersPost.singlePost);
router.put(
  "/post/:postId",
  // controllersPost.isPoster,
  controllersPost.updatePost
);
router.delete(
  "/post/:postId",
  // controllersPost.isPoster,
  controllersPost.deletePost
);
router.get("/post/photo/:postId", controllersPost.photo);
router.param("login", controllersUser.userByLogin);
router.param("postId", controllersPost.postById);
module.exports = router;
