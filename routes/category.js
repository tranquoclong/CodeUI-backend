const express = require("express");
const controllersCategory = require("../controllers/category");
const router = express.Router();
router.get("/category", controllersCategory.getCategory);
router.post("/category", controllersCategory.postCategory);
module.exports = router;
