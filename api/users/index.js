const express = require("express");
const router = express.Router();

const create = require("./create");
const verify = require("./verify");

router.use("/create", create);
router.use("/verify", verify);

module.exports = router;
