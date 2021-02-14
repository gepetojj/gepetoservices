require("dotenv").config();

const response = require("../response");
const textPack = require("../textPack.json");
const Token = require("../token");

async function authorize(req, res, next) {
	const authorization = req.headers["authorization"];
	const app = req.headers["x-from-app"] || "noapp";

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
		.then((decoded) => {
			if (decoded.app !== app) {
				return res
					.status(401)
					.json(response(true, textPack.authorize.invalidApp));
			}

			req.user = decoded;
			next();
		})
		.catch((err) => {
			return res.status(err.code).json(response(true, err.message));
		});
}

module.exports = authorize;
