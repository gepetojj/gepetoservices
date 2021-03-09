"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _translator = _interopRequireDefault(require("./translator"));

var _storage = _interopRequireDefault(require("./storage"));

var _status = _interopRequireDefault(require("./status"));

var _users = _interopRequireDefault(require("./users"));

var _docs = _interopRequireDefault(require("./docs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.use("/translator", _translator["default"]);
router.use("/storage", _storage["default"]);
router.use("/status", _status["default"]);
router.use("/users", _users["default"]);
router.use("/docs", _docs["default"]);
var _default = router;
exports["default"] = _default;