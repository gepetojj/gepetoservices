import { Router } from "express";
const router = Router();
import translate from "@k3rn31p4nic/google-translate-api";
import xssFilters from "xss-filters";

import response from "../../assets/response";
import textPack from "../../assets/textPack.json";
import logger from "../../assets/logger";

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
			logger.error(err.message);
			translate(err.message, { from: "en", to: "pt" })
				.then((translatedError) => {
					return res
						.status(500)
						.json(response(true, translatedError.text));
				})
				.catch((err) => {
					logger.error(err.message);
					return res
						.status(500)
						.json(response(true, textPack.standards.responseError));
				});
		});
});

export default router;
