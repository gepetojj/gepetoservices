"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _response = _interopRequireDefault(require("../../assets/response"));

var _status = _interopRequireDefault(require("../../assets/status"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _performance = _interopRequireDefault(require("../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
router.get("/", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var performanceLog, testResults, testImageName;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);
            testResults = {
              translator: {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: ""
              },
              upload: {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: ""
              },
              access: {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: ""
              },
              "delete": {
                statusCode: 0,
                timeToRespond: 0,
                classifiedAs: ""
              }
            };
            _context.prev = 2;
            performanceLog.watchpoint("translatorTest");
            _context.next = 6;
            return (0, _status["default"])("/translator?text=testando essa API&from=pt&to=en").get().then(function (test) {
              testResults.translator = test;
            })["catch"](function (test) {
              testResults.translator = test;
            });

          case 6:
            performanceLog.watchpointEnd("translatorTest");
            testImageName = "";
            performanceLog.watchpoint("uploadTest");
            _context.next = 11;
            return (0, _status["default"])("/storage/upload").post().then(function (test) {
              testImageName = test.filename;
              testResults.upload.statusCode = test.statusCode;
              testResults.upload.timeToRespond = test.timeToRespond;
              testResults.upload.classifiedAs = test.classifiedAs;
            })["catch"](function (test) {
              testResults.upload.statusCode = test.statusCode;
              testResults.upload.timeToRespond = test.timeToRespond;
              testResults.upload.classifiedAs = test.classifiedAs;
            });

          case 11:
            performanceLog.watchpointEnd("uploadTest");
            performanceLog.watchpoint("accessTest");
            _context.next = 15;
            return (0, _status["default"])("/storage/access?filename=".concat(testImageName)).get().then(function (test) {
              testResults.access = test;
            })["catch"](function (test) {
              testResults.access = test;
            });

          case 15:
            performanceLog.watchpointEnd("accessTest");
            performanceLog.watchpoint("deleteTest");
            _context.next = 19;
            return (0, _status["default"])("/storage/delete?filename=".concat(testImageName)).del().then(function (test) {
              testResults["delete"] = test;
            })["catch"](function (test) {
              testResults["delete"] = test;
            });

          case 19:
            performanceLog.watchpointEnd("deleteTest");
            performanceLog.finish();
            return _context.abrupt("return", res.json((0, _response["default"])(false, _textPack["default"].status.responseOK, {
              storage: {
                access: testResults.access,
                "delete": testResults["delete"],
                upload: testResults.upload
              },
              translator: testResults.translator
            })));

          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](2);
            console.error(_context.t0);
            return _context.abrupt("return", res.status(500).json((0, _response["default"])(true, _textPack["default"].standards.responseError)));

          case 28:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 24]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;