"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var retryHandler = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(func, times) {
    var timesExecuted, retryData, returnedData;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            timesExecuted = 0;
            retryData = [];

          case 2:
            if (!(timesExecuted < times)) {
              _context.next = 17;
              break;
            }

            timesExecuted++;
            _context.prev = 4;
            _context.next = 7;
            return func();

          case 7:
            returnedData = _context.sent;
            retryData.push({
              "try": timesExecuted,
              error: false,
              data: returnedData
            });
            return _context.abrupt("break", 17);

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](4);
            retryData.push({
              "try": timesExecuted,
              error: true,
              data: _context.t0.message
            });

          case 15:
            _context.next = 2;
            break;

          case 17:
            return _context.abrupt("return", retryData);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[4, 12]]);
  }));

  return function retryHandler(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _default = retryHandler;
exports["default"] = _default;