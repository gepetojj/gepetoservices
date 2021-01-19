const express = require("express");
const router = express.Router();

const response = require("../../assets/response");
const validator = require("../../assets/validator");
const firebase = require("../../assets/firebase");
const textPack = require("../../assets/textPack.json");

const Performance = require("../../assets/tests/performance");

router.post("/", (req, res) => {
    const performanceLog = new Performance("/users/create");
    const { username, email, password, passwordConfirm } = req.body;

    if (
        username === undefined ||
        email === undefined ||
        password === undefined ||
        passwordConfirm === undefined
    ) {
        performanceLog.finish();
        return res
            .status(400)
            .json(response(true, textPack.standards.nullFields));
    }

    const dataValidation = validator([
        { type: "username", value: username },
        { type: "email", value: email },
        { type: "password", value: password },
        { type: "password", value: passwordConfirm },
        { type: "equals", value: password, equal: passwordConfirm },
    ]);

    if (dataValidation.length > 0) {
        performanceLog.finish();
        return res.status(400).json(
            response(true, textPack.standards.responseError, {
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
            photoURL: textPack.users.create.avatarURL,
        })
        .then((user) => {
            performanceLog.watchpoint("userCreation");
            firebase
                .auth()
                .setCustomUserClaims(user.uid, { admin: false })
                .then(() => {
                    performanceLog.finish();
                    return res.json(
                        response(false, textPack.users.create.userCreated)
                    );
                })
                .catch((err) => {
                    console.error(err);
                    performanceLog.finish();
                    return res
                        .status(500)
                        .json(response(true, textPack.standards.responseError));
                });
        })
        .catch((err) => {
            console.error(err);
            performanceLog.finish();
            return res
                .status(500)
                .json(response(true, textPack.users.create.userNotCreated));
        });
});

module.exports = router;
