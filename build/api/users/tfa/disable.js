"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _response = _interopRequireDefault(require("../../../assets/response"));

var _textPack = _interopRequireDefault(require("../../../assets/textPack.json"));

var _authorize = _interopRequireDefault(require("../../../assets/middlewares/authorize"));

var _User = _interopRequireDefault(require("../../../assets/models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

              return _context.abrupt("return", reject("Sua verificação de dois fatores não está ativa."));

            case 6:
              return _context.abrupt("return", resolve(user));

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

function deleteTfaData(uid, state) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return _User["default"].updateOne({
                _id: uid
              }, {
                tfa: {
                  recoverCodes: [],
                  secret: {}
                },
                state: {
                  tfaActivated: false,
                  banned: state.banned,
                  emailConfirmed: state.emailConfirmed,
                  reason: state.reason,
                  banDate: state.banDate
                }
              });

            case 3:
              return _context2.abrupt("return", resolve());

            case 6:
              _context2.prev = 6;
              _context2.t0 = _context2["catch"](0);
              console.error(_context2.t0);
              return _context2.abrupt("return", reject(_textPack["default"].standards.responseError));

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 6]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  return promise;
}

router.get("/", (0, _authorize["default"])({
  level: 0
}), function (req, res) {
  var recoverCode = req.query.code;

  if (!recoverCode) {
    return res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullField));
  }

  Promise.resolve([]).then( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(all) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return verifyTfaState(req.user.id).then(function (user) {
                all.push(user);
                return all;
              })["catch"](function (err) {
                throw new Error("400:".concat(err));
              });

            case 2:
              return _context3.abrupt("return", _context3.sent);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x5) {
      return _ref3.apply(this, arguments);
    };
  }()).then(function (all) {
    // Pegar os recover codes do usuario.
    var recoverCodes = all[0].tfa.recoverCodes;

    if (recoverCodes) {
      all.push(recoverCodes);
      return all;
    }

    throw new Error("500:Seus dados n\xE3o foram encontrados.");
  }).then(function (all) {
    // Comparar o recover code passado com os coletados do banco de dados.
    var canReturn = all[1].some(function (code) {
      var same = _bcrypt["default"].compareSync(recoverCode, code);

      if (same) {
        return true;
      }
    });

    if (canReturn) {
      return all;
    }

    throw new Error("400:C\xF3digo de recupera\xE7\xE3o invalido.");
  }).then( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(all) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return deleteTfaData(req.user.id, all[0].state).then(function () {
                return res.json((0, _response["default"])(false, "2FA desativado com sucesso."));
              })["catch"](function (err) {
                throw new Error("500:".concat(err));
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

    return function (_x6) {
      return _ref4.apply(this, arguments);
    };
  }())["catch"](function (err) {
    var error = err.message.split(":");
    return res.status(error[0]).json((0, _response["default"])(true, error[1]));
  });
});
var _default = router;
exports["default"] = _default;