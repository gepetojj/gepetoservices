require("dotenv").config();
import { Router } from "express";
const router = Router();
import { verifyToken } from "node-2fa";

import response from "../../../assets/response";
import textPack from "../../../assets/textPack.json";
import authorize from "../../../assets/middlewares/authorize";
import User from "../../../assets/models/User";
import encryption from "../../../assets/crypto";
import logger from "../../../assets/logger";

function verifyTfaState(uid) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const user = await User.findOne({ _id: uid });
			if (!user.state.tfaActivated) {
				return reject(textPack.users.tfa.notEnabled);
			}
			return resolve(user.tfa.secret);
		} catch (err) {
			logger.error(err.message);
			return reject(textPack.standards.responseError);
		}
	});
	return promise;
}

router.get("/", authorize({ level: 0 }), (req, res) => {
	const { code } = req.query;

	if (!code) {
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	Promise.resolve([])
		.then(async (all) => {
			return await verifyTfaState(req.user.id)
				.then((secret) => {
					all.push(secret);
					return all;
				})
				.catch((err) => {
					throw new Error(`400:${err}`);
				});
		})
		.then((all) => {
			const decryptedSecret = encryption().dec(all[0]);
			if (decryptedSecret.error) {
				throw new Error(`500:${textPack.standards.responseError}`);
			}
			all.push(decryptedSecret.result);
			return all;
		})
		.then((all) => {
			const verified = verifyToken(all[1], code);
			if (verified && verified.delta === 0) {
				return res.json(response(false, textPack.users.tfa.verified));
			}
			return res
				.status(401)
				.json(response(true, textPack.users.tfa.notVerified));
		})
		.catch((err) => {
			logger.error(err.message);
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
