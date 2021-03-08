"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _redis = require("redis");

require("dotenv").config();

var redisServer = process.env.REDIS_SERVER;
var redisClient = (0, _redis.createClient)({
  url: redisServer,
  enable_offline_queue: false
});
redisClient.on("connect", function () {
  console.log("Conectado ao redis.");
});
redisClient.on("error", function (err) {
  console.error("Conexão interrompida com o redis.");
  throw new Error(err);
});
var _default = redisClient;
exports["default"] = _default;