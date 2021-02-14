const express = require("express");
const router = express.Router();

const register = require("./register");
const confirm = require("./confirm");
const login = require("./login");
const verify = require("./verify");

const change = require("./change");

router.use("/register", register);
router.use("/confirm", confirm);
router.use("/login", login);
router.use("/verify", verify);

router.use("/change", change);

module.exports = router;
