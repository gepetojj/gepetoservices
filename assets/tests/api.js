const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../main");
const should = chai.should();

chai.use(chaiHttp);
let filename = "";

describe("API: Storage", () => {
    it("Deve upar o arquivo para o servidor", (done) => {
        chai.request(server)
            .post(`/api/storage/upload`)
            .set("content-type", "multipart/form-data")
            .attach("file", "./assets/tests/testImage.png")
            .end((err, res) => {
                if (err) console.log(err);
                res.should.have.status(200);
                filename = res.status === 200 ? res.body.filename : "";

                done();
            });
    });

    it("Deve acessar o arquivo e conseguir o link dele", (done) => {
        chai.request(server)
            .get(`/api/storage/access?filename=${filename}`)
            .end((err, res) => {
                if (err) console.log(err);
                res.should.have.status(200);

                done();
            });
    });

    it("Deve deletar o arquivo do servidor", (done) => {
        chai.request(server)
            .delete(`/api/storage/delete?filename=${filename}`)
            .end((err, res) => {
                if (err) console.log(err);
                res.should.have.status(200);

                done();
            });
    });
});

describe("API: Translator", () => {
    it("Deve traduzir a frase 'testando essa API' para inglês", (done) => {
        chai.request(server)
            .get(`/api/translator?text=testando essa API&from=pt&to=en`)
            .end((err, res) => {
                if (err) console.log(err);
                res.should.have.status(200);

                done();
            });
    });
});

describe("API: Status", () => {
    it("Deve testar todas as API's", (done) => {
        chai.request(server)
            .get(`/api/status`)
            .end((err, res) => {
                if (err) console.log(err);
                res.should.have.status(200);

                done();
            });
    });
});

describe("API: Users", () => {
    it("Deve criar um usuário", (done) => {
        chai.request(server)
            .post(`/api/users/create`)
            .send({
                username: "Teste",
                email: "teste@teste.com",
                password: "Teste!123123",
                passwordConfirm: "Teste!123123",
            })
            .end((err, res) => {
                if (err) console.log(err);
                res.should.have.status(200);

                done();
            });
    });
});
