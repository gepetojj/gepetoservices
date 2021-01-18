const express = require("express");
const router = express.Router();

const create = require("./create");

router.use("/create", create);

module.exports = router;
