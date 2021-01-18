const express = require("express");
const router = express.Router();

const translator = require("./translator");
const storage = require("./storage");
const status = require("./status");

router.use("/translator", translator);
router.use("/storage", storage);
router.use("/status", status);

module.exports = router;
