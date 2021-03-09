require("dotenv").config();
import { Router } from "express";
const router = Router();
import { generateSecret } from "node-2fa";
import { generate } from "shortid";
import bcrypt from "bcrypt";
import response from "../../../assets/response";
import textPack from "../../../assets/textPack.json";
import authorize from "../../../assets/middlewares/authorize";
import User from "../../../assets/models/User";
import encryption from "../../../assets/crypto";

function verifyTfaState(uid) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const user = await User.findOne({ _id: uid });
			if (user.state.tfaActivated) {
				return reject(textPack.users.tfa.alreadyEnabled);
			}
			await User.updateOne(
				{ _id: uid },
				{
					state: {
						banned: user.state.banned,
						reason: user.state.reason,
						banDate: user.state.banDate,
						emailConfirmed: user.state.emailConfirmed,
						tfaActivated: true,
					},
				}
			);
			return resolve();
		} catch (err) {
			console.error(err);
			return reject(textPack.standards.responseError);
		}
	});
	return promise;
}

function generateRecoverCodes() {
	let recoverCodes = [];
	let round = 0;
	while (round <= 10) {
		round++;
		recoverCodes.push(generate());
	}
	return recoverCodes;
}

function encryptRecoverCodes(codes) {
	const promise = new Promise(async (resolve, reject) => {
		let encryptedCodes = [];
		let round = 0;
		while (round <= 10) {
			const code = codes[round];
			await bcrypt
				.hash(code, 12)
				.then((hash) => {
					encryptedCodes.push(hash);
				})
				.catch(() => {
					return reject(textPack.standards.responseError);
				});
			round++;
		}
		return resolve(encryptedCodes);
	});
	return promise;
}

function updateTfa(uid, recoverCodes, secret) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.updateOne(
				{ _id: uid },
				{ tfa: { recoverCodes, secret } }
			);
			return resolve();
		} catch (err) {
			console.error(err);
			return reject(textPack.users.tfa.couldntEnable);
		}
	});
	return promise;
}

router.get("/", authorize({ level: 0 }), (req, res) => {
	Promise.resolve([])
		.then(async (all) => {
			return await verifyTfaState(req.user.id)
				.then(() => {
					return all;
				})
				.catch((err) => {
					throw new Error(`400:${err}`);
				});
		})
		.then((all) => {
			const recoverCodes = generateRecoverCodes();
			all.push(recoverCodes);
			return all;
		})
		.then((all) => {
			const secret = generateSecret({
				name: "GepetoServices",
				account: req.user.username,
			});
			all.push(secret.secret);
			all.push(secret.qr);
			return all;
		})
		.then(async (all) => {
			return await encryptRecoverCodes(all[0])
				.then((encryptedRecoverCodes) => {
					all.push(encryptedRecoverCodes);
					return all;
				})
				.catch((err) => {
					throw new Error(`500:${err}`);
				});
		})
		.then((all) => {
			const encryptedSecret = encryption().enc(all[1]);
			if (encryptedSecret.error) {
				throw new Error(`500:${textPack.standards.responseError}`);
			}
			all.push({
				hash: encryptedSecret.hash,
				key: encryptedSecret.key,
				iv: encryptedSecret.iv,
			});
			return all;
		})
		.then(async (all) => {
			return await updateTfa(req.user.id, all[3], all[4])
				.then(() => {
					return res.json(
						response(false, textPack.users.tfa.enabled, {
							recoverCodes: all[0],
							qrcode: all[2],
							tfaCode: all[1],
						})
					);
				})
				.catch((err) => {
					throw new Error(`500:${err}`);
				});
		})
		.catch((err) => {
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
