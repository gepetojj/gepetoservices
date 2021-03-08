"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _shortid = require("shortid");

var _redis = _interopRequireDefault(require("./redis"));

var _textPack = _interopRequireDefault(require("./textPack.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require("dotenv").config();

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");

function Token() {
  /**
   * Cria um token JWT, podendo ser um 'access_token' ou 'refresh_token'
   * @param {Object} params Parâmetros a serem escritos no token JWT.
   * @param {String} type Tipo do token, 'access' ou 'refresh'.
   * @returns {Object} Retorna um objeto, tendo a key 'error' em todos os casos,
   * 'token' caso 'error' seja false, e 'message' caso 'error' seja true.
   */
  function create(params) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "access";
    var tokenId = "".concat((0, _momentTimezone["default"])().valueOf(), ":").concat((0, _shortid.generate)());

    if (type === "access") {
      try {
        var token = _jsonwebtoken["default"].sign(_objectSpread(_objectSpread({}, params), {}, {
          tokenId: tokenId,
          type: type
        }), process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "15m"
        });

        return {
          error: false,
          token: token
        };
      } catch (err) {
        console.error(err);
        return {
          error: true,
          message: err
        };
      }
    } else {
      try {
        var _token = _jsonwebtoken["default"].sign(_objectSpread(_objectSpread({}, params), {}, {
          tokenId: tokenId,
          type: type
        }), process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: "1d"
        });

        var redisOperation = _redis["default"].set(tokenId, "true");

        if (redisOperation.error) {
          return {
            error: true,
            message: redisOperation.error
          };
        }

        return {
          error: false,
          token: _token
        };
      } catch (err) {
        console.error(err);
        return {
          error: true,
          message: err
        };
      }
    }
  }
  /**
   * Verifica um token JWT.
   * @param {String} token Token JWT.
   * @param {String} type Tipo do token, 'access' ou 'refresh'.
   * @returns {Promise<Object>} Retorna um objeto em promise com os dados
   * do token JWT passado. Caso o token seja do tipo 'refresh', verifica
   * se está válido.
   */


  function verify(_x) {
    return _verify.apply(this, arguments);
  }
  /**
   * Invalida um token JWT pelo id.
   * @param {String} tokenId Id do token.
   * @returns {Promise} Retorna undefined caso nenhum erro ocorra, que significa
   * que o token foi invalidado.
   */


  function _verify() {
    _verify = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(token) {
      var type,
          promise,
          _args = arguments;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              type = _args.length > 1 && _args[1] !== undefined ? _args[1] : "access";
              promise = new Promise(function (resolve, reject) {
                if (type === "access") {
                  _jsonwebtoken["default"].verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                    if (err) {
                      if (err.name === "TokenExpiredError") {
                        return reject({
                          message: "Seu token de acesso está expirado, use o seu token de atualização para obter outro.",
                          code: 401,
                          errCode: "ACCESS_TOKEN_EXPIRED"
                        });
                      } else {
                        return reject({
                          message: _textPack["default"].authorize.invalidToken,
                          code: 401
                        });
                      }
                    }

                    return resolve(decoded);
                  });
                } else {
                  _jsonwebtoken["default"].verify(token, process.env.REFRESH_TOKEN_SECRET, function (err, decoded) {
                    if (err) {
                      return reject({
                        message: _textPack["default"].authorize.invalidToken,
                        code: 401
                      });
                    }

                    _redis["default"].get(decoded.tokenId, function (err, data) {
                      if (err) {
                        return reject({
                          message: _textPack["default"].authorize.couldntValidateToken,
                          code: 500
                        });
                      }

                      if (data === null || data !== "true") {
                        return reject({
                          message: _textPack["default"].authorize.invalidToken,
                          code: 401
                        });
                      }

                      return resolve(decoded);
                    });
                  });
                }
              });
              return _context.abrupt("return", promise);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _verify.apply(this, arguments);
  }

  function revoke(_x2) {
    return _revoke.apply(this, arguments);
  }

  function _revoke() {
    _revoke = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(tokenId) {
      var promise;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              promise = new Promise(function (resolve, reject) {
                _redis["default"].set(tokenId, "false", function (err) {
                  if (err) {
                    return reject(err);
                  }

                  return resolve();
                });
              });
              return _context2.abrupt("return", promise);

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _revoke.apply(this, arguments);
  }

  return {
    create: create,
    verify: verify,
    revoke: revoke
  };
}

var _default = Token;
exports["default"] = _default;