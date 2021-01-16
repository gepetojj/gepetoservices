const express = require("express");
const router = express.Router();
const validator = require("validator");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");
const retryHandler = require("../../assets/retryHandler");

const Performance = require("../../assets/tests/performance");

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
    const performanceLog = new Performance("/storage/access");
    const { filename } = req.query;

    if (filename === undefined) {
        performanceLog.finish();
        return res
            .status(400)
            .json(response(true, "O nome do arquivo não pode ser nulo."));
    } else if (validator.isEmpty(filename)) {
        performanceLog.finish();
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
        performanceLog.finish();
        return res
            .status(500)
            .json(response(true, makeFilePublicHandler[tries].data));
    }

    performanceLog.finish();
    return res.json(
        response(false, "Arquivo resgatado com sucesso.", {
            file: file.publicUrl(),
        })
    );
});

module.exports = router;
