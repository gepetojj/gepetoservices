"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _xssFilters = _interopRequireDefault(require("xss-filters"));

var _response = _interopRequireDefault(require("../../assets/response"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _User = _interopRequireDefault(require("../../assets/models/User"));

var _token = _interopRequireDefault(require("../../assets/token"));

var _firebase = _interopRequireDefault(require("../../assets/firebase"));

var _performance = _interopRequireDefault(require("../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("dotenv").config();

var router = (0, _express.Router)();
(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");

var userSessions = _firebase["default"].firestore().collection("sessions");

function findUser(username) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var userQuery;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _User["default"].findOne({
                username: username
              }, "+password");

            case 3:
              userQuery = _context.sent;
              return _context.abrupt("return", resolve(userQuery));

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              console.error(_context.t0);
              return _context.abrupt("return", reject(_context.t0));

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

function verifyTfaState(uid) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      var userData;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return _User["default"].findOne({
                _id: uid
              });

            case 3:
              userData = _context2.sent;

              if (!userData.state.tfaActivated) {
                _context2.next = 8;
                break;
              }

              return _context2.abrupt("return", resolve(true));

            case 8:
              return _context2.abrupt("return", resolve(false));

            case 9:
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](0);
              return _context2.abrupt("return", reject(_context2.t0));

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 11]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  return promise;
}

function comparePasswords(text, hash) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
      var same;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return _bcrypt["default"].compare(text, hash);

            case 3:
              same = _context3.sent;
              return _context3.abrupt("return", resolve(same));

            case 7:
              _context3.prev = 7;
              _context3.t0 = _context3["catch"](0);
              console.error(_context3.t0);
              return _context3.abrupt("return", reject(_context3.t0));

            case 11:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[0, 7]]);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());
  return promise;
}

function revokeLastLoginToken(id) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
      var data;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return _User["default"].findOne({
                _id: id
              });

            case 3:
              data = _context5.sent;

              if (!data.lastLogin.token) {
                _context5.next = 9;
                break;
              }

              _context5.next = 7;
              return (0, _token["default"])().verify(data.lastLogin.token).then( /*#__PURE__*/function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(decoded) {
                  return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          _context4.next = 2;
                          return (0, _token["default"])().revoke(decoded.tokenId).then(function () {
                            return resolve();
                          })["catch"](function (err) {
                            return reject(err);
                          });

                        case 2:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4);
                }));

                return function (_x9) {
                  return _ref5.apply(this, arguments);
                };
              }())["catch"](function (err) {
                if (err.message === _textPack["default"].authorize.invalidToken) {
                  return resolve();
                }

                return reject(err);
              });

            case 7:
              _context5.next = 10;
              break;

            case 9:
              return _context5.abrupt("return", resolve());

            case 10:
              _context5.next = 16;
              break;

            case 12:
              _context5.prev = 12;
              _context5.t0 = _context5["catch"](0);
              console.error(_context5.t0);
              return _context5.abrupt("return", reject(_context5.t0));

            case 16:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, null, [[0, 12]]);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }());
  return promise;
}

function updateUserLastLogin(_ref6) {
  var id = _ref6.id,
      agent = _ref6.agent,
      ip = _ref6.ip,
      app = _ref6.app,
      token = _ref6.token;
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _context6.next = 3;
              return _User["default"].updateOne({
                _id: id
              }, {
                lastLogin: {
                  date: (0, _momentTimezone["default"])().valueOf(),
                  agent: agent,
                  ip: ip,
                  app: app,
                  token: token
                }
              });

            case 3:
              return _context6.abrupt("return", resolve());

            case 6:
              _context6.prev = 6;
              _context6.t0 = _context6["catch"](0);
              console.error(_context6.t0);
              return _context6.abrupt("return", reject(_context6.t0));

            case 10:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, null, [[0, 6]]);
    }));

    return function (_x10, _x11) {
      return _ref7.apply(this, arguments);
    };
  }());
  return promise;
}

function verifyAndUpdateUserApps(user, app) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;

              if (user.apps.includes(app)) {
                _context7.next = 7;
                break;
              }

              _context7.next = 4;
              return _User["default"].updateOne({
                _id: user.id
              }, {
                apps: [].concat(_toConsumableArray(user.apps), [app])
              });

            case 4:
              return _context7.abrupt("return", resolve());

            case 7:
              return _context7.abrupt("return", resolve());

            case 8:
              _context7.next = 14;
              break;

            case 10:
              _context7.prev = 10;
              _context7.t0 = _context7["catch"](0);
              console.error(_context7.t0);
              return _context7.abrupt("return", reject(_context7.t0));

            case 14:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, null, [[0, 10]]);
    }));

    return function (_x12, _x13) {
      return _ref8.apply(this, arguments);
    };
  }());
  return promise;
}
/* function updateSessions(username) {
	const promise = new Promise(async (resolve, reject) => {
		await userSessions
			.doc(username)
			.get()
			.then((doc) => {
				if (doc.exists) {
				}
			});
	});
	return promise;
} */


router.post("/", /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(req, res) {
    var performanceLog, _req$body, username, password, app, agent, ip;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);
            _req$body = req.body, username = _req$body.username, password = _req$body.password;
            app = req.headers["x-from-app"] || "noapp";
            agent = req.headers["user-agent"];
            ip = req.headers["x-ip"];

            if (!(!username || !password)) {
              _context13.next = 8;
              break;
            }

            performanceLog.finish();
            return _context13.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullFields)));

          case 8:
            if (_textPack["default"].authorize.apps.includes(app)) {
              _context13.next = 11;
              break;
            }

            performanceLog.finish();
            return _context13.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].authorize.invalidApp)));

          case 11:
            username = _xssFilters["default"].uriQueryInHTMLData(username);
            Promise.resolve([]).then( /*#__PURE__*/function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(all) {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return findUser(username).then(function (data) {
                          if (!data.state.emailConfirmed) {
                            throw new Error("401:".concat(_textPack["default"].users.login.emailNotConfirmed));
                          }

                          if (data.state.banned) {
                            throw new Error("400:".concat(_textPack["default"].users.login.bannedUser));
                          }

                          all.push(data);
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].users.login.unknownUser));
                        });

                      case 2:
                        return _context8.abrupt("return", _context8.sent);

                      case 3:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8);
              }));

              return function (_x16) {
                return _ref10.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(all) {
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return comparePasswords(password, all[0].password).then(function (matches) {
                          if (matches) {
                            return all;
                          } else {
                            throw new Error("401:".concat(_textPack["default"].users.login.wrongPassword));
                          }
                        })["catch"](function () {
                          throw new Error("401:".concat(_textPack["default"].users.login.wrongPassword));
                        });

                      case 2:
                        return _context9.abrupt("return", _context9.sent);

                      case 3:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9);
              }));

              return function (_x17) {
                return _ref11.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(all) {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return revokeLastLoginToken(all[0]._id).then(function () {
                          var accessToken = (0, _token["default"])().create({
                            id: all[0]._id,
                            app: app
                          }, "access");
                          var refreshToken = (0, _token["default"])().create({
                            id: all[0]._id,
                            app: app
                          }, "refresh");

                          if (accessToken.error || refreshToken.error) {
                            throw new Error("500:".concat(_textPack["default"].standards.responseError));
                          }

                          all.push(accessToken.token);
                          all.push(refreshToken.token);
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseError));
                        });

                      case 2:
                        return _context10.abrupt("return", _context10.sent);

                      case 3:
                      case "end":
                        return _context10.stop();
                    }
                  }
                }, _callee10);
              }));

              return function (_x18) {
                return _ref12.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(all) {
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _context11.next = 2;
                        return updateUserLastLogin({
                          id: all[0]._id,
                          agent: agent,
                          ip: ip,
                          app: app,
                          token: all[2]
                        }).then(function () {
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseCriticError));
                        });

                      case 2:
                        return _context11.abrupt("return", _context11.sent);

                      case 3:
                      case "end":
                        return _context11.stop();
                    }
                  }
                }, _callee11);
              }));

              return function (_x19) {
                return _ref13.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(all) {
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        _context12.next = 2;
                        return verifyAndUpdateUserApps(all[0], app).then(function () {
                          res.cookie("refreshToken", all[2], {
                            expires: (0, _momentTimezone["default"])().add(1, "day").toDate(),
                            secure: process.env.NODE_ENV === "production",
                            httpOnly: true,
                            sameSite: "lax"
                          });
                          performanceLog.finish();
                          return res.json((0, _response["default"])(false, _textPack["default"].users.login.logged, {
                            accessToken: all[1]
                          }));
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseCriticError));
                        });

                      case 2:
                        return _context12.abrupt("return", _context12.sent);

                      case 3:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee12);
              }));

              return function (_x20) {
                return _ref14.apply(this, arguments);
              };
            }())["catch"](function (err) {
              performanceLog.finish();
              var error = err.message.split(":");
              return res.status(error[0]).json((0, _response["default"])(true, error[1]));
            });

          case 13:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function (_x14, _x15) {
    return _ref9.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;