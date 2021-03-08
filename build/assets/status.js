"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _formData = _interopRequireDefault(require("form-data"));

var _fs = require("fs");

var _api = _interopRequireDefault(require("./api"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");

function status() {
  var endpoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

  /**
   * Classifica uma API e retorna seu status.
   * @param {Number} statusCode Código da resposta da API.
   * @param {String} timeToRespond Tempo de resposta da API em milisegundos.
   * @returns {String} Retorna o status da API.
   */
  function classify(statusCode, timeToRespond) {
    if (statusCode > 199 && statusCode < 300) {
      if (timeToRespond < 1700) {
        return "OK";
      } else {
        return "ALERT";
      }
    } else if (statusCode > 299) {
      return "ERROR";
    } else {
      return "UNKNOWN";
    }
  }

  function get() {
    return _get.apply(this, arguments);
  }

  function _get() {
    _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var testData, testStart, test, testEnd, _testEnd;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              testData = {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: ""
              };
              testStart = (0, _momentTimezone["default"])().valueOf();
              _context.prev = 2;
              _context.next = 5;
              return _axios["default"].get((0, _api["default"])(endpoint));

            case 5:
              test = _context.sent;
              testEnd = (0, _momentTimezone["default"])().valueOf();
              testData.statusCode = test.status;
              testData.timeToRespond = Number((0, _momentTimezone["default"])(testEnd - testStart).format("x"));
              testData.classifiedAs = classify(testData.statusCode, testData.timeToRespond);
              return _context.abrupt("return", testData);

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](2);
              _testEnd = (0, _momentTimezone["default"])().valueOf();
              testData.timeToRespond = Number((0, _momentTimezone["default"])(_testEnd - testStart).format("x"));

              if (_context.t0.response === undefined) {
                testData.statusCode = 503;
              } else {
                testData.statusCode = _context.t0.response.status;
              }

              testData.classifiedAs = classify(testData.statusCode, testData.timeToRespond);
              return _context.abrupt("return", testData);

            case 20:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 13]]);
    }));
    return _get.apply(this, arguments);
  }

  function post() {
    return _post.apply(this, arguments);
  }

  function _post() {
    _post = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var name,
          testData,
          formData,
          testStart,
          test,
          testEnd,
          _testEnd2,
          _args2 = arguments;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              name = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : "file";
              testData = {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: "",
                filename: ""
              };
              formData = new _formData["default"]();
              formData.append(name, (0, _fs.createReadStream)("".concat(process.cwd(), "/assets/tests/testImage.png")));
              testStart = (0, _momentTimezone["default"])().valueOf();
              _context2.prev = 5;
              _context2.next = 8;
              return _axios["default"].post((0, _api["default"])(endpoint), formData, {
                headers: formData.getHeaders()
              });

            case 8:
              test = _context2.sent;
              testEnd = (0, _momentTimezone["default"])().valueOf();
              testData.statusCode = test.status;
              testData.timeToRespond = Number((0, _momentTimezone["default"])(testEnd - testStart).format("x"));
              testData.filename = test.data.filename;
              testData.classifiedAs = classify(testData.statusCode, testData.timeToRespond);
              return _context2.abrupt("return", testData);

            case 17:
              _context2.prev = 17;
              _context2.t0 = _context2["catch"](5);
              _testEnd2 = (0, _momentTimezone["default"])().valueOf();
              testData.timeToRespond = Number((0, _momentTimezone["default"])(_testEnd2 - testStart).format("x"));

              if (_context2.t0.response === undefined) {
                testData.statusCode = 503;
              } else {
                testData.statusCode = _context2.t0.response.status;
              }

              testData.classifiedAs = classify(testData.statusCode, testData.timeToRespond);
              return _context2.abrupt("return", testData);

            case 24:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[5, 17]]);
    }));
    return _post.apply(this, arguments);
  }

  function del() {
    return _del.apply(this, arguments);
  }

  function _del() {
    _del = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var testData, testStart, test, testEnd, _testEnd3;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              testData = {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: ""
              };
              testStart = (0, _momentTimezone["default"])().valueOf();
              _context3.prev = 2;
              _context3.next = 5;
              return _axios["default"]["delete"]((0, _api["default"])(endpoint));

            case 5:
              test = _context3.sent;
              testEnd = (0, _momentTimezone["default"])().valueOf();
              testData.statusCode = test.status;
              testData.timeToRespond = Number((0, _momentTimezone["default"])(testEnd - testStart).format("x"));
              testData.classifiedAs = classify(testData.statusCode, testData.timeToRespond);
              return _context3.abrupt("return", testData);

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3["catch"](2);
              _testEnd3 = (0, _momentTimezone["default"])().valueOf();
              testData.timeToRespond = Number((0, _momentTimezone["default"])(_testEnd3 - testStart).format("x"));

              if (_context3.t0.response === undefined) {
                testData.statusCode = 503;
              } else {
                testData.statusCode = _context3.t0.response.status;
              }

              testData.classifiedAs = classify(testData.statusCode, testData.timeToRespond);
              return _context3.abrupt("return", testData);

            case 20:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[2, 13]]);
    }));
    return _del.apply(this, arguments);
  }

  return {
    get: get,
    post: post,
    del: del
  };
}

var _default = status;
exports["default"] = _default;