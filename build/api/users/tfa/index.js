"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _enable = _interopRequireDefault(require("./enable"));

var _verify = _interopRequireDefault(require("./verify"));

var _disable = _interopRequireDefault(require("./disable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.use("/enable", _enable["default"]);
router.use("/verify", _verify["default"]);
router.use("/disable", _disable["default"]);
var _default = router;
exports["default"] = _default;