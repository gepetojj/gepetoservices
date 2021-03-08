"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _mongoose = require("mongoose");

var _bodyParser = require("body-parser");

var _cors = _interopRequireDefault(require("cors"));

var _compression = _interopRequireDefault(require("compression"));

var _expressFileupload = _interopRequireDefault(require("express-fileupload"));

var _getIp = _interopRequireDefault(require("./assets/middlewares/getIp"));

var _rateLimiter = _interopRequireDefault(require("./assets/middlewares/rateLimiter"));

var _helmet = _interopRequireDefault(require("helmet"));

var _hsts = _interopRequireDefault(require("hsts"));

var _expressEnforcesSsl = _interopRequireDefault(require("express-enforces-ssl"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _handler = _interopRequireDefault(require("./api/handler"));

var _response = _interopRequireDefault(require("./assets/response"));

var _textPack = require("./assets/textPack.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("dotenv").config();

var app = (0, _express["default"])();
var port = process.env.PORT;

if (process.env.NODE_ENV === "production") {
  app.enable("trust proxy");
  app.use((0, _expressEnforcesSsl["default"])());
}

app.use((0, _hsts["default"])({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use((0, _helmet["default"])({
  hsts: false
}));
app.use((0, _cors["default"])({
  origin: "*"
}));
app.use((0, _compression["default"])());
app.use(_getIp["default"]);
app.use(_rateLimiter["default"]);
app.use((0, _bodyParser.urlencoded)({
  extended: false
}));
app.use((0, _bodyParser.json)());
app.use((0, _cookieParser["default"])());
app.use((0, _expressFileupload["default"])({
  createParentPath: true
}));
app.use((0, _morgan["default"])("dev"));
var mongoDB = process.env.MONGO_URI;
(0, _mongoose.connect)(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

_mongoose.connection.on("error", function (err) {
  console.error("Erro no MongoDB: ".concat(err));
  throw new Error(err);
});

app.use("/api", _handler["default"]);
app.get("/", function (req, res) {
  return res.status(300).redirect(_textPack.main.redirectURL);
});
app.use(function (req, res) {
  return res.status(404).json((0, _response["default"])(true, _textPack.main.notFound, {
    method: req.method,
    endpoint: req.path
  }));
});
app.listen(port, "0.0.0.0", function () {
  console.log(_textPack.main.serverStart);
});
var _default = app;
exports["default"] = _default;