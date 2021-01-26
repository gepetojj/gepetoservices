const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const shortid = require("shortid");
const fs = require("fs");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");
const retryHandler = require("../../assets/retryHandler");
const textPack = require("../../assets/textPack.json");

const Performance = require("../../assets/tests/performance");

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
					message: textPack.storage.upload.limitReached,
				};
			} else {
				return {
					error: false,
					message: "",
				};
			}
		} else {
			return {
				error: false,
				message: "",
			};
		}
	} catch (err) {
		throw new Error(textPack.storage.upload.limitError);
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
				throw new Error(textPack.standards.responseError);
			}
			return {
				error: false,
				message: "",
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
				throw new Error(textPack.standards.responseError);
			}
			return {
				error: false,
				message: "",
			};
		}
	} catch (err) {
		throw new Error(textPack.standards.nullField);
	}
}

async function deleteFile(bucket, filename) {
	const file = bucket.file(filename);
	try {
		await file.delete();
		return {
			error: true,
			message: textPack.storage.upload.uploadCanceled,
		};
	} catch (err) {
		throw new Error(textPack.storage.upload.uploadCanceledError);
	}
}

router.post("/", async (req, res) => {
	const performanceLog = new Performance("/storage/upload");
	if (!req.files) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	const file = req.files.file;
	const mimeTypes = ["text", "image", "audio", "video"];

	if (file.size > 5242880) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.storage.upload.fileLimit));
	} else if (!mimeTypes.includes(file.mimetype.split("/")[0])) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.storage.upload.fileType));
	}

	performanceLog.watchpoint("userLimits");
	const userLimits = await retryHandler(verifyUserLimits.bind(this, req), 2);
	const tries = userLimits.length - 1;
	if (userLimits[tries].error === true) {
		performanceLog.finish();
		return res.status(500).json(response(true, userLimits[tries].data));
	} else {
		if (userLimits[tries].data.error === true) {
			performanceLog.finish();
			return res
				.status(400)
				.json(response(true, userLimits[tries].data.message));
		}
	}
	performanceLog.watchpointEnd("userLimits");

	performanceLog.watchpoint("fileMove");
	const filename = moment().format(
		`DD-MM-YYYY_hh-mm-ssa_[${shortid.generate()}.${
			file.mimetype.split("/")[1]
		}]`
	);
	file.mv(`${process.cwd()}/temp/${filename}`, (err) => {
		if (err) {
			performanceLog.watchpointEnd("fileMove");
			console.error(err);
			performanceLog.finish();
			return res
				.status(500)
				.json(response(true, textPack.standards.responseError));
		}
		performanceLog.watchpointEnd("fileMove");

		performanceLog.watchpoint("fileUpload");
		bucket
			.upload(`${process.cwd()}/temp/${filename}`, {
				gzip: true,
				validation: file.md5,
			})
			.then(async () => {
				performanceLog.watchpointEnd("fileUpload");
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
						performanceLog.finish();
						return res
							.status(500)
							.json(
								response(
									true,
									deleteFileAfterError[dfaErrorTries].data
								)
							);
					} else {
						performanceLog.finish();
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

				performanceLog.finish();
				return res.json(
					response(false, textPack.standards.responseOK, {
						filename,
					})
				);
			})
			.catch((err) => {
				performanceLog.watchpointEnd("fileUpload");
				console.error(err);
				performanceLog.finish();
				return res
					.status(500)
					.json(response(true, textPack.standards.responseError));
			});
	});
});

module.exports = router;
