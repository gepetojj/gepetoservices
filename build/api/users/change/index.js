"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _avatar = _interopRequireDefault(require("./avatar"));

var _password = _interopRequireDefault(require("./password"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.use("/avatar", _avatar["default"]);
router.use("/password", _password["default"]);
var _default = router;
exports["default"] = _default;