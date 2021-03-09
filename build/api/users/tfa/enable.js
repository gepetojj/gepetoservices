"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _node2fa = require("node-2fa");

var _shortid = require("shortid");

var _bcrypt = _interopRequireDefault(require("bcrypt"));

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

              if (!user.state.tfaActivated) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", reject(_textPack["default"].users.tfa.alreadyEnabled));

            case 6:
              _context.next = 8;
              return _User["default"].updateOne({
                _id: uid
              }, {
                state: {
                  banned: user.state.banned,
                  reason: user.state.reason,
                  banDate: user.state.banDate,
                  emailConfirmed: user.state.emailConfirmed,
                  tfaActivated: true
                }
              });

            case 8:
              return _context.abrupt("return", resolve());

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](0);
              console.error(_context.t0);
              return _context.abrupt("return", reject(_textPack["default"].standards.responseError));

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 11]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  return promise;
}

function generateRecoverCodes() {
  var recoverCodes = [];
  var round = 0;

  while (round <= 10) {
    round++;
    recoverCodes.push((0, _shortid.generate)());
  }

  return recoverCodes;
}

function encryptRecoverCodes(codes) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      var encryptedCodes, round, code;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              encryptedCodes = [];
              round = 0;

            case 2:
              if (!(round <= 10)) {
                _context2.next = 9;
                break;
              }

              code = codes[round];
              _context2.next = 6;
              return _bcrypt["default"].hash(code, 12).then(function (hash) {
                encryptedCodes.push(hash);
              })["catch"](function () {
                return reject(_textPack["default"].standards.responseError);
              });

            case 6:
              round++;
              _context2.next = 2;
              break;

            case 9:
              return _context2.abrupt("return", resolve(encryptedCodes));

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  return promise;
}

function updateTfa(uid, recoverCodes, secret) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return _User["default"].updateOne({
                _id: uid
              }, {
                tfa: {
                  recoverCodes: recoverCodes,
                  secret: secret
                }
              });

            case 3:
              return _context3.abrupt("return", resolve());

            case 6:
              _context3.prev = 6;
              _context3.t0 = _context3["catch"](0);
              console.error(_context3.t0);
              return _context3.abrupt("return", reject(_textPack["default"].users.tfa.couldntEnable));

            case 10:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[0, 6]]);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());
  return promise;
}

router.get("/", (0, _authorize["default"])({
  level: 0
}), function (req, res) {
  Promise.resolve([]).then( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(all) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return verifyTfaState(req.user.id).then(function () {
                return all;
              })["catch"](function (err) {
                throw new Error("400:".concat(err));
              });

            case 2:
              return _context4.abrupt("return", _context4.sent);

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x7) {
      return _ref4.apply(this, arguments);
    };
  }()).then(function (all) {
    var recoverCodes = generateRecoverCodes();
    all.push(recoverCodes);
    return all;
  }).then(function (all) {
    var secret = (0, _node2fa.generateSecret)({
      name: "GepetoServices",
      account: req.user.username
    });
    all.push(secret.secret);
    all.push(secret.qr);
    return all;
  }).then( /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(all) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return encryptRecoverCodes(all[0]).then(function (encryptedRecoverCodes) {
                all.push(encryptedRecoverCodes);
                return all;
              })["catch"](function (err) {
                throw new Error("500:".concat(err));
              });

            case 2:
              return _context5.abrupt("return", _context5.sent);

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function (_x8) {
      return _ref5.apply(this, arguments);
    };
  }()).then(function (all) {
    var encryptedSecret = (0, _crypto["default"])().enc(all[1]);

    if (encryptedSecret.error) {
      throw new Error("500:".concat(_textPack["default"].standards.responseError));
    }

    all.push({
      hash: encryptedSecret.hash,
      key: encryptedSecret.key,
      iv: encryptedSecret.iv
    });
    return all;
  }).then( /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(all) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return updateTfa(req.user.id, all[3], all[4]).then(function () {
                return res.json((0, _response["default"])(false, _textPack["default"].users.tfa.enabled, {
                  recoverCodes: all[0],
                  qrcode: all[2],
                  tfaCode: all[1]
                }));
              })["catch"](function (err) {
                throw new Error("500:".concat(err));
              });

            case 2:
              return _context6.abrupt("return", _context6.sent);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function (_x9) {
      return _ref6.apply(this, arguments);
    };
  }())["catch"](function (err) {
    var error = err.message.split(":");
    return res.status(error[0]).json((0, _response["default"])(true, error[1]));
  });
});
var _default = router;
exports["default"] = _default;