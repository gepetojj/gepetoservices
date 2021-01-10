const express = require("express");
const router = express.Router();

const translator = require("./translator");

router.use("/translator", translator);

module.exports = router;
