require("dotenv").config();
const express = require("express");
const router = express.Router();

const response = require("../../assets/response");
const textPack = require("../../assets/textPack.json");
const User = require("../../assets/models/User");
const Token = require("../../assets/token");

const Performance = require("../../assets/tests/performance");

async function getCurrentUserState(id) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const userState = await User.findOne({ _id: id });
			if (userState) {
				resolve(userState.state);
			} else {
				reject("Usuário inexistente.");
			}
		} catch (err) {
			console.error(err);
			reject(err.message);
		}
	});
	return promise;
}

async function changeUserState(id, newState) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.updateOne({ _id: id }, { state: { ...newState } });
			resolve();
		} catch (err) {
			console.error(err);
			reject(err.message);
		}
	});
	return promise;
}

router.get("/", async (req, res) => {
	const performanceLog = new Performance("/users/confirm");
	let { t } = req.query;

	if (!t) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.authorize.nullToken));
	}

	t = decodeURIComponent(t);

	Promise.resolve([])
		.then(async (all) => {
			return await Token()
				.verify(t)
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

							await changeUserState(all[0].id, {
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

module.exports = router;
