"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _firebaseAdmin = _interopRequireDefault(require("firebase-admin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("dotenv").config();

var config = {
  type: "service_account",
  project_id: "gepetoservices",
  private_key_id: process.env.PKID,
  private_key: process.env.PK.replace(/\\n/g, "\n"),
  client_email: process.env.CE,
  client_id: process.env.CID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.CURL
};

_firebaseAdmin["default"].initializeApp({
  credential: _firebaseAdmin["default"].credential.cert(config),
  databaseURL: "https://gepetoservices.firebaseio.com",
  storageBucket: "gepetoservices.appspot.com"
});

var _default = _firebaseAdmin["default"];
exports["default"] = _default;