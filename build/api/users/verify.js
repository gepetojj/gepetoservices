"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _response = _interopRequireDefault(require("../../assets/response"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _authorize = _interopRequireDefault(require("../../assets/middlewares/authorize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("dotenv").config();

var router = (0, _express.Router)();
router.get("/", (0, _authorize["default"])({
  level: 0
}), function (req, res) {
  var app = req.headers["x-from-app"] || "noapp";

  if (req.user) {
    if (req.user.app === app) {
      return res.json((0, _response["default"])(false, _textPack["default"].users.verify.authenticated, {
        user: req.user
      }));
    } else {
      return res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.invalidApp));
    }
  } else {
    return res.status(401).json((0, _response["default"])(true, _textPack["default"].users.verify.notAuthenticated));
  }
});
var _default = router;
exports["default"] = _default;