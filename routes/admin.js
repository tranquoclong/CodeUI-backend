const express = require("express");
const controllersAdmin = require("../controllers/admin");
const controllersPost = require("../controllers/post");
const { requireSignIn } = require("../controllers/auth");
const router = express.Router();

router.post("/admin/signUp", controllersAdmin.signUp);
router.post("/admin/signIn", controllersAdmin.signIn);
router.get("/admin/signOut", controllersAdmin.signOut);
router.put("/admin/forgot-password", controllersAdmin.forgotPassword);
router.put("/admin/reset-password", controllersAdmin.resetPassword);
router.put(
  "/updateStatus/:postId",
  requireSignIn,
  controllersAdmin.isAdmin,
  controllersAdmin.updateStatus
);

router.get("/admin/users", controllersAdmin.getUsers);
router.get("/admin/posts", controllersAdmin.getPosts);

router.param("postId", controllersPost.postById);
module.exports = router;
