"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _rateLimiterFlexible = require("rate-limiter-flexible");

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _response = _interopRequireDefault(require("../response"));

var _textPack = _interopRequireDefault(require("../textPack.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("dotenv").config();

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");
var points = 50;
var minimizedPoints = 5;
var duration = 1800; // 30 minutos em segundos

var pointsConsumed = 200;
var minimizedPointsConsumed = 10;
var blockDuration = 30; // segundos

var normalLimiter = new _rateLimiterFlexible.RateLimiterMemory({
  points: points,
  duration: duration,
  inmemoryBlockOnConsumed: pointsConsumed,
  inmemoryBlockDuration: blockDuration
});
var minimizedLimiter = new _rateLimiterFlexible.RateLimiterMemory({
  points: minimizedPoints,
  duration: duration,
  inmemoryBlockOnConsumed: minimizedPointsConsumed,
  inmemoryBlockDuration: blockDuration
});

function getHeaders(limiter) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "normal";

  if (type !== "normal") {
    var headers = {
      "Retry-After": limiter.msBeforeNext / 1000,
      "X-RateLimit-Limit": minimizedPoints,
      "X-RateLimit-Remaining": limiter.remainingPoints,
      "X-RateLimit-Reset": (0, _momentTimezone["default"])((0, _momentTimezone["default"])() + limiter.msBeforeNext).format("DD/MM/YYYY hh:mm:ss [GMT-3]")
    };
    return headers;
  } else {
    var _headers = {
      "Retry-After": limiter.msBeforeNext / 1000,
      "X-RateLimit-Limit": points,
      "X-RateLimit-Remaining": limiter.remainingPoints,
      "X-RateLimit-Reset": (0, _momentTimezone["default"])((0, _momentTimezone["default"])() + limiter.msBeforeNext).format("DD/MM/YYYY hh:mm:ss [GMT-3]")
    };
    return _headers;
  }
}

var rateLimiter = function rateLimiter(req, res, next) {
  if (_textPack["default"].rateLimiter.endpoints.includes(req.path)) {
    minimizedLimiter.consume(req.headers["x-ip"]).then(function (limiter) {
      var headers = getHeaders(limiter, "minimized");
      res.set(headers);
      return next();
    })["catch"](function (limiter) {
      var headers = getHeaders(limiter, "minimized");
      res.set(headers);
      return res.status(429).json((0, _response["default"])(true, _textPack["default"].rateLimiter.responseError, {
        limit: "".concat(minimizedPoints, " requests em ").concat(Math.floor(duration / 60), " minutos.")
      }));
    });
  } else {
    normalLimiter.consume(req.headers["x-ip"]).then(function (limiter) {
      var headers = getHeaders(limiter);
      res.set(headers);
      return next();
    })["catch"](function (limiter) {
      var headers = getHeaders(limiter);
      res.set(headers);
      return res.status(429).json((0, _response["default"])(true, _textPack["default"].rateLimiter.responseError, {
        limit: "".concat(points, " requests em ").concat(Math.floor(duration / 60), " minutos.")
      }));
    });
  }
};

var _default = rateLimiter;
exports["default"] = _default;