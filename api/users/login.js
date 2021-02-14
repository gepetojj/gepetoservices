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
	try {
		const userQuery = await User.findOne({ username }, "+password");
		return userQuery;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function comparePasswords(text, hash) {
	try {
		const same = await bcrypt.compare(text, hash);
		return same;
	} catch (err) {
		console.error(err);
		return err;
	}
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
	try {
		await User.updateOne(
			{ _id: id },
			{ lastLogin: { date: moment().valueOf(), agent, ip, app, token } }
		);
		return false;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function verifyAndUpdateUserApps(user, app) {
	try {
		if (!user.apps.includes(app)) {
			await User.updateOne(
				{ _id: user.id },
				{ apps: [...user.apps, app] }
			);
			return false;
		} else {
			return false;
		}
	} catch (err) {
		console.error(err);
		return err;
	}
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

	performanceLog.watchpoint("findUser");
	findUser(username)
		.then((userData) => {
			performanceLog.watchpointEnd("findUser");
			if (userData) {
				if (!userData.state.emailConfirmed) {
					performanceLog.finish();
					return res
						.status(400)
						.json(
							response(
								true,
								textPack.users.login.emailNotConfirmed
							)
						);
				}

				if (userData.state.banned) {
					performanceLog.finish();
					return res
						.status(400)
						.json(response(true, textPack.users.login.bannedUser));
				}

				performanceLog.watchpoint("comparePasswords");
				comparePasswords(password, userData.password)
					.then((passwordMatches) => {
						performanceLog.watchpointEnd("comparePasswords");
						if (!passwordMatches) {
							performanceLog.finish();
							return res
								.status(400)
								.json(
									response(
										true,
										textPack.users.login.wrongPassword
									)
								);
						}

						revokeLastLoginToken(userData._id)
							.then(() => {
								const token = Token().create({
									id: userData._id,
									app,
								});
								if (token.error) {
									performanceLog.finish();
									return res
										.status(500)
										.json(
											response(
												true,
												textPack.standards.responseError
											)
										);
								}

								performanceLog.watchpoint(
									"updateUserLastLogin"
								);
								updateUserLastLogin({
									id: userData._id,
									agent,
									ip,
									app,
									token: token.token,
								})
									.then(() => {
										performanceLog.watchpointEnd(
											"updateUserLastLogin"
										);
										performanceLog.watchpoint(
											"verifyAndUpdateUserApps"
										);
										verifyAndUpdateUserApps(userData, app)
											.then(() => {
												performanceLog.watchpointEnd(
													"verifyAndUpdateUserApps"
												);

												performanceLog.finish();
												return res.json(
													response(
														false,
														textPack.users.login
															.logged,
														{
															token: token.token,
														}
													)
												);
											})
											.catch(() => {
												performanceLog.watchpoint(
													"verifyAndUpdateUserApps"
												);

												performanceLog.finish();
												return res
													.status(500)
													.json(
														response(
															true,
															textPack.standards
																.responseCriticError
														)
													);
											});
									})
									.catch(() => {
										performanceLog.watchpointEnd(
											"updateUserLastLogin"
										);
										performanceLog.finish();
										return res
											.status(500)
											.json(
												response(
													true,
													textPack.standards
														.responseCriticError
												)
											);
									});
							})
							.catch((err) => {
								return res
									.status(500)
									.json(response(true, err.message));
							});
					})
					.catch(() => {
						performanceLog.watchpointEnd("comparePasswords");
						performanceLog.finish();
						return res
							.status(400)
							.json(
								response(true, textPack.standards.responseError)
							);
					});
			} else {
				performanceLog.watchpointEnd("findUser");
				performanceLog.finish();
				return res
					.status(400)
					.json(response(true, textPack.users.login.wrongUsername));
			}
		})
		.catch(() => {
			performanceLog.finish();
			return res
				.status(500)
				.json(response(true, textPack.users.login.unknownUser));
		});
});

module.exports = router;
