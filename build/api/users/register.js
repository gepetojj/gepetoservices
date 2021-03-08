"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _xssFilters = _interopRequireDefault(require("xss-filters"));

var _response = _interopRequireDefault(require("../../assets/response"));

var _api = _interopRequireDefault(require("../../assets/api"));

var _validator = _interopRequireDefault(require("../../assets/validator"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _User = _interopRequireDefault(require("../../assets/models/User"));

var _token = _interopRequireDefault(require("../../assets/token"));

var _mailer = _interopRequireDefault(require("../../assets/mailer"));

var _performance = _interopRequireDefault(require("../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();

function verifyUsernameAndEmail(_x, _x2) {
  return _verifyUsernameAndEmail.apply(this, arguments);
}

function _verifyUsernameAndEmail() {
  _verifyUsernameAndEmail = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(username, email) {
    var promise;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            promise = new Promise( /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(resolve, reject) {
                var usernameVerification, emailVerification;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.prev = 0;
                        _context8.next = 3;
                        return _User["default"].find({
                          username: username
                        });

                      case 3:
                        usernameVerification = _context8.sent;
                        _context8.next = 6;
                        return _User["default"].find({
                          email: email
                        });

                      case 6:
                        emailVerification = _context8.sent;

                        if (usernameVerification.length === 0 && emailVerification.length === 0) {
                          resolve();
                        } else {
                          reject(_textPack["default"].users.register.userOrEmailAlreadyRegistered);
                        }

                        _context8.next = 14;
                        break;

                      case 10:
                        _context8.prev = 10;
                        _context8.t0 = _context8["catch"](0);
                        console.error(_context8.t0);
                        reject(_context8.t0);

                      case 14:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8, null, [[0, 10]]);
              }));

              return function (_x11, _x12) {
                return _ref8.apply(this, arguments);
              };
            }());
            return _context9.abrupt("return", promise);

          case 2:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _verifyUsernameAndEmail.apply(this, arguments);
}

function generateConfirmationLink(id) {
  var token = (0, _token["default"])().create({
    id: id,
    scope: "confirmEmail",
    newState: true
  }, "refresh");

  if (token.error) {
    return {
      error: true
    };
  }

  return {
    error: false,
    token: encodeURIComponent(token.token)
  };
}

function deleteUser(_x3) {
  return _deleteUser.apply(this, arguments);
}

function _deleteUser() {
  _deleteUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(id) {
    var promise;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            promise = new Promise( /*#__PURE__*/function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(resolve, reject) {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.prev = 0;
                        _context10.next = 3;
                        return _User["default"].deleteOne({
                          _id: id
                        });

                      case 3:
                        resolve();
                        _context10.next = 10;
                        break;

                      case 6:
                        _context10.prev = 6;
                        _context10.t0 = _context10["catch"](0);
                        console.error(_context10.t0);
                        reject(_context10.t0);

                      case 10:
                      case "end":
                        return _context10.stop();
                    }
                  }
                }, _callee10, null, [[0, 6]]);
              }));

              return function (_x13, _x14) {
                return _ref9.apply(this, arguments);
              };
            }());
            return _context11.abrupt("return", promise);

          case 2:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _deleteUser.apply(this, arguments);
}

router.post("/", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var performanceLog, _req$body, username, email, password, passwordConfirm, app, agent, ip, validation;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);
            _req$body = req.body, username = _req$body.username, email = _req$body.email, password = _req$body.password, passwordConfirm = _req$body.passwordConfirm;
            app = req.headers["x-from-app"] || "noapp";
            agent = req.headers["user-agent"];
            ip = req.headers["x-ip"];

            if (!(!username || !email || !password || !passwordConfirm)) {
              _context7.next = 8;
              break;
            }

            performanceLog.finish();
            return _context7.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullFields)));

          case 8:
            if (!(!agent || !ip)) {
              _context7.next = 11;
              break;
            }

            performanceLog.finish();
            return _context7.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.responseError)));

          case 11:
            if (["noapp", "lastpwd", "ppt"].includes(app)) {
              _context7.next = 14;
              break;
            }

            performanceLog.finish();
            return _context7.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].authorize.invalidApp)));

          case 14:
            username = username.toLowerCase();
            username = _xssFilters["default"].uriQueryInHTMLData(username);
            email = _xssFilters["default"].uriQueryInHTMLData(email);
            validation = (0, _validator["default"])([{
              type: "username",
              value: username
            }, {
              type: "email",
              value: email
            }, {
              type: "password",
              value: password
            }, {
              type: "password",
              value: passwordConfirm
            }, {
              type: "equals",
              value: password,
              equal: passwordConfirm
            }]);

            if (!(validation.length > 0)) {
              _context7.next = 21;
              break;
            }

            performanceLog.finish();
            return _context7.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.responseError, {
              errors: validation
            })));

          case 21:
            Promise.resolve([]).then( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(all) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return verifyUsernameAndEmail(username, email).then(function () {
                          return all;
                        })["catch"](function (err) {
                          if (err === _textPack["default"].users.register.userOrEmailAlreadyRegistered) {
                            throw new Error("400:".concat(err));
                          }

                          throw new Error("500:".concat(_textPack["default"].standards.responseError));
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

              return function (_x6) {
                return _ref2.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(all) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return _bcrypt["default"].hash(password, 12).then(function (hash) {
                          all.push(hash);
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseError));
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

              return function (_x7) {
                return _ref3.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(all) {
                var newUser;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        newUser = new _User["default"]({
                          username: username,
                          email: email,
                          password: all[0],
                          register: {
                            agent: agent,
                            ip: ip
                          },
                          apps: [app]
                        });
                        _context3.next = 3;
                        return newUser.save().then(function (user) {
                          all.push(user);
                          return all;
                        })["catch"](function (err) {
                          console.error(err);
                          throw new Error("500:".concat(_textPack["default"].users.register.userNotCreated));
                        });

                      case 3:
                        return _context3.abrupt("return", _context3.sent);

                      case 4:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x8) {
                return _ref4.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(all) {
                var link;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        link = generateConfirmationLink(all[1]._id);

                        if (!link.error) {
                          _context4.next = 5;
                          break;
                        }

                        _context4.next = 4;
                        return deleteUser(all[1]._id).then(function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseError));
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseCriticError));
                        });

                      case 4:
                        return _context4.abrupt("return", _context4.sent);

                      case 5:
                        all.push(link.token);
                        return _context4.abrupt("return", all);

                      case 7:
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
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(all) {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return (0, _mailer["default"])({
                          template: "emailConfirmation",
                          templateParams: {
                            username: username,
                            link: (0, _api["default"])("/users/confirm?t=".concat(all[2]))
                          },
                          target: email,
                          subject: "Confirmação de conta do GepetoServices"
                        }).then(function () {
                          performanceLog.finish();
                          return res.json((0, _response["default"])(false, _textPack["default"].users.register.userCreated));
                        })["catch"]( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                          return regeneratorRuntime.wrap(function _callee5$(_context5) {
                            while (1) {
                              switch (_context5.prev = _context5.next) {
                                case 0:
                                  _context5.next = 2;
                                  return deleteUser(all[1]._id).then(function () {
                                    throw new Error("500:".concat(_textPack["default"].users.register.userNotCreated));
                                  })["catch"](function () {
                                    throw new Error("500:".concat(_textPack["default"].standards.responseCriticError));
                                  });

                                case 2:
                                  return _context5.abrupt("return", _context5.sent);

                                case 3:
                                case "end":
                                  return _context5.stop();
                              }
                            }
                          }, _callee5);
                        })));

                      case 2:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6);
              }));

              return function (_x10) {
                return _ref6.apply(this, arguments);
              };
            }())["catch"](function (err) {
              performanceLog.finish();
              var error = err.message.split(":");
              console.log(error);
              return res.status(error[0]).json((0, _response["default"])(true, error[1]));
            });

          case 22:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x4, _x5) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;