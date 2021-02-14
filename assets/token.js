require("dotenv").config();
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const shortid = require("shortid");

const redis = require("./redis");
const textPack = require("./textPack.json");

moment().locale("pt-br");
moment().tz("America/Maceio");

function token() {
	function create(params, expiresIn = "1d") {
		const tokenId = `${moment().valueOf()}:${shortid.generate()}`;

		try {
			const token = jwt.sign(
				{
					...params,
					tokenId,
					generatedAt: moment().valueOf(),
				},
				process.env.JWT_SECRET,
				{ expiresIn }
			);
			const redisOperation = redis.set(tokenId, "true");
			if (redisOperation.error) {
				return { error: true, message: redisOperation.error };
			}
			return { error: false, token };
		} catch (err) {
			console.error(err);
			return { error: true, message: err };
		}
	}

	async function verify(token) {
		const promise = new Promise((resolve, reject) => {
			jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
				if (err) {
					reject({
						message: textPack.authorize.invalidToken,
						code: 500,
					});
				}

				redis.get(decoded.tokenId, (err, data) => {
					if (err) {
						reject({
							message: textPack.authorize.couldntValidateToken,
							code: 500,
						});
					}

					if (data === null || data !== "true") {
						reject({
							message: textPack.authorize.invalidToken,
							code: 401,
						});
					}

					resolve(decoded);
				});
			});
		});
		return promise;
	}

	async function revoke(tokenId) {
		const promise = new Promise((resolve, reject) => {
			redis.set(tokenId, "false", (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		});
		return promise;
	}

	return { create, verify, revoke };
}

module.exports = token;
