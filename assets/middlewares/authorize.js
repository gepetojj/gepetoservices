require("dotenv").config();

const response = require("../response");
const textPack = require("../textPack.json");
const Token = require("../token");
const User = require("../models/User");

async function authorize(req, res, next) {
	const authorization = req.headers["authorization"];
	const app = req.headers["x-from-app"] || "noapp";
	const agent = req.headers["user-agent"];

	if (!authorization) {
		return res
			.status(401)
			.json(response(true, textPack.authorize.nullToken));
	}

	if (!["noapp", "lastpwd", "ppt"].includes(app)) {
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
		.verify(token)
		.then(async (decoded) => {
			if (decoded.app !== app) {
				return res
					.status(401)
					.json(response(true, textPack.authorize.invalidApp));
			}

			const user = await User.findOne({ _id: decoded.id });
			if (user) {
				if (user.state.banned) {
					return res
						.status(400)
						.json(response(true, textPack.users.login.bannedUser));
				}
				
				req.user = {
					id: user._id,
					username: user.username,
					email: user.email,
					avatar: user.avatar,
					state: user.state,
					registerDate: user.register.date,
					app: decoded.app,
				};
				next();
			} else {
				return res
					.status(401)
					.json(response(true, textPack.users.login.unknownUser));
			}
		})
		.catch((err) => {
			return res.status(err.code).json(response(true, err.message));
		});
}

module.exports = authorize;
