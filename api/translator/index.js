const express = require("express");
const router = express.Router();
const translate = require("@k3rn31p4nic/google-translate-api");
const validator = require("validator");

const response = require("../../assets/response");
const textPack = require("../../assets/textPack.json");

router.get("/", (req, res) => {
    const { text, from, to } = req.query;

    if (text === undefined || from === undefined || to === undefined) {
        return res
            .status(400)
            .json(response(true, textPack.standards.nullFields));
    } else if (
        validator.isEmpty(text) ||
        validator.isEmpty(from) ||
        validator.isEmpty(to)
    ) {
        return res
            .status(400)
            .json(response(true, textPack.standards.nullFields));
    }

    translate(text, { from: from || "auto", to })
        .then((translatedText) => {
            return res.json(response(false, translatedText));
        })
        .catch((err) => {
            console.error(err);
            translate(err.message, { from: "en", to: "pt" })
                .then((translatedError) => {
                    return res
                        .status(500)
                        .json(response(true, translatedError.text));
                })
                .catch((err) => {
                    console.error(err);
                    return res
                        .status(500)
                        .json(response(true, textPack.standards.responseError));
                });
        });
});

module.exports = router;
