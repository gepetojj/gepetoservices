"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _xssFilters = _interopRequireDefault(require("xss-filters"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _authorize = _interopRequireDefault(require("../../../assets/middlewares/authorize"));

var _response = _interopRequireDefault(require("../../../assets/response"));

var _validator = _interopRequireDefault(require("../../../assets/validator"));

var _textPack = _interopRequireDefault(require("../../../assets/textPack.json"));

var _User = _interopRequireDefault(require("../../../assets/models/User"));

var _api = _interopRequireDefault(require("../../../assets/api"));

var _token = _interopRequireDefault(require("../../../assets/token"));

var _mailer = _interopRequireDefault(require("../../../assets/mailer"));

var _performance = _interopRequireDefault(require("../../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();

function verifyPassword(uid, password) {
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
              }, "+password");

            case 3:
              user = _context.sent;
              _context.next = 6;
              return _bcrypt["default"].compare(password, user.password).then(function (same) {
                resolve(same);
              })["catch"](function (err) {
                console.error(err);
                reject(err);
              });

            case 6:
              _context.next = 12;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](0);
              console.error(_context.t0);
              reject(_context.t0);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 8]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  return promise;
}

function encryptPassword(password) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      var hash;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return _bcrypt["default"].hash(password, 12);

            case 3:
              hash = _context2.sent;
              resolve(hash);
              _context2.next = 11;
              break;

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](0);
              console.error(_context2.t0);
              reject(_context2.t0);

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 7]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  return promise;
}

function generateConfirmLink(uid, password) {
  var token = (0, _token["default"])().create({
    id: uid,
    scope: "changePassword",
    newState: password
  }, "refresh");

  if (token.error) {
    return {
      error: true
    };
  }

  var link = (0, _api["default"])("/users/confirm?t=".concat(encodeURIComponent(token.token)));
  return {
    error: false,
    link: link
  };
}

router.put("/", (0, _authorize["default"])({
  level: 0
}), function (req, res) {
  var performanceLog = new _performance["default"](req.baseUrl);
  var _req$body = req.body,
      password = _req$body.password,
      newPassword = _req$body.newPassword,
      newPasswordConfirm = _req$body.newPasswordConfirm;

  if (!password || !newPassword || !newPasswordConfirm) {
    performanceLog.finish();
    return res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullFields));
  }

  password = _xssFilters["default"].uriQueryInHTMLData(password);
  newPassword = _xssFilters["default"].uriQueryInHTMLData(newPassword);
  newPasswordConfirm = _xssFilters["default"].uriQueryInHTMLData(newPasswordConfirm);
  var validation = (0, _validator["default"])([{
    type: "password",
    value: password
  }, {
    type: "password",
    value: newPassword
  }, {
    type: "password",
    value: newPasswordConfirm
  }, {
    type: "equals",
    value: newPassword,
    equal: newPasswordConfirm
  }]);

  if (validation.length > 0) {
    performanceLog.finish();
    return res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.responseError, {
      errors: validation
    }));
  }

  Promise.resolve([]).then( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(all) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return verifyPassword(req.user.id, password).then(function (same) {
                if (same) {
                  return all;
                }

                throw new Error("401:".concat(_textPack["default"].users.login.wrongPassword));
              })["catch"](function () {
                throw new Error("401:".concat(_textPack["default"].users.login.wrongPassword));
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
  }()).then( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(all) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return encryptPassword(newPassword).then(function (hash) {
                all.push(hash);
                return all;
              })["catch"](function () {
                throw new Error("500:".concat(_textPack["default"].users.change.password.couldntChangePassword));
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
  }()).then(function (all) {
    var link = generateConfirmLink(req.user.id, all[0]);

    if (!link.error) {
      all.push(link.link);
      return all;
    }

    throw new Error("500:".concat(_textPack["default"].users.change.password.couldntChangePassword));
  }).then( /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(all) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return (0, _mailer["default"])({
                template: "changePassword",
                templateParams: {
                  username: req.user.username,
                  link: all[1]
                },
                target: req.user.email,
                subject: "Mudança de senha da conta do GepetoServices"
              }).then(function () {
                performanceLog.finish();
                return res.json((0, _response["default"])(false, _textPack["default"].users.change.password.confirmAction));
              })["catch"](function () {
                throw new Error("500:".concat(_textPack["default"].users.change.password.couldntSendEmail));
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

    return function (_x7) {
      return _ref5.apply(this, arguments);
    };
  }())["catch"](function (err) {
    performanceLog.finish();
    var error = err.message.split(":");
    return res.status(error[0]).json((0, _response["default"])(true, error[1]));
  });
});
var _default = router;
exports["default"] = _default;