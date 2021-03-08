"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _memoryCache = _interopRequireDefault(require("memory-cache"));

var _response = _interopRequireDefault(require("../response"));

var _textPack = _interopRequireDefault(require("../textPack.json"));

var _token = _interopRequireDefault(require("../token"));

var _User = _interopRequireDefault(require("../models/User"));

var _cacheController = _interopRequireDefault(require("../cacheController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("dotenv").config();

function authorize(_ref) {
  var level = _ref.level;
  return /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res, next) {
      var authorization, refreshToken, app, agent, _authorization$split, _authorization$split2, method, token;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              authorization = req.headers["authorization"];
              refreshToken = req.cookies["refreshToken"];
              app = req.headers["x-from-app"] || "noapp";
              agent = req.headers["user-agent"];

              if (!(!authorization || !refreshToken)) {
                _context3.next = 6;
                break;
              }

              return _context3.abrupt("return", res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.nullToken)));

            case 6:
              if (_textPack["default"].authorize.apps.includes(app)) {
                _context3.next = 8;
                break;
              }

              return _context3.abrupt("return", res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.invalidApp)));

            case 8:
              _authorization$split = authorization.split(" "), _authorization$split2 = _slicedToArray(_authorization$split, 2), method = _authorization$split2[0], token = _authorization$split2[1];

              if (!(method !== "Bearer" || !token)) {
                _context3.next = 11;
                break;
              }

              return _context3.abrupt("return", res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.invalidToken)));

            case 11:
              _context3.next = 13;
              return (0, _token["default"])().verify(token, "access").then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return (0, _token["default"])().verify(refreshToken, "refresh").then( /*#__PURE__*/function () {
                          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(decoded) {
                            var cachedData, user;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    if (!(decoded.app !== app)) {
                                      _context.next = 2;
                                      break;
                                    }

                                    return _context.abrupt("return", res.status(401).json((0, _response["default"])(true, _textPack["default"].authorize.invalidApp)));

                                  case 2:
                                    if (!(decoded.level < level)) {
                                      _context.next = 4;
                                      break;
                                    }

                                    return _context.abrupt("return", res.status(401).json((0, _response["default"])(true, "Você não tem permissões necessárias para isso.")));

                                  case 4:
                                    cachedData = (0, _cacheController["default"])(decoded.id);

                                    if (!cachedData.cached) {
                                      _context.next = 10;
                                      break;
                                    }

                                    req.user = cachedData.data;
                                    return _context.abrupt("return", next());

                                  case 10:
                                    _context.next = 12;
                                    return _User["default"].findOne({
                                      _id: decoded.id
                                    });

                                  case 12:
                                    user = _context.sent;

                                    if (!user) {
                                      _context.next = 25;
                                      break;
                                    }

                                    if (!user.state.banned) {
                                      _context.next = 18;
                                      break;
                                    }

                                    if (!user.state.reason) {
                                      _context.next = 17;
                                      break;
                                    }

                                    return _context.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].users.login.bannedUser, {
                                      reason: user.state.reason
                                    })));

                                  case 17:
                                    return _context.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].users.login.bannedUser)));

                                  case 18:
                                    if (!(user.level < level)) {
                                      _context.next = 20;
                                      break;
                                    }

                                    return _context.abrupt("return", res.status(401).json((0, _response["default"])(true, "Você não tem permissões necessárias para isso.")));

                                  case 20:
                                    req.user = {
                                      id: user._id,
                                      username: user.username,
                                      email: user.email,
                                      level: user.level,
                                      avatar: user.avatar,
                                      state: user.state,
                                      registerDate: user.register.date,
                                      app: decoded.app,
                                      cachedData: false
                                    };

                                    _memoryCache["default"].put(decoded.id, req.user, 300000); // 5 minutos em ms


                                    return _context.abrupt("return", next());

                                  case 25:
                                    return _context.abrupt("return", res.status(401).json((0, _response["default"])(true, _textPack["default"].users.login.unknownUser)));

                                  case 26:
                                  case "end":
                                    return _context.stop();
                                }
                              }
                            }, _callee);
                          }));

                          return function (_x4) {
                            return _ref4.apply(this, arguments);
                          };
                        }())["catch"](function (err) {
                          return res.status(err.code).json((0, _response["default"])(true, err.message));
                        });

                      case 2:
                        return _context2.abrupt("return", _context2.sent);

                      case 3:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              })))["catch"](function (err) {
                if (err.errCode) {
                  // Futuramente já fazer o refresh neste middleware.
                  return res.status(err.code).json((0, _response["default"])(true, err.message));
                }

                return res.status(err.code).json((0, _response["default"])(true, err.message));
              });

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x, _x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();
}

var _default = authorize;
exports["default"] = _default;