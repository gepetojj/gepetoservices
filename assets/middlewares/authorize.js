require("dotenv").config();
import cache from "memory-cache";

import response from "../response";
import textPack from "../textPack.json";
import Token from "../token";
import User from "../models/User";
import cacheController from "../cacheController";

function authorize({ level }) {
	return async (req, res, next) => {
		const authorization = req.headers["authorization"];
		const refreshToken = req.cookies["refreshToken"];
		const app = req.headers["x-from-app"] || "noapp";
		const agent = req.headers["user-agent"];

		if (!authorization || !refreshToken) {
			return res
				.status(401)
				.json(response(true, textPack.authorize.nullToken));
		}

		if (!textPack.authorize.apps.includes(app)) {
			return res
				.status(401)
				.json(response(true, textPack.authorize.invalidApp));
		}

		const [method, token] = authorization.split(" ");

		if (method !== "Bearer" || !token) {
			return res
				.status(401)
				.json(response(true, textPack.authorize.invalidToken));
		}

		await Token()
			.verify(token, "access")
			.then(async () => {
				return await Token()
					.verify(refreshToken, "refresh")
					.then(async (decoded) => {
						if (decoded.app !== app) {
							return res
								.status(401)
								.json(
									response(
										true,
										textPack.authorize.invalidApp
									)
								);
						}

						if (decoded.level < level) {
							return res
								.status(401)
								.json(
									response(
										true,
										"Você não tem permissões necessárias para isso."
									)
								);
						}

						const cachedData = cacheController(decoded.id);
						if (cachedData.cached) {
							req.user = cachedData.data;
							return next();
						} else {
							const user = await User.findOne({
								_id: decoded.id,
							});
							if (user) {
								if (user.state.banned) {
									if (user.state.reason) {
										return res.status(400).json(
											response(
												true,
												textPack.users.login.bannedUser,
												{
													reason: user.state.reason,
												}
											)
										);
									}
									return res
										.status(400)
										.json(
											response(
												true,
												textPack.users.login.bannedUser
											)
										);
								}

								if (user.level < level) {
									return res
										.status(401)
										.json(
											response(
												true,
												"Você não tem permissões necessárias para isso."
											)
										);
								}

								req.user = {
									id: user._id,
									username: user.username,
									email: user.email,
									level: user.level,
									avatar: user.avatar,
									state: user.state,
									registerDate: user.register.date,
									app: decoded.app,
									cachedData: false,
								};
								cache.put(decoded.id, req.user, 300000); // 5 minutos em ms
								return next();
							} else {
								return res
									.status(401)
									.json(
										response(
											true,
											textPack.users.login.unknownUser
										)
									);
							}
						}
					})
					.catch((err) => {
						return res
							.status(err.code)
							.json(response(true, err.message));
					});
			})
			.catch((err) => {
				if (err.errCode) {
					// Futuramente já fazer o refresh neste middleware.
					return res
						.status(err.code)
						.json(response(true, err.message));
				}
				return res.status(err.code).json(response(true, err.message));
			});
	};
}

export default authorize;
