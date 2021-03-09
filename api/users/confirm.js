require("dotenv").config();
import { Router } from "express";
const router = Router();
import xssFilters from "xss-filters";
import response from "../../assets/response";
import textPack from "../../assets/textPack.json";
import User from "../../assets/models/User";
import Token from "../../assets/token";
import Performance from "../../assets/tests/performance";

function getCurrentUserState(id) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const userState = await User.findOne({ _id: id });
			if (userState) {
				return resolve(userState.state);
			} else {
				return reject("Usuário inexistente.");
			}
		} catch (err) {
			console.error(err);
			return reject(err.message);
		}
	});
	return promise;
}

function changeUserState(id, newState) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.updateOne({ _id: id }, { state: newState });
			return resolve();
		} catch (err) {
			console.error(err);
			return reject(err.message);
		}
	});
	return promise;
}

function changeUserData(id, newData) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.updateOne({ _id: id }, newData);
			return resolve();
		} catch (err) {
			console.error(err);
			return reject(err.message);
		}
	});
	return promise;
}

router.get("/", async (req, res) => {
	const performanceLog = new Performance(req.baseUrl);
	let { t } = req.query;

	if (!t) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.authorize.nullToken));
	}

	t = decodeURIComponent(t);
	t = xssFilters.uriQueryInHTMLData(t);

	Promise.resolve([])
		.then(async (all) => {
			return await Token()
				.verify(t, "refresh")
				.then((decoded) => {
					all.push(decoded);
					return all;
				})
				.catch((err) => {
					throw new Error(`${err.code}:${err.message}`);
				});
		})
		.then(async (all) => {
			return await Token()
				.revoke(all[0].tokenId)
				.then(() => {
					return all;
				})
				.catch(() => {
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			return await getCurrentUserState(all[0].id)
				.then(async (state) => {
					switch (all[0].scope) {
						case "confirmEmail":
							if (state.emailConfirmed === all[0].newState) {
								throw new Error(
									`400:${textPack.users.confirmEmail.emailAlreadyConfirmed}`
								);
							}

							return await changeUserState(all[0].id, {
								emailConfirmed: all[0].newState,
								banned: state.banned,
								reason: state.reason,
								banDate: state.banDate,
							})
								.then(() => {
									performanceLog.finish();
									return res.json(
										response(
											false,
											textPack.users.confirmEmail
												.emailConfirmed
										)
									);
								})
								.catch(() => {
									throw new Error(
										`500:${textPack.users.confirmEmail.couldNotConfirmEmail}`
									);
								});
						case "changePassword":
							return await changeUserData(all[0].id, {
								password: all[0].newState,
							})
								.then(() => {
									performanceLog.finish();
									return res.json(
										response(
											false,
											textPack.users.confirmEmail
												.emailConfirmed
										)
									);
								})
								.catch(() => {
									throw new Error(
										`500:${textPack.users.confirmEmail.couldNotConfirmEmail}`
									);
								});
					}
				})
				.catch((err) => {
					throw new Error(`500:${err}`);
				});
		})
		.catch((err) => {
			performanceLog.finish();
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
