const { addMessage, getMessages } = require("../controllers/message");
const router = require("express").Router();

router.post("/messages/addmsg/", addMessage);
router.post("/messages/getmsg/", getMessages);

module.exports = router;
