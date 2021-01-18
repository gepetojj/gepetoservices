const express = require("express");
const router = express.Router();

const response = require("../../assets/response");
const validator = require("../../assets/validator");
const firebase = require("../../assets/firebase");

router.post("/", (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    if (
        username === undefined ||
        email === undefined ||
        password === undefined ||
        passwordConfirm === undefined
    ) {
        return res
            .status(400)
            .json(
                response(
                    true,
                    "Algum dos campos necessários não foi preenchido."
                )
            );
    }

    const dataValidation = validator([
        { type: "username", value: username },
        { type: "email", value: email },
        { type: "password", value: password },
        { type: "password", value: passwordConfirm },
        { type: "equals", value: password, equal: passwordConfirm },
    ]);

    if (dataValidation.length > 0) {
        return res.status(400).json(
            response(true, "Houve um erro ao tentar validar seu request.", {
                errors: dataValidation,
            })
        );
    }

    firebase
        .auth()
        .createUser({
            email,
            password,
            displayName: username,
            photoURL:
                "https://firebasestorage.googleapis.com/v0/b/gepetoservices.appspot.com/o/user_image.png?alt=media&token=be333301-d240-47cf-9105-831881fe10ba",
        })
        .then((user) => {
            firebase
                .auth()
                .setCustomUserClaims(user.uid, { admin: false })
                .then(() => {
                    return res.json(
                        response(false, "Seu usuário foi criado com sucesso.")
                    );
                })
                .catch((err) => {
                    console.error(err);
                    return res
                        .status(500)
                        .json(
                            response(
                                true,
                                "Não foi possível concluir seu pedido. Tente novamente."
                            )
                        );
                });
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(500)
                .json(
                    response(
                        true,
                        "Não foi possível criar seu usuário. Tente novamente."
                    )
                );
        });
});

module.exports = router;
