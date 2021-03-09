import { Router } from "express";
const router = Router();
import xssFilters from "xss-filters";
import firebase from "../../assets/firebase";
import response from "../../assets/response";
import retryHandler from "../../assets/retryHandler";
import textPack from "../../assets/textPack.json";
import Performance from "../../assets/tests/performance";

const bucket = firebase.storage().bucket();
const database = firebase.firestore().collection("storageLog");

async function storageLog(req, filename) {
	try {
		const storageLog = await database.doc(req.headers["x-ip"]).get();
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
			const storageLog = await database.doc(req.headers["x-ip"]).get();
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
					await database.doc(req.headers["x-ip"]).update({
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
	const performanceLog = new Performance(req.baseUrl);
	let { filename } = req.query;

	if (!filename) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	filename = xssFilters.uriQueryInHTMLData(filename);

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

export default router;
