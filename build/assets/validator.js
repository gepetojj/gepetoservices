"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _validator = _interopRequireDefault(require("validator"));

var _textPack = _interopRequireDefault(require("./textPack.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Valida e sanitiza dados.
 * @param {Object} data Dados a serem sanitizados usando o padrão.
 * @returns {Array} Retorna uma lista com os possíveis erros. A lista
 * terá length 0 caso nenhum erro ocorra.
 */
function validator(data) {
  var response = [];
  data.forEach(function (doc) {
    switch (doc.type) {
      case "username":
        if (_validator["default"].isEmpty(doc.value)) {
          response.push(_textPack["default"].validator.username["null"]);
          break;
        } else if (!_validator["default"].isLength(doc.value, {
          max: 13
        })) {
          response.push(_textPack["default"].validator.username.length);
          break;
        } else if (!_validator["default"].isAlphanumeric(doc.value, ["pt-BR"])) {
          response.push(_textPack["default"].validator.username.alphanumeric);
          break;
        }

        break;

      case "email":
        if (_validator["default"].isEmpty(doc.value)) {
          response.push(_textPack["default"].validator.email["null"]);
          break;
        } else if (!_validator["default"].isEmail(doc.value)) {
          response.push(_textPack["default"].validator.email.valid);
          break;
        }

        break;

      case "password":
        if (_validator["default"].isEmpty(doc.value)) {
          response.push(_textPack["default"].validator.password["null"]);
          break;
        } else if (!_validator["default"].isLength(doc.value, {
          min: 10
        })) {
          response.push(_textPack["default"].validator.password.length);
          break;
        } else if (!_validator["default"].isStrongPassword(doc.value)) {
          response.push(_textPack["default"].validator.password.strong);
          break;
        }

        break;

      case "equals":
        if (_validator["default"].isEmpty(doc.value)) {
          response.push(_textPack["default"].validator.password["null"]);
          break;
        } else if (_validator["default"].isEmpty(doc.equal)) {
          response.push(_textPack["default"].validator.password["null"]);
          break;
        } else if (!_validator["default"].equals(doc.value, doc.equal)) {
          response.push(_textPack["default"].validator.equals.equal);
          break;
        }

        break;
    }
  });
  return response;
}

var _default = validator;
exports["default"] = _default;