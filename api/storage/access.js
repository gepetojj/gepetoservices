const express = require("express");
const router = express.Router();
const validator = require("validator");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");
const retryHandler = require("../../assets/retryHandler");

const bucket = firebase.storage().bucket();

async function makeFilePublic(file) {
    try {
        await file.makePublic();
        return {
            error: false,
            message: "",
        };
    } catch (err) {
        throw new Error(
            "Não foi possível deixar seu arquivo público ou seu arquivo não existe. Tente novamente."
        );
    }
}

router.get("/", async (req, res) => {
    const { filename } = req.query;

    if (filename === undefined) {
        return res
            .status(400)
            .json(response(true, "O nome do arquivo não pode ser nulo."));
    } else if (validator.isEmpty(filename)) {
        return res
            .status(400)
            .json(response(true, "O nome do arquivo não pode ser nulo."));
    }

    const file = bucket.file(filename);

    const makeFilePublicHandler = await retryHandler(
        makeFilePublic.bind(this, file),
        2
    );
    const tries = makeFilePublicHandler.length - 1;

    if (makeFilePublicHandler[tries].error === true) {
        return res
            .status(500)
            .json(response(true, makeFilePublicHandler[tries].data));
    }

    return res.json(
        response(false, "Arquivo resgatado com sucesso.", {
            file: file.publicUrl(),
        })
    );
});

module.exports = router;
