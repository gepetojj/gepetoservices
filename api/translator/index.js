const express = require("express");
const router = express.Router();
const translate = require("@k3rn31p4nic/google-translate-api");
const xssFilters = require("xss-filters");

const response = require("../../assets/response");
const textPack = require("../../assets/textPack.json");

router.get("/", (req, res) => {
	let { text, from, to } = req.query;

	if (!text || !to) {
		return res
			.status(400)
			.json(response(true, textPack.standards.nullFields));
	}

	from = !from === true ? from : xssFilters.uriQueryInHTMLData(from);
	to = xssFilters.uriQueryInHTMLData(to);

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
