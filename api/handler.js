const express = require("express");
const router = express.Router();

const translator = require("./translator");
const storage = require("./storage");

router.use("/translator", translator);
router.use("/storage", storage);

module.exports = router;
