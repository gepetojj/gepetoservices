"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _googleTranslateApi = _interopRequireDefault(require("@k3rn31p4nic/google-translate-api"));

var _xssFilters = _interopRequireDefault(require("xss-filters"));

var _response = _interopRequireDefault(require("../../assets/response"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.get("/", function (req, res) {
  var _req$query = req.query,
      text = _req$query.text,
      from = _req$query.from,
      to = _req$query.to;

  if (!text || !to) {
    return res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullFields));
  }

  from = !from === true ? from : _xssFilters["default"].uriQueryInHTMLData(from);
  to = _xssFilters["default"].uriQueryInHTMLData(to);
  (0, _googleTranslateApi["default"])(text, {
    from: from || "auto",
    to: to
  }).then(function (translatedText) {
    return res.json((0, _response["default"])(false, translatedText));
  })["catch"](function (err) {
    console.error(err);
    (0, _googleTranslateApi["default"])(err.message, {
      from: "en",
      to: "pt"
    }).then(function (translatedError) {
      return res.status(500).json((0, _response["default"])(true, translatedError.text));
    })["catch"](function (err) {
      console.error(err);
      return res.status(500).json((0, _response["default"])(true, _textPack["default"].standards.responseError));
    });
  });
});
var _default = router;
exports["default"] = _default;