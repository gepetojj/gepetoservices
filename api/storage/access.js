import { Router } from "express";
const router = Router();
import xssFilters from "xss-filters";

import firebase from "../../assets/firebase";
import response from "../../assets/response";
import retryHandler from "../../assets/retryHandler";
import textPack from "../../assets/textPack.json";
import Performance from "../../assets/tests/performance";

const bucket = firebase.storage().bucket();

async function makeFilePublic(file) {
	try {
		await file.makePublic();
		return {
			error: false,
			message: "",
		};
	} catch (err) {
		throw new Error(textPack.storage.access.makePublicError);
	}
}

router.get("/", async (req, res) => {
	const performanceLog = new Performance(req.baseUrl);
	let { filename } = req.query;

	if (!filename) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	filename = xssFilters.uriQueryInHTMLData(filename);

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
		response(false, textPack.standards.responseOK, {
			file: file.publicUrl(),
		})
	);
});

export default router;
