"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _requestIp = require("@supercharge/request-ip");

var getIp = function getIp(req, res, next) {
  var userIp = (0, _requestIp.getClientIp)(req);
  req.headers["x-ip"] = userIp;
  next();
};

var _default = getIp;
exports["default"] = _default;