"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _crypto = require("crypto");

function Crypto() {
  var algorithm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "aes-256-ctr";

  /**
   * Criptografa uma string.
   * @param {String} string Texto a ser criptografado.
   * @returns {Object} Retorna um objeto com a key 'error'. Caso error
   * seja 'false', os dados da criptografia virão juntos. Caso error seja
   * 'true', apenas essa key existirá.
   */
  function enc(string) {
    try {
      var key = (0, _crypto.randomBytes)(32);
      var iv = (0, _crypto.randomBytes)(16);
      var cipher = (0, _crypto.createCipheriv)(algorithm, key, iv);
      var encrypted = Buffer.concat([cipher.update(string), cipher["final"]()]);
      return {
        error: false,
        hash: encrypted.toString("hex"),
        key: key,
        iv: iv
      };
    } catch (err) {
      console.error(err);
      return {
        error: true
      };
    }
  }
  /**
   * Descriptografa um hash.
   * @param {String} hash Hash a ser descriptografado.
   * @param {Buffer} key Chave de criptografia do hash.
   * @param {Buffer} iv IV do hash.
   * @returns {Object} Retorna um objeto com a key 'error'. Caso error
   * seja 'false', virá a 'string' com os dados descriptografados.
   * Caso error seja 'true', apenas essa key existirá.
   */


  function dec(_ref) {
    var hash = _ref.hash,
        key = _ref.key,
        iv = _ref.iv;

    try {
      var decipher = (0, _crypto.createDecipheriv)(algorithm, key, Buffer.from(iv, "hex"));
      var decrypted = Buffer.concat([decipher.update(Buffer.from(hash, "hex")), decipher["final"]()]);
      return {
        error: false,
        result: decrypted.toString()
      };
    } catch (err) {
      console.error(err);
      return {
        error: true
      };
    }
  }

  return {
    enc: enc,
    dec: dec
  };
}

var _default = Crypto;
exports["default"] = _default;