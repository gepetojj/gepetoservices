"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _response = _interopRequireDefault(require("../../assets/response"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _token = _interopRequireDefault(require("../../assets/token"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
router.get("/", function (req, res) {
  var refreshToken = req.cookies["refreshToken"];
  var app = req.headers["x-from-app"] || "noapp";
  var agent = req.headers["user-agent"];

  if (!refreshToken) {
    return res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.nullToken));
  }

  if (!["noapp", "lastpwd", "ppt"].includes(app)) {
    return res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.invalidApp));
  }

  Promise.resolve([]).then( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(all) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _token["default"])().verify(refreshToken, "refresh").then(function (decoded) {
                if (decoded.app !== app) {
                  throw new Error("401:".concat(_textPack["default"].users.refresh.invalidApp));
                }

                all.push(decoded);
                return all;
              })["catch"](function (err) {
                throw new Error("".concat(err.code, ":").concat(err.message));
              });

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }()).then(function (all) {
    var accessToken = (0, _token["default"])().create({
      id: all[0].id,
      app: all[0].app
    }, "access");

    if (accessToken.error) {
      throw new Error("500:".concat(_textPack["default"].standards.responseError));
    }

    return res.json((0, _response["default"])(false, _textPack["default"].users.refresh.tokenRefreshed, {
      accessToken: accessToken.token
    }));
  })["catch"](function (err) {
    //performanceLog.finish();
    var error = err.message.split(":");
    return res.status(error[0]).json((0, _response["default"])(true, error[1]));
  });
});
var _default = router;
exports["default"] = _default;