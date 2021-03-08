"use strict";

var _assert = _interopRequireDefault(require("assert"));

var _chai = _interopRequireDefault(require("chai"));

var _chaiHttp = _interopRequireDefault(require("chai-http"));

var _main = _interopRequireDefault(require("../../main"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var should = _chai["default"].should();

_chai["default"].use(_chaiHttp["default"]);

var filename = "";
describe("API: Storage", function () {
  it("Deve upar o arquivo para o servidor", function (done) {
    _chai["default"].request(_main["default"]).post("/api/storage/upload").set("content-type", "multipart/form-data").attach("file", "./assets/tests/testImage.png").end(function (err, res) {
      if (err) console.log(err);
      res.should.have.status(200);
      filename = res.status === 200 ? res.body.filename : "";
      done();
    });
  });
  it("Deve acessar o arquivo e conseguir o link dele", function (done) {
    _chai["default"].request(_main["default"]).get("/api/storage/access?filename=".concat(filename)).end(function (err, res) {
      if (err) console.log(err);
      res.should.have.status(200);
      done();
    });
  });
  it("Deve deletar o arquivo do servidor", function (done) {
    _chai["default"].request(_main["default"])["delete"]("/api/storage/delete?filename=".concat(filename)).end(function (err, res) {
      if (err) console.log(err);
      res.should.have.status(200);
      done();
    });
  });
});
describe("API: Translator", function () {
  it("Deve traduzir a frase 'testando essa API' para inglês", function (done) {
    _chai["default"].request(_main["default"]).get("/api/translator?text=testando essa API&from=pt&to=en").end(function (err, res) {
      if (err) console.log(err);
      res.should.have.status(200);
      done();
    });
  });
});
describe("API: Status", function () {
  it("Deve testar todas as API's", function (done) {
    _chai["default"].request(_main["default"]).get("/api/status").end(function (err, res) {
      if (err) console.log(err);
      res.should.have.status(200);
      done();
    });
  });
});
describe("API: Users", function () {
  it("Deve criar um usuário", function (done) {
    _chai["default"].request(_main["default"]).post("/api/users/create").send({
      username: "Teste",
      email: "teste@teste.com",
      password: "Teste!123123",
      passwordConfirm: "Teste!123123"
    }).end(function (err, res) {
      if (err) console.log(err);
      res.should.have.status(200);
      done();
    });
  });
});