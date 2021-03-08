"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Cria um objeto padrão de resposta da API.
 * @param {Boolean} error Se houve erro na execução da API.
 * @param {String} message Mensagem a ser retornada pela API.
 * @param {Object} optional Parâmetros adicionais opcionais a serem retornados pela API
 * @returns {Object} Retorna um objeto padrão para responder chamadas
 * a API.
 */
function response(error, message) {
  var optional = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return _objectSpread({
    error: error,
    message: message
  }, optional);
}

var _default = response;
exports["default"] = _default;