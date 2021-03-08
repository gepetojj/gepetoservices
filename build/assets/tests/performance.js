"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");

var Performance = /*#__PURE__*/function () {
  function Performance(endpoint) {
    _classCallCheck(this, Performance);

    this.endpoint = endpoint || "um endpoint";
    this.start = (0, _momentTimezone["default"])().valueOf();
    this.watchpoints = [];
    this.end = null;
    this.executionTime = null;
  }

  _createClass(Performance, [{
    key: "watchpoint",
    value: function watchpoint(name) {
      this.watchpoints.push({
        name: name,
        start: (0, _momentTimezone["default"])().valueOf(),
        end: null
      });
    }
  }, {
    key: "watchpointEnd",
    value: function watchpointEnd(name) {
      var index = this.watchpoints.findIndex(function (doc) {
        return doc.name === name;
      });
      this.watchpoints[index] = {
        name: name,
        start: this.watchpoints[index].start,
        end: (0, _momentTimezone["default"])().valueOf()
      };
    }
  }, {
    key: "finish",
    value: function finish() {
      this.watchpoints.forEach(function (watchpoint) {
        console.log("A execu\xE7\xE3o do processo '".concat(watchpoint.name, "' gastou ").concat((0, _momentTimezone["default"])(watchpoint.end - watchpoint.start).format("x [ms.]")));
      });
      this.end = (0, _momentTimezone["default"])().valueOf();
      this.executionTime = this.end - this.start;
      console.log("O endpoint '".concat(this.endpoint, "' respondeu em ").concat((0, _momentTimezone["default"])(this.end - this.start).format("x [ms.]")));
      return console.log("---");
    }
  }]);

  return Performance;
}();

var _default = Performance;
exports["default"] = _default;