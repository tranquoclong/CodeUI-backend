const express = require("express");
// const validator = require("../validator");
const controllersTool = require("../controllers/tool");
const router = express.Router();
router.post("/tool/convert", controllersTool.convert);

module.exports = router;
