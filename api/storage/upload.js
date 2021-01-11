const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const shortid = require("shortid");
const fs = require("fs");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");

const bucket = firebase.storage().bucket();
const database = firebase.firestore().collection("storageLog");
moment().locale("pt-br");
moment().tz("America/Maceio");

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

    try {
        const limit = await database.doc(req.ip).get();
        if (limit.exists) {
            const data = limit.data();
            if (data.uploads.quantity >= 7) {
                return res
                    .status(400)
                    .json(
                        response(
                            true,
                            "Você atingiu seu limite de 7 arquivos armazenados."
                        )
                    );
            }
        }
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json(
                response(
                    true,
                    "Não foi possível verificar seus limites. Contate o administrador."
                )
            );
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
            .then(() => {
                fs.unlinkSync(`${process.cwd()}/temp/${filename}`, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log("Arquivo deletado.");
                });

                database
                    .doc(req.ip)
                    .get()
                    .then((doc) => {
                        if (!doc.exists) {
                            database.doc(req.ip).set({
                                uploader: req.ip,
                                uploads: {
                                    quantity: 1,
                                    files: [filename],
                                },
                            });
                        } else {
                            const data = doc.data();
                            database.doc(req.ip).update({
                                uploads: {
                                    quantity: data.uploads.quantity + 1,
                                    files: [...data.uploads.files, filename],
                                },
                            });
                        }
                    })
                    .catch((err) => {
                        console.error(err);

                        const file = bucket.file(filename);
                        file.delete()
                            .then(() => {
                                return res
                                    .status(500)
                                    .json(
                                        response(
                                            true,
                                            "Não foi possível registrar seu upload. Tente novamente."
                                        )
                                    );
                            })
                            .catch((err) => {
                                console.error(err);
                                return res
                                    .status(500)
                                    .json(
                                        response(
                                            true,
                                            "Não foi possível reverter sua ação devido a um erro crítico. Contate um administrador."
                                        )
                                    );
                            });
                    });

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
