const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const shortid = require("shortid");
const fs = require("fs");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");
const retryHandler = require("../../assets/retryHandler");

const bucket = firebase.storage().bucket();
const database = firebase.firestore().collection("storageLog");
moment().locale("pt-br");
moment().tz("America/Maceio");

async function verifyUserLimits(req) {
    try {
        const limit = await database.doc(req.ip).get();
        if (limit.exists) {
            const data = limit.data();
            const maxUploads = data.uploads.quantity >= 7;
            if (maxUploads) {
                return {
                    error: true,
                    message:
                        "Você atingiu seu limite de 7 arquivos armazenados.",
                };
            } else {
                return {
                    error: false,
                    message: "Limite ainda não alcançado.",
                };
            }
        } else {
            return {
                error: false,
                message: "O limite ainda não existe.",
            };
        }
    } catch (err) {
        throw new Error(
            "Não foi possível verificar seus limites. Contate o administrador."
        );
    }
}

async function logUserAction(req, filename) {
    try {
        const log = await database.doc(req.ip).get();
        if (!log.exists) {
            try {
                await database.doc(req.ip).set({
                    uploader: req.ip,
                    uploads: {
                        quantity: 1,
                        files: [filename],
                    },
                });
            } catch (err) {
                throw new Error("Não foi possível registrar seu upload.");
            }
            return {
                error: false,
                message: "Ação registrada.",
            };
        } else {
            const data = log.data();
            try {
                await database.doc(req.ip).update({
                    uploads: {
                        quantity: data.uploads.quantity + 1,
                        files: [...data.uploads.files, filename],
                    },
                });
            } catch (err) {
                throw new Error("Não foi possível registrar seu upload.");
            }
            return {
                error: false,
                message: "Ação registrada.",
            };
        }
    } catch (err) {
        throw new Error("Não foi possível registrar sua ação.");
    }
}

async function deleteFile(bucket, filename) {
    const file = bucket.file(filename);
    try {
        await file.delete();
        return {
            error: true,
            message:
                "Não foi possível registrar seu upload, mas sua ação foi cancelada. Tente novamente.",
        };
    } catch (err) {
        throw new Error(
            "Não foi possível cancelar seu upload por causa do erro anterior. Contate o administrador."
        );
    }
}

router.post("/", async (req, res) => {
    if (!req.files) {
        return res
            .status(400)
            .json(response(true, "O arquivo não pode ser nulo."));
    }

    const file = req.files.file;
    const mimeTypes = ["text", "image", "audio", "video"];

    if (file.size > 5242880) {
        return res
            .status(400)
            .json(response(true, "Seu arquivo não pode ter mais que 5 MB."));
    } else if (!mimeTypes.includes(file.mimetype.split("/")[0])) {
        return res
            .status(400)
            .json(
                response(
                    true,
                    "Seu arquivo só pode ser: texto, imagem, audio ou vídeo."
                )
            );
    }

    const userLimits = await retryHandler(verifyUserLimits.bind(this, req), 2);
    const tries = userLimits.length - 1;
    if (userLimits[tries].error === true) {
        return res.status(500).json(response(true, userLimits[tries].data));
    } else {
        if (userLimits[tries].data.error === true) {
            return res
                .status(400)
                .json(response(true, userLimits[tries].data.message));
        }
    }

    const filename = moment().format(
        `DD-MM-YYYY_hh-mm-ssa_[${shortid.generate()}.${
            file.mimetype.split("/")[1]
        }]`
    );
    file.mv(`${process.cwd()}/temp/${filename}`, (err) => {
        if (err) {
            console.error(err);
            return res
                .status(500)
                .json(
                    response(
                        true,
                        "Não foi possível realizar procedimentos em seu arquivo. Contate o administrador."
                    )
                );
        }

        bucket
            .upload(`${process.cwd()}/temp/${filename}`, {
                gzip: true,
                validation: file.md5,
            })
            .then(async () => {
                fs.unlinkSync(`${process.cwd()}/temp/${filename}`, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });

                const logAction = await retryHandler(
                    logUserAction.bind(this, req, filename),
                    2
                );
                const logActionTries = logAction.length - 1;

                if (logAction[logActionTries].error === true) {
                    const deleteFileAfterError = await retryHandler(
                        deleteFile.bind(this, bucket, filename),
                        2
                    );
                    const dfaErrorTries = deleteFileAfterError.length - 1;

                    if (deleteFileAfterError[dfaErrorTries].error === true) {
                        return res
                            .status(500)
                            .json(
                                response(
                                    true,
                                    deleteFileAfterError[dfaErrorTries].data
                                )
                            );
                    } else {
                        return res
                            .status(500)
                            .json(
                                response(
                                    true,
                                    deleteFileAfterError[dfaErrorTries].data
                                        .message
                                )
                            );
                    }
                }

                return res.json(
                    response(false, "Seu arquivo foi armazenado com sucesso.", {
                        filename,
                    })
                );
            })
            .catch((err) => {
                console.error(err);
                return res
                    .status(500)
                    .json(
                        response(
                            true,
                            "Não foi possível armazenar seu arquivo. Tente novamente."
                        )
                    );
            });
    });
});

module.exports = router;
