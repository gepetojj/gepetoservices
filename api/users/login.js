require("dotenv").config();
import { Router } from "express";
const router = Router();
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import xssFilters from "xss-filters";

import response from "../../assets/response";
import textPack from "../../assets/textPack.json";
import User from "../../assets/models/User";
import Token from "../../assets/token";
import Session from "../../assets/models/Session";
import Performance from "../../assets/tests/performance";

moment().locale("pt-br");
moment().tz("America/Maceio");

function findUser(username) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const userQuery = await User.findOne({ username }, "+password");
			return resolve(userQuery);
		} catch (err) {
			console.error(err);
			return reject(err);
		}
	});
	return promise;
}

function verifyTfaState(uid) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const userData = await User.findOne({ _id: uid });
			if (userData.state.tfaActivated) {
				return resolve(true);
			} else {
				return resolve(false);
			}
		} catch (err) {
			return reject(err);
		}
	});
	return promise;
}

function comparePasswords(text, hash) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const same = await bcrypt.compare(text, hash);
			return resolve(same);
		} catch (err) {
			console.error(err);
			return reject(err);
		}
	});
	return promise;
}

function updateUserLastLogin({ id, agent, ip, app, token }) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.updateOne(
				{ _id: id },
				{
					lastLogin: {
						date: moment().valueOf(),
						agent,
						ip,
						app,
						token,
					},
				}
			);
			return resolve();
		} catch (err) {
			console.error(err);
			return reject(err);
		}
	});
	return promise;
}

function verifyAndUpdateUserApps(user, app) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			if (!user.apps.includes(app)) {
				await User.updateOne(
					{ _id: user.id },
					{ apps: [...user.apps, app] }
				);
				return resolve();
			} else {
				return resolve();
			}
		} catch (err) {
			console.error(err);
			return reject(err);
		}
	});
	return promise;
}

router.post("/", async (req, res) => {
	const performanceLog = new Performance(req.baseUrl);
	let { username, password } = req.body;
	const app = req.headers["x-from-app"] || "noapp";
	const agent = req.headers["user-agent"];
	const ip = req.headers["x-ip"];

	if (!username || !password) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullFields));
	}

	if (!textPack.authorize.apps.includes(app)) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.authorize.invalidApp));
	}

	username = xssFilters.uriQueryInHTMLData(username);

	Promise.resolve([])
		.then(async (all) => {
			return await findUser(username)
				.then((data) => {
					if (!data.state.emailConfirmed) {
						throw new Error(
							`401:${textPack.users.login.emailNotConfirmed}`
						);
					}

					if (data.state.banned) {
						throw new Error(
							`400:${textPack.users.login.bannedUser}`
						);
					}
					all.push(data);
					return all;
				})
				.catch(() => {
					throw new Error(`500:${textPack.users.login.unknownUser}`);
				});
		})
		.then(async (all) => {
			return await comparePasswords(password, all[0].password)
				.then((matches) => {
					if (matches) {
						return all;
					} else {
						throw new Error(
							`401:${textPack.users.login.wrongPassword}`
						);
					}
				})
				.catch(() => {
					throw new Error(
						`401:${textPack.users.login.wrongPassword}`
					);
				});
		})
		.then(async (all) => {
			const accessToken = Token().create(
				{
					id: all[0]._id,
					app,
				},
				"access"
			);
			const refreshToken = Token().create(
				{
					id: all[0]._id,
					app,
				},
				"refresh"
			);
			if (accessToken.error || refreshToken.error) {
				throw new Error(`500:${textPack.standards.responseError}`);
			}
			all.push(accessToken.token);
			all.push(refreshToken.token);
			return all;
		})
		.then(async (all) => {
			const refreshToken = Session().model({
				uid: all[0]._id,
				username: all[0].username,
				agent,
				ip,
				tfaValidated: false,
				app,
				refreshToken: all[2],
			});
			if (refreshToken.error) {
				throw new Error(`400:${refreshToken.message}`);
			}
			return await Session()
				.create(refreshToken.session)
				.then(() => {
					return all;
				})
				.catch((err) => {
					console.error(err);
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			return await updateUserLastLogin({
				id: all[0]._id,
				agent,
				ip,
				app,
				token: all[2],
			})
				.then(() => {
					return all;
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.standards.responseCriticError}`
					);
				});
		})
		.then(async (all) => {
			return await verifyAndUpdateUserApps(all[0], app)
				.then(() => {
					req.session.refreshToken = all[2];
					performanceLog.finish();
					return res.json(
						response(false, textPack.users.login.logged, {
							accessToken: all[1],
						})
					);
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.standards.responseCriticError}`
					);
				});
		})
		.catch((err) => {
			performanceLog.finish();
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
