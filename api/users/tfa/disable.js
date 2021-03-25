import { Router } from "express";
const router = Router();
import bcrypt from "bcrypt";

import response from "../../../assets/response";
import textPack from "../../../assets/textPack.json";
import authorize from "../../../assets/middlewares/authorize";
import User from "../../../assets/models/User";
import logger from "../../../assets/logger";

function verifyTfaState(uid) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const user = await User.findOne({ _id: uid });
			if (!user.state.tfaActivated) {
				return reject(textPack.users.tfa.notEnabled);
			}
			return resolve(user);
		} catch (err) {
			logger.error(err.message);
			return reject(textPack.standards.responseError);
		}
	});
	return promise;
}

function deleteTfaData(uid, state) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.updateOne(
				{ _id: uid },
				{
					tfa: {
						recoverCodes: [],
						secret: {},
					},
					state: {
						tfaActivated: false,
						banned: state.banned,
						emailConfirmed: state.emailConfirmed,
						reason: state.reason,
						banDate: state.banDate,
					},
				}
			);
			return resolve();
		} catch (err) {
			logger.error(err.message);
			return reject(textPack.standards.responseError);
		}
	});
	return promise;
}

router.get("/", authorize({ level: 0 }), (req, res) => {
	const { code: recoverCode } = req.query;

	if (!recoverCode) {
		return res
			.status(400)
			.json(response(true, textPack.standards.nullField));
	}

	Promise.resolve([])
		.then(async (all) => {
			// Verificar se o 2fa está habilitado.
			return await verifyTfaState(req.user.id)
				.then((user) => {
					all.push(user);
					return all;
				})
				.catch((err) => {
					throw new Error(`400:${err}`);
				});
		})
		.then((all) => {
			// Pegar os recover codes do usuario.
			const recoverCodes = all[0].tfa.recoverCodes;
			if (recoverCodes) {
				all.push(recoverCodes);
				return all;
			}
			throw new Error(`500:${textPack.users.tfa.dataNotFound}`);
		})
		.then((all) => {
			// Comparar o recover code passado com os coletados do banco de dados.
			const canReturn = all[1].some((code) => {
				const same = bcrypt.compareSync(recoverCode, code);
				if (same) {
					return true;
				}
			});
			if (canReturn) {
				return all;
			}
			throw new Error(`400:${textPack.users.tfa.invalidRecoverCode}`);
		})
		.then(async (all) => {
			// Mudar estado do 2fa e apagar dados.
			return await deleteTfaData(req.user.id, all[0].state)
				.then(() => {
					return res.json(
						response(false, textPack.users.tfa.disabled)
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
