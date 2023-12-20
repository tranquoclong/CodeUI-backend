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
router.put("/admin/change-password", controllersAdmin.changePassword);
router.put("/admin/updateMod", controllersAdmin.updateUser);
router.put(
  "/updateStatus/:postId",
  requireSignIn,
  controllersAdmin.isAdmin,
  controllersAdmin.updateStatus
);
router.post("/admin/sendFulfillment", controllersAdmin.actionFulfillment);
router.post("/admin/sendReport", controllersAdmin.actionReport);


router.get("/admin/mod", controllersAdmin.getUsers);
router.get("/admin/posts", controllersAdmin.getPosts);
router.delete("/admin/deleteMod", controllersAdmin.deleteMod);


router.param("postId", controllersPost.postById);
module.exports = router;
