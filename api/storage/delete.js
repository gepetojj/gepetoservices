const express = require("express");
const router = express.Router();
const validator = require("validator");

const firebase = require("../../assets/firebase");
const response = require("../../assets/response");
const retryHandler = require("../../assets/retryHandler");
const textPack = require("../../assets/textPack.json");

const Performance = require("../../assets/tests/performance");

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
					message: textPack.storage.delete.notOwnerOrDoesntExists,
				};
			}
		} else {
			return {
				error: true,
				message: textPack.storage.delete.notOwner,
			};
		}
	} catch (err) {
		throw new Error(textPack.standards.responseError);
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
					throw new Error(textPack.standards.responseError);
				}
			} else {
				return {
					error: true,
					message: textPack.storage.delete.lackOfPermission,
				};
			}
		} catch (err) {
			throw new Error(textPack.standards.responseError);
		}
		return {
			error: false,
			message: textPack.standards.responseOK,
		};
	} catch (err) {
		throw new Error(textPack.standards.responseError);
	}
}

router.delete("/", async (req, res) => {
	const performanceLog = new Performance("/storage/delete");
	const { filename } = req.query;

	if (filename === undefined) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	} else if (validator.isEmpty(filename)) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	performanceLog.watchpoint("isUserOwner");
	const isUserOwner = await retryHandler(
		storageLog.bind(this, req, filename),
		2
	);
	const isUserOwnerTries = isUserOwner.length - 1;

	if (isUserOwner[isUserOwnerTries].error) {
		performanceLog.watchpointEnd("isUserOwner");
		performanceLog.finish();
		return res
			.status(500)
			.json(response(true, isUserOwner[isUserOwnerTries].data));
	} else {
		if (isUserOwner[isUserOwnerTries].data.error) {
			performanceLog.watchpointEnd("isUserOwner");
			performanceLog.finish();
			return res
				.status(400)
				.json(
					response(true, isUserOwner[isUserOwnerTries].data.message)
				);
		} else {
			performanceLog.watchpointEnd("isUserOwner");
			const deleteFileAction = await retryHandler(
				deleteFile.bind(this, req, filename),
				2
			);
			const deleteFileActionTries = deleteFileAction.length - 1;

			if (deleteFileAction[deleteFileActionTries].error) {
				performanceLog.finish();
				return res
					.status(500)
					.json(
						response(
							true,
							deleteFileAction[deleteFileActionTries].data
						)
					);
			} else {
				performanceLog.finish();
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
