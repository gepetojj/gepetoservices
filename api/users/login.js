require("dotenv").config();
const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const bcrypt = require("bcrypt");

const response = require("../../assets/response");
const textPack = require("../../assets/textPack.json");
const User = require("../../assets/models/User");
const Token = require("../../assets/token");

const Performance = require("../../assets/tests/performance");

async function findUser(username) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const userQuery = await User.findOne({ username }, "+password");
			resolve(userQuery);
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

async function comparePasswords(text, hash) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const same = await bcrypt.compare(text, hash);
			resolve(same);
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

async function revokeLastLoginToken(id) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const data = await User.findOne({ _id: id });
			if (data.lastLogin.token) {
				Token()
					.revoke(data.lastLogin.token)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
			} else {
				resolve();
			}
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

async function updateUserLastLogin({ id, agent, ip, app, token }) {
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
			resolve();
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

async function verifyAndUpdateUserApps(user, app) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			if (!user.apps.includes(app)) {
				await User.updateOne(
					{ _id: user.id },
					{ apps: [...user.apps, app] }
				);
				resolve();
			} else {
				resolve();
			}
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

router.post("/", async (req, res) => {
	const performanceLog = new Performance("/users/login");
	const { username, password } = req.body;
	const app = req.headers["x-from-app"] || "noapp";
	const agent = req.headers["user-agent"];
	const ip = req.ip;

	if (!username || !password) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullFields));
	}

	if (!["noapp", "lastpwd", "ppt"].includes(app)) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.authorize.invalidApp));
	}

	Promise.resolve([])
		.then(async (all) => {
			return await findUser(username)
				.then((data) => {
					if (data) {
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
					} else {
						throw new Error(
							`401:${textPack.users.login.wrongUsername}`
						);
					}
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
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			return await revokeLastLoginToken(all[0]._id)
				.then(() => {
					const token = Token().create({
						id: all[0]._id,
						username: all[0].username,
						email: all[0].email,
						avatar: all[0].avatar,
						state: all[0].state,
						registerDate: all[0].register.date,
						app,
					});
					if (token.error) {
						throw new Error(
							`500:${textPack.standards.responseError}`
						);
					}
					all.push(token.token);
					return all;
				})
				.catch(() => {
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			return await updateUserLastLogin({
				id: all[0]._id,
				agent,
				ip,
				app,
				token: all[1],
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
					performanceLog.finish();
					return res.json(
						response(false, textPack.users.login.logged, {
							token: all[1],
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

module.exports = router;
