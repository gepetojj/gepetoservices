const express = require("express");
const router = express.Router();

const upload = require("./upload");

router.use("/upload", upload);

module.exports = router;
