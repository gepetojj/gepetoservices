"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _node2fa = require("node-2fa");

var _response = _interopRequireDefault(require("../../../assets/response"));

var _textPack = _interopRequireDefault(require("../../../assets/textPack.json"));

var _authorize = _interopRequireDefault(require("../../../assets/middlewares/authorize"));

var _User = _interopRequireDefault(require("../../../assets/models/User"));

var _crypto = _interopRequireDefault(require("../../../assets/crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("dotenv").config();

var router = (0, _express.Router)();

function verifyTfaState(uid) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var user;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _User["default"].findOne({
                _id: uid
              });

            case 3:
              user = _context.sent;

              if (user.state.tfaActivated) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", reject(_textPack["default"].users.tfa.notEnabled));

            case 6:
              return _context.abrupt("return", resolve(user.tfa.secret));

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](0);
              console.error(_context.t0);
              return _context.abrupt("return", reject(_textPack["default"].standards.responseError));

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 9]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  return promise;
}

router.get("/", (0, _authorize["default"])({
  level: 0
}), function (req, res) {
  var code = req.query.code;

  if (!code) {
    return res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullField));
  }

  Promise.resolve([]).then( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(all) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return verifyTfaState(req.user.id).then(function (secret) {
                all.push(secret);
                return all;
              })["catch"](function (err) {
                throw new Error("400:".concat(err));
              });

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }()).then(function (all) {
    var decryptedSecret = (0, _crypto["default"])().dec(all[0]);

    if (decryptedSecret.error) {
      throw new Error("500:".concat(_textPack["default"].standards.responseError));
    }

    all.push(decryptedSecret.result);
    return all;
  }).then(function (all) {
    var verified = (0, _node2fa.verifyToken)(all[1], code);

    if (verified && verified.delta === 0) {
      return res.json((0, _response["default"])(false, _textPack["default"].users.tfa.verified));
    }

    return res.status(401).json((0, _response["default"])(true, _textPack["default"].users.tfa.notVerified));
  })["catch"](function (err) {
    console.log(err);
    var error = err.message.split(":");
    return res.status(error[0]).json((0, _response["default"])(true, error[1]));
  });
});
var _default = router;
exports["default"] = _default;