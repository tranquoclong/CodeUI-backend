const express = require("express");
const controllersAdmin = require("../controllers/admin");
const controllersPost = require("../controllers/post");
const router = express.Router();

router.post("/admin/signUp", controllersAdmin.signUp);
router.post("/admin/signIn", controllersAdmin.signIn);
router.get("/admin/signOut", controllersAdmin.signOut);
router.put("/updateStatus/:postId", controllersAdmin.updateStatus);

router.param("postId", controllersPost.postById);
module.exports = router;
