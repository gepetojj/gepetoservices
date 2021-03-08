"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _access = _interopRequireDefault(require("./access"));

var _delete = _interopRequireDefault(require("./delete"));

var _upload = _interopRequireDefault(require("./upload"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.use("/access", _access["default"]);
router.use("/delete", _delete["default"]);
router.use("/upload", _upload["default"]);
var _default = router;
exports["default"] = _default;