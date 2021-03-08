"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _xssFilters = _interopRequireDefault(require("xss-filters"));

var _firebase = _interopRequireDefault(require("../../assets/firebase"));

var _response = _interopRequireDefault(require("../../assets/response"));

var _retryHandler = _interopRequireDefault(require("../../assets/retryHandler"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _performance = _interopRequireDefault(require("../../assets/tests/performance"));

var _this = void 0;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();

var bucket = _firebase["default"].storage().bucket();

function makeFilePublic(_x) {
  return _makeFilePublic.apply(this, arguments);
}

function _makeFilePublic() {
  _makeFilePublic = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return file.makePublic();

          case 3:
            return _context2.abrupt("return", {
              error: false,
              message: ""
            });

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2["catch"](0);
            throw new Error(_textPack["default"].storage.access.makePublicError);

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 6]]);
  }));
  return _makeFilePublic.apply(this, arguments);
}

router.get("/", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var performanceLog, filename, file, makeFilePublicHandler, tries;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);
            filename = req.query.filename;

            if (filename) {
              _context.next = 5;
              break;
            }

            performanceLog.finish();
            return _context.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullField)));

          case 5:
            filename = _xssFilters["default"].uriQueryInHTMLData(filename);
            file = bucket.file(filename);
            _context.next = 9;
            return (0, _retryHandler["default"])(makeFilePublic.bind(_this, file), 2);

          case 9:
            makeFilePublicHandler = _context.sent;
            tries = makeFilePublicHandler.length - 1;

            if (!(makeFilePublicHandler[tries].error === true)) {
              _context.next = 14;
              break;
            }

            performanceLog.finish();
            return _context.abrupt("return", res.status(500).json((0, _response["default"])(true, makeFilePublicHandler[tries].data)));

          case 14:
            performanceLog.finish();
            return _context.abrupt("return", res.json((0, _response["default"])(false, _textPack["default"].standards.responseOK, {
              file: file.publicUrl()
            })));

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;