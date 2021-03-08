"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _register = _interopRequireDefault(require("./register"));

var _confirm = _interopRequireDefault(require("./confirm"));

var _login = _interopRequireDefault(require("./login"));

var _verify = _interopRequireDefault(require("./verify"));

var _refresh = _interopRequireDefault(require("./refresh"));

var _change = _interopRequireDefault(require("./change"));

var _tfa = _interopRequireDefault(require("./tfa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.use("/register", _register["default"]);
router.use("/confirm", _confirm["default"]);
router.use("/login", _login["default"]);
router.use("/verify", _verify["default"]);
router.use("/refresh", _refresh["default"]);
router.use("/change", _change["default"]);
router.use("/tfa", _tfa["default"]);
var _default = router;
exports["default"] = _default;