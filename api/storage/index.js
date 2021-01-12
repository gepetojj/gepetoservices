const express = require("express");
const router = express.Router();

const access = require("./access");
const deleteFile = require("./delete");
const upload = require("./upload");

router.use("/access", access);
router.use("/delete", deleteFile);
router.use("/upload", upload);

module.exports = router;
