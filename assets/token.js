require("dotenv").config();
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import { generate } from 'shortid';
import redis from './redis';
import textPack from './textPack.json';

moment().locale("pt-br");
moment().tz("America/Maceio");

function Token() {
	/**
	 * Cria um token JWT, podendo ser um 'access_token' ou 'refresh_token'
	 * @param {Object} params Parâmetros a serem escritos no token JWT.
	 * @param {String} type Tipo do token, 'access' ou 'refresh'.
	 * @returns {Object} Retorna um objeto, tendo a key 'error' em todos os casos,
	 * 'token' caso 'error' seja false, e 'message' caso 'error' seja true.
	 */
	function create(params, type = "access") {
		const tokenId = `${moment().valueOf()}:${generate()}`;

		if (type === "access") {
			try {
				const token = jwt.sign(
					{
						...params,
						tokenId,
						type,
					},
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "15m" }
				);
				return { error: false, token };
			} catch (err) {
				console.error(err);
				return { error: true, message: err };
			}
		} else {
			try {
				const token = jwt.sign(
					{
						...params,
						tokenId,
						type,
					},
					process.env.REFRESH_TOKEN_SECRET,
					{ expiresIn: "1d" }
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
	}

	/**
	 * Verifica um token JWT.
	 * @param {String} token Token JWT.
	 * @param {String} type Tipo do token, 'access' ou 'refresh'.
	 * @returns {Promise<Object>} Retorna um objeto em promise com os dados
	 * do token JWT passado. Caso o token seja do tipo 'refresh', verifica
	 * se está válido.
	 */
	async function verify(token, type = "access") {
		const promise = new Promise((resolve, reject) => {
			if (type === "access") {
				jwt.verify(
					token,
					process.env.ACCESS_TOKEN_SECRET,
					(err, decoded) => {
						if (err) {
							if (err.name === "TokenExpiredError") {
								return reject({
									message:
										"Seu token de acesso está expirado, use o seu token de atualização para obter outro.",
									code: 401,
									errCode: "ACCESS_TOKEN_EXPIRED",
								});
							} else {
								return reject({
									message: textPack.authorize.invalidToken,
									code: 401,
								});
							}
						}

						return resolve(decoded);
					}
				);
			} else {
				jwt.verify(
					token,
					process.env.REFRESH_TOKEN_SECRET,
					(err, decoded) => {
						if (err) {
							return reject({
								message: textPack.authorize.invalidToken,
								code: 401,
							});
						}

						redis.get(decoded.tokenId, (err, data) => {
							if (err) {
								return reject({
									message:
										textPack.authorize.couldntValidateToken,
									code: 500,
								});
							}

							if (data === null || data !== "true") {
								return reject({
									message: textPack.authorize.invalidToken,
									code: 401,
								});
							}

							return resolve(decoded);
						});
					}
				);
			}
		});
		return promise;
	}

	/**
	 * Invalida um token JWT pelo id.
	 * @param {String} tokenId Id do token.
	 * @returns {Promise} Retorna undefined caso nenhum erro ocorra, que significa
	 * que o token foi invalidado.
	 */
	async function revoke(tokenId) {
		const promise = new Promise((resolve, reject) => {
			redis.set(tokenId, "false", (err) => {
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});
		return promise;
	}

	return { create, verify, revoke };
}

export default Token;
