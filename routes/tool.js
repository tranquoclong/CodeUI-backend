const express = require("express");
// const validator = require("../validator");
const controllersTool = require("../controllers/tool");
const router = express.Router();
router.post("/tool/convert", controllersTool.convert);
router.get("/tool/goldPrice", controllersTool.goldPrice);

module.exports = router;
