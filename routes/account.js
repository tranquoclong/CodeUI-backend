const express = require("express");
const controllersAccount = require("../controllers/account");
const router = express.Router();
router.get("/account", controllersAccount.allAccounts);

module.exports = router;
