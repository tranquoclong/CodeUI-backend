const getAllPost = require("./getAllPost");
const getPostById = require("./getPostById");
const createPostById = require("./createPostById");
const updatePostById = require("./updatePostById");
const deletePostById = require("./deletePostById");
module.exports = {
  "/posts": {
    ...getAllPost,
  },
  "/post/new/{userId}": {
    ...createPostById,
  },
  "/post/{postId}": {
    ...getPostById,
  },
  "/updatePost/{postId}": {
    ...updatePostById,
  },
  "/deletePost/{postId}": {
    ...deletePostById,
  },
};
