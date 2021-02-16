const express = require("express");
const router = express.Router();

const avatar = require("./avatar");
const password = require("./password");

router.use("/avatar", avatar);
router.use("/password", password);

module.exports = router;
