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

var database = _firebase["default"].firestore().collection("storageLog");

function storageLog(_x, _x2) {
  return _storageLog.apply(this, arguments);
}

function _storageLog() {
  _storageLog = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, filename) {
    var _storageLog2, data, files;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return database.doc(req.headers["x-ip"]).get();

          case 3:
            _storageLog2 = _context2.sent;

            if (!_storageLog2.exists) {
              _context2.next = 14;
              break;
            }

            data = _storageLog2.data();
            files = data.uploads.files;

            if (!files.includes(filename)) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return", {
              error: false,
              message: ""
            });

          case 11:
            return _context2.abrupt("return", {
              error: true,
              message: _textPack["default"].storage["delete"].notOwnerOrDoesntExists
            });

          case 12:
            _context2.next = 15;
            break;

          case 14:
            return _context2.abrupt("return", {
              error: true,
              message: _textPack["default"].storage["delete"].notOwner
            });

          case 15:
            _context2.next = 20;
            break;

          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](0);
            throw new Error(_textPack["default"].standards.responseError);

          case 20:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 17]]);
  }));
  return _storageLog.apply(this, arguments);
}

function deleteFile(_x3, _x4) {
  return _deleteFile.apply(this, arguments);
}

function _deleteFile() {
  _deleteFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, filename) {
    var _storageLog3, data, fileLog, newLog;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return bucket.file(filename)["delete"]();

          case 3:
            _context3.prev = 3;
            _context3.next = 6;
            return database.doc(req.headers["x-ip"]).get();

          case 6:
            _storageLog3 = _context3.sent;

            if (!_storageLog3.exists) {
              _context3.next = 22;
              break;
            }

            data = _storageLog3.data();
            _context3.prev = 9;
            fileLog = data.uploads.files;
            newLog = [];
            fileLog.forEach(function (data) {
              if (data !== filename) {
                newLog.push(data);
              }
            });
            _context3.next = 15;
            return database.doc(req.headers["x-ip"]).update({
              uploads: {
                files: newLog,
                quantity: data.uploads.quantity - 1
              }
            });

          case 15:
            _context3.next = 20;
            break;

          case 17:
            _context3.prev = 17;
            _context3.t0 = _context3["catch"](9);
            throw new Error(_textPack["default"].standards.responseError);

          case 20:
            _context3.next = 23;
            break;

          case 22:
            return _context3.abrupt("return", {
              error: true,
              message: _textPack["default"].storage["delete"].lackOfPermission
            });

          case 23:
            _context3.next = 28;
            break;

          case 25:
            _context3.prev = 25;
            _context3.t1 = _context3["catch"](3);
            throw new Error(_textPack["default"].standards.responseError);

          case 28:
            return _context3.abrupt("return", {
              error: false,
              message: _textPack["default"].standards.responseOK
            });

          case 31:
            _context3.prev = 31;
            _context3.t2 = _context3["catch"](0);
            throw new Error(_textPack["default"].standards.responseError);

          case 34:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 31], [3, 25], [9, 17]]);
  }));
  return _deleteFile.apply(this, arguments);
}

router["delete"]("/", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var performanceLog, filename, isUserOwner, isUserOwnerTries, deleteFileAction, deleteFileActionTries;
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
            performanceLog.watchpoint("isUserOwner");
            _context.next = 9;
            return (0, _retryHandler["default"])(storageLog.bind(_this, req, filename), 2);

          case 9:
            isUserOwner = _context.sent;
            isUserOwnerTries = isUserOwner.length - 1;

            if (!isUserOwner[isUserOwnerTries].error) {
              _context.next = 17;
              break;
            }

            performanceLog.watchpointEnd("isUserOwner");
            performanceLog.finish();
            return _context.abrupt("return", res.status(500).json((0, _response["default"])(true, isUserOwner[isUserOwnerTries].data)));

          case 17:
            if (!isUserOwner[isUserOwnerTries].data.error) {
              _context.next = 23;
              break;
            }

            performanceLog.watchpointEnd("isUserOwner");
            performanceLog.finish();
            return _context.abrupt("return", res.status(400).json((0, _response["default"])(true, isUserOwner[isUserOwnerTries].data.message)));

          case 23:
            performanceLog.watchpointEnd("isUserOwner");
            _context.next = 26;
            return (0, _retryHandler["default"])(deleteFile.bind(_this, req, filename), 2);

          case 26:
            deleteFileAction = _context.sent;
            deleteFileActionTries = deleteFileAction.length - 1;

            if (!deleteFileAction[deleteFileActionTries].error) {
              _context.next = 33;
              break;
            }

            performanceLog.finish();
            return _context.abrupt("return", res.status(500).json((0, _response["default"])(true, deleteFileAction[deleteFileActionTries].data)));

          case 33:
            performanceLog.finish();
            return _context.abrupt("return", res.json((0, _response["default"])(deleteFileAction[deleteFileActionTries].data.error, deleteFileAction[deleteFileActionTries].data.message)));

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x5, _x6) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;