const express = require("express");
const router = express.Router();

const response = require("../../assets/response");
const firebase = require("../../assets/firebase");
const textPack = require("../../assets/textPack.json");

router.get("/", (req, res) => {
    const { token } = req.query;

    if (token === undefined) {
        return res
            .status(400)
            .json(response(true, textPack.standards.nullField));
    } else if (!token.length > 0) {
        return res
            .status(400)
            .json(response(true, textPack.standards.nullField));
    }

    firebase
        .auth()
        .verifyIdToken(token)
        .then(() => {
            return res.json(response(false, textPack.users.verify.responseOK));
        })
        .catch((err) => {
            console.error(err);
            if (err.code === "auth/argument-error") {
                return res
                    .status(400)
                    .json(response(true, textPack.users.verify.responseError));
            } else {
                return res
                    .status(500)
                    .json(response(true, textPack.standards.responseError));
            }
        });
});

module.exports = router;
