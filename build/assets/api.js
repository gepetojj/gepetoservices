"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("dotenv").config();

function API(endpoint) {
  return process.env.NODE_ENV === "development" ? "http://localhost:5002/api".concat(endpoint) : "https://gepetoservices.herokuapp.com/api".concat(endpoint);
}

var _default = API;
exports["default"] = _default;