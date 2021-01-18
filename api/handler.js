const express = require("express");
const router = express.Router();

const translator = require("./translator");
const storage = require("./storage");
const status = require("./status");
const users = require("./users");

router.use("/translator", translator);
router.use("/storage", storage);
router.use("/status", status);
router.use("/users", users);

module.exports = router;
