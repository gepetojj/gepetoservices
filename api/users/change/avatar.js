require("dotenv").config();
import { Router } from 'express';
const router = Router();
import fs from 'fs';
import Jimp from 'jimp';
import shortid from 'shortid';
import crypto from 'crypto';
import authorize from '../../../assets/middlewares/authorize';
import response from '../../../assets/response';
import textPack from '../../../assets/textPack.json';
import User from '../../../assets/models/User';
import firebase from '../../../assets/firebase';
import Performance from '../../../assets/tests/performance';

const bucket = firebase.storage().bucket();

async function checkUserAvatar(uid) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const avatar = bucket.file(`${uid}.jpg`);
			const avatarExists = await avatar.exists();
			resolve(avatarExists[0]);
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

async function deleteOldAvatar(uid) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const avatar = bucket.file(`${uid}.jpg`);
			await avatar.delete();
			resolve();
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

async function moveFile(file) {
	const promise = new Promise((resolve, reject) => {
		const path = `${process.cwd()}/temp/${shortid.generate()}.${
			file.mimetype.split("/")[1]
		}`;
		file.mv(path, (err) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve(path);
		});
	});
	return promise;
}

async function resizeImage(uid, path) {
	const promise = new Promise((resolve, reject) => {
		Jimp.read(path)
			.then((image) => {
				const newPath = `${process.cwd()}/temp/${uid}.jpg`;

				image
					.resize(128, 128)
					.quality(95)
					.write(newPath, (err) => {
						if (err) {
							console.error(err);
							reject(err);
						}

						fs.readFile(newPath, (err, data) => {
							if (err) {
								console.error(err);
								reject(err);
							}
							const checksum = crypto
								.createHash("md5")
								.update(data, "utf8")
								.digest("hex");

							resolve({ newPath, checksum });
						});
					});
			})
			.catch((err) => {
				console.error(err);
				reject(err);
			});
	});
	return promise;
}

function deleteImage(path) {
	try {
		fs.unlinkSync(path);
		return { error: false };
	} catch (err) {
		console.error(err);
		return { error: true, message: textPack.standards.responseError };
	}
}

async function uploadAvatar(path, checksum) {
	const promise = new Promise(async (resolve, reject) => {
		await bucket
			.upload(path, {
				gzip: true,
				validation: checksum,
			})
			.then(resolve())
			.catch((err) => {
				console.error(err.message);
				reject(err);
			});
	});
	return promise;
}

async function updateUserAvatar(uid) {
	const promise = new Promise(async (resolve, reject) => {
		const avatar = bucket.file(`${uid}.jpg`);
		setTimeout(async () => {
			await avatar
				.makePublic()
				.then(async () => {
					const publicUrl = avatar.publicUrl();
					await User.updateOne({ _id: uid }, { avatar: publicUrl });
					resolve(publicUrl);
				})
				.catch((err) => {
					console.error(err.message);
					reject(err);
				});
		}, 300);
	});
	return promise;
}

router.put("/", authorize({ level: 0 }), async (req, res) => {
	const performanceLog = new Performance(req.baseUrl);
	const uid = req.user.id;

	if (!req.files) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	const file = req.files.file;
	const mimetype = file.mimetype.split("/");

	if (file.size > 3145728) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.users.change.avatar.fileLimit));
	}

	if (mimetype[0] !== "image" || !["png", "jpeg"].includes(mimetype[1])) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.users.change.avatar.fileType));
	}

	let promisesResults = [];

	Promise.resolve(promisesResults)
		.then(async (all) => {
			return await checkUserAvatar(uid)
				.then((avatarExists) => {
					if (avatarExists) {
						deleteOldAvatar(uid)
							.catch(() => {
								throw new Error(
									`500:${textPack.users.change.avatar.couldntDeleteOldAvatar}`
								);
							})
							.then(() => {
								return all;
							});
					}
					return all;
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.users.change.avatar.couldntDeleteOldAvatar}`
					);
				});
		})
		.then(async (all) => {
			return await moveFile(file)
				.then((path) => {
					all.push(path);
					return all;
				})
				.catch(() => {
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			return await resizeImage(uid, all[0])
				.then(({ newPath, checksum }) => {
					all.push(newPath);
					all.push(checksum);
					return all;
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.users.change.avatar.avatarNotUploaded}`
					);
				});
		})
		.then(async (all) => {
			return await uploadAvatar(all[1], all[2])
				.then(() => {
					return all;
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.users.change.avatar.avatarNotUploaded}`
					);
				});
		})
		.then(async (all) => {
			return await updateUserAvatar(uid)
				.then((avatarLink) => {
					const originalImageDeletion = deleteImage(all[0]);
					const resizedImageDeletion = deleteImage(all[1]);
					if (
						originalImageDeletion.error ||
						resizedImageDeletion.error
					) {
						throw new Error(
							`500:${textPack.standards.responseError}`
						);
					}
					performanceLog.finish();
					return res.json(
						response(
							false,
							textPack.users.change.avatar.avatarUploaded,
							{ link: avatarLink }
						)
					);
				})
				.catch(() => {
					const originalImageDeletion = deleteImage(originalFilePath);
					const resizedImageDeletion = deleteImage(resizedImagePath);
					if (
						originalImageDeletion.error ||
						resizedImageDeletion.error
					) {
						throw new Error(
							`500:${textPack.standards.responseError}`
						);
					}
				});
		})
		.catch((err) => {
			performanceLog.finish();
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
