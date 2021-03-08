"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _xssFilters = _interopRequireDefault(require("xss-filters"));

var _response = _interopRequireDefault(require("../../assets/response"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _User = _interopRequireDefault(require("../../assets/models/User"));

var _token = _interopRequireDefault(require("../../assets/token"));

var _performance = _interopRequireDefault(require("../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("dotenv").config();

var router = (0, _express.Router)();

function getCurrentUserState(id) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var userState;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _User["default"].findOne({
                _id: id
              });

            case 3:
              userState = _context.sent;

              if (userState) {
                resolve(userState.state);
              } else {
                reject("Usuário inexistente.");
              }

              _context.next = 11;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              console.error(_context.t0);
              reject(_context.t0.message);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 7]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  return promise;
}

function changeUserState(id, newState) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return _User["default"].updateOne({
                _id: id
              }, {
                state: newState
              });

            case 3:
              resolve();
              _context2.next = 10;
              break;

            case 6:
              _context2.prev = 6;
              _context2.t0 = _context2["catch"](0);
              console.error(_context2.t0);
              reject(_context2.t0.message);

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

function changeUserData(id, newData) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return _User["default"].updateOne({
                _id: id
              }, newData);

            case 3:
              resolve();
              _context3.next = 10;
              break;

            case 6:
              _context3.prev = 6;
              _context3.t0 = _context3["catch"](0);
              console.error(_context3.t0);
              reject(_context3.t0.message);

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

router.get("/", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var performanceLog, t;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);
            t = req.query.t;

            if (t) {
              _context8.next = 5;
              break;
            }

            performanceLog.finish();
            return _context8.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].authorize.nullToken)));

          case 5:
            t = decodeURIComponent(t);
            t = _xssFilters["default"].uriQueryInHTMLData(t);
            Promise.resolve([]).then( /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(all) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return (0, _token["default"])().verify(t, "refresh").then(function (decoded) {
                          all.push(decoded);
                          return all;
                        })["catch"](function (err) {
                          throw new Error("".concat(err.code, ":").concat(err.message));
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

              return function (_x9) {
                return _ref5.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(all) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return (0, _token["default"])().revoke(all[0].tokenId).then(function () {
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseError));
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

              return function (_x10) {
                return _ref6.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(all) {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return getCurrentUserState(all[0].id).then( /*#__PURE__*/function () {
                          var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(state) {
                            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                              while (1) {
                                switch (_context6.prev = _context6.next) {
                                  case 0:
                                    _context6.t0 = all[0].scope;
                                    _context6.next = _context6.t0 === "confirmEmail" ? 3 : _context6.t0 === "changePassword" ? 8 : 11;
                                    break;

                                  case 3:
                                    if (!(state.emailConfirmed === all[0].newState)) {
                                      _context6.next = 5;
                                      break;
                                    }

                                    throw new Error("400:".concat(_textPack["default"].users.confirmEmail.emailAlreadyConfirmed));

                                  case 5:
                                    _context6.next = 7;
                                    return changeUserState(all[0].id, {
                                      emailConfirmed: all[0].newState,
                                      banned: state.banned,
                                      reason: state.reason,
                                      banDate: state.banDate
                                    }).then(function () {
                                      performanceLog.finish();
                                      return res.json((0, _response["default"])(false, _textPack["default"].users.confirmEmail.emailConfirmed));
                                    })["catch"](function () {
                                      throw new Error("500:".concat(_textPack["default"].users.confirmEmail.couldNotConfirmEmail));
                                    });

                                  case 7:
                                    return _context6.abrupt("return", _context6.sent);

                                  case 8:
                                    _context6.next = 10;
                                    return changeUserData(all[0].id, {
                                      password: all[0].newState
                                    }).then(function () {
                                      performanceLog.finish();
                                      return res.json((0, _response["default"])(false, _textPack["default"].users.confirmEmail.emailConfirmed));
                                    })["catch"](function () {
                                      throw new Error("500:N\xE3o foi poss\xEDvel confirmar sua a\xE7\xE3o.");
                                    });

                                  case 10:
                                    return _context6.abrupt("return", _context6.sent);

                                  case 11:
                                  case "end":
                                    return _context6.stop();
                                }
                              }
                            }, _callee6);
                          }));

                          return function (_x12) {
                            return _ref8.apply(this, arguments);
                          };
                        }())["catch"](function (err) {
                          throw new Error("500:".concat(err));
                        });

                      case 2:
                        return _context7.abrupt("return", _context7.sent);

                      case 3:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              }));

              return function (_x11) {
                return _ref7.apply(this, arguments);
              };
            }())["catch"](function (err) {
              performanceLog.finish();
              var error = err.message.split(":");
              return res.status(error[0]).json((0, _response["default"])(true, error[1]));
            });

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;