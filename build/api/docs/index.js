"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));

var _package = require("../../package.json");

var _swagger = _interopRequireDefault(require("./swagger.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
var specs = _swagger["default"];
_swagger["default"].info.version = _package.version;
router.use("/", _swaggerUiExpress["default"].serve, _swaggerUiExpress["default"].setup(specs));
var _default = router;
exports["default"] = _default;