"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _validator = _interopRequireDefault(require("validator"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _uuid = _interopRequireDefault(require("uuid"));

var _textPack = _interopRequireDefault(require("../textPack.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");

function Session(_ref) {
  var uid = _ref.uid,
      username = _ref.username,
      agent = _ref.agent,
      ip = _ref.ip,
      app = _ref.app,
      refreshToken = _ref.refreshToken;

  if (!_validator["default"].isMongoid(uid)) {
    return {
      error: true,
      message: "UID inválido."
    };
  }

  if (_validator["default"].isEmpty(username)) {
    return {
      error: true,
      message: "Username não pode ser nulo."
    };
  }

  if (_validator["default"].isEmpty(agent)) {
    return {
      error: true,
      message: "Agent não pode ser nulo."
    };
  }

  if (!_validator["default"].isIP(ip, 4)) {
    return {
      error: true,
      message: "IP inválido."
    };
  }

  if (!_textPack["default"].authorize.apps.includes(app)) {
    return {
      error: true,
      message: "App inválido."
    };
  }

  if (!_validator["default"].isJWT(refreshToken)) {
    return {
      error: true,
      message: "RefreshToken inválido."
    };
  }

  return {
    error: false,
    session: {
      uid: uid,
      username: username,
      agent: agent,
      ip: ip,
      refreshToken: refreshToken,
      sessionId: _uuid["default"].v4(),
      loginDate: (0, _momentTimezone["default"])().valueOf(),
      validUntil: (0, _momentTimezone["default"])().add(1, "day").valueOf()
    }
  };
}

var _default = Session;
exports["default"] = _default;