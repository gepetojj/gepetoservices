const express = require("express");
const router = express.Router();
const validator = require("validator");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");
const retryHandler = require("../../assets/retryHandler");

const bucket = firebase.storage().bucket();
const database = firebase.firestore().collection("storageLog");

async function storageLog(req, filename) {
    try {
        const storageLog = await database.doc(req.ip).get();
        if (storageLog.exists) {
            const data = storageLog.data();
            const files = data.uploads.files;

            if (files.includes(filename)) {
                return {
                    error: false,
                    message: "",
                };
            } else {
                return {
                    error: true,
                    message: "Você não é dono deste arquivo ou ele não existe.",
                };
            }
        } else {
            return {
                error: true,
                message: "Você não é dono deste arquivo.",
            };
        }
    } catch (err) {
        throw new Error(
            "Não foi possível verificar se este arquivo é seu. Tente novamente."
        );
    }
}

async function deleteFile(req, filename) {
    try {
        await bucket.file(filename).delete();
        try {
            const storageLog = await database.doc(req.ip).get();
            if (storageLog.exists) {
                const data = storageLog.data();
                try {
                    const fileLog = data.uploads.files;
                    let newLog = [];
                    fileLog.forEach((data) => {
                        if (data !== filename) {
                            newLog.push(data);
                        }
                    });
                    await database.doc(req.ip).update({
                        uploads: {
                            files: newLog,
                            quantity: data.uploads.quantity - 1,
                        },
                    });
                } catch (err) {
                    throw new Error(
                        "Não foi possível concluir a operação. Tente novamente."
                    );
                }
            } else {
                return {
                    error: true,
                    message: "Você não tem permissão para isso.",
                };
            }
        } catch (err) {
            throw new Error(
                "Não foi possível atualizar seus uploads. Tente novamente."
            );
        }
        return {
            error: false,
            message: "Arquivo deletado com sucesso.",
        };
    } catch (err) {
        throw new Error(
            "Não foi possível deletar este arquivo. Tente novamente."
        );
    }
}

router.delete("/", async (req, res) => {
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

    const isUserOwner = await retryHandler(
        storageLog.bind(this, req, filename),
        2
    );
    const isUserOwnerTries = isUserOwner.length - 1;

    if (isUserOwner[isUserOwnerTries].error) {
        return res
            .status(500)
            .json(response(true, isUserOwner[isUserOwnerTries].data));
    } else {
        if (isUserOwner[isUserOwnerTries].data.error) {
            return res
                .status(400)
                .json(
                    response(true, isUserOwner[isUserOwnerTries].data.message)
                );
        } else {
            const deleteFileAction = await retryHandler(
                deleteFile.bind(this, req, filename),
                2
            );
            const deleteFileActionTries = deleteFileAction.length - 1;

            if (deleteFileAction[deleteFileActionTries].error) {
                return res
                    .status(500)
                    .json(
                        response(
                            true,
                            deleteFileAction[deleteFileActionTries].data
                        )
                    );
            } else {
                return res.json(
                    response(
                        deleteFileAction[deleteFileActionTries].data.error,
                        deleteFileAction[deleteFileActionTries].data.message
                    )
                );
            }
        }
    }
});

module.exports = router;
