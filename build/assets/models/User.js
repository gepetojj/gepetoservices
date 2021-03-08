"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _textPack = _interopRequireDefault(require("../textPack.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");
var User = new _mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    max: 12
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  avatar: {
    type: String,
    "default": _textPack["default"].users.register.avatarURL
  },
  level: {
    type: Number,
    "default": 0
  },
  state: {
    banned: {
      type: Boolean,
      "default": false
    },
    reason: {
      type: String
    },
    banDate: {
      type: Number
    },
    emailConfirmed: {
      type: Boolean,
      "default": false
    },
    tfaActivated: {
      type: Boolean,
      "default": false
    }
  },
  tfa: {
    recoverCodes: [String],
    secret: {
      hash: {
        type: String
      },
      key: {
        type: Buffer
      },
      iv: {
        type: Buffer
      }
    }
  },
  register: {
    date: {
      type: Number,
      "default": (0, _momentTimezone["default"])().valueOf()
    },
    agent: {
      type: String,
      required: true
    },
    ip: {
      type: String,
      required: true
    }
  },
  lastLogin: {
    date: {
      type: Number
    },
    agent: {
      type: String
    },
    ip: {
      type: String
    },
    token: {
      type: String
    },
    app: {
      type: String
    }
  },
  apps: [String]
});
var UserModel = (0, _mongoose.model)("User", User, "users");
var _default = UserModel;
exports["default"] = _default;