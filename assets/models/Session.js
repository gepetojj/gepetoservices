require("dotenv");
import validator from "validator";
import moment from "moment-timezone";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";

import firebase from "../firebase";
import textPack from "../textPack.json";

moment().locale("pt-br");
moment().tz("America/Maceio");

const Sessions = firebase.firestore().collection("sessions");

function Session() {
	function model({
		uid,
		username,
		agent,
		ip,
		tfaValidated,
		app,
		refreshToken,
	}) {
		if (validator.isEmpty(username)) {
			return { error: true, message: textPack.validator.username.null };
		}
		if (validator.isEmpty(agent)) {
			return { error: true, message: textPack.validator.session.agent };
		}
		if (!validator.isIP(ip, 4)) {
			return { error: true, message: textPack.validator.session.ip };
		}
		if (!textPack.authorize.apps.includes(app)) {
			return { error: true, message: textPack.validator.session.app };
		}
		if (!validator.isJWT(refreshToken)) {
			return { error: true, message: textPack.validator.session.jwt };
		}

		return {
			error: false,
			session: {
				uid: uid.toString(),
				username,
				agent,
				ip,
				tfaValidated,
				refreshToken,
				sessionId: v4(),
				loginDate: moment().valueOf(),
				validUntil: moment().add(1, "day").valueOf(),
			},
		};
	}

	function create(session) {
		const promise = new Promise((resolve, reject) => {
			Sessions.doc(session.sessionId)
				.create(session)
				.then(() => {
					return resolve();
				})
				.catch((err) => {
					logger.error(err.message);
					return reject(err);
				});
		});
		return promise;
	}

	function verify(refreshToken) {
		const promise = new Promise((resolve, reject) => {
			Sessions.where("refreshToken", "==", refreshToken)
				.get()
				.then((query) => {
					if (query.empty) {
						return reject({
							message: textPack.authorize.invalidToken,
							code: 401,
						});
					}
					query.forEach((doc) => {
						if (doc.exists) {
							jwt.verify(
								refreshToken,
								process.env.REFRESH_TOKEN_SECRET,
								(err, decoded) => {
									if (err) {
										if (err.name === "TokenExpiredError") {
											revoke(doc.data().sessionId)
												.then(() => {
													return reject({
														message:
															textPack.authorize
																.expiredToken,
														code: 401,
													});
												})
												.catch((err) => {
													logger.error(err.message);
													return reject({
														message:
															textPack.authorize
																.expiredToken,
														code: 500,
													});
												});
										}
										return reject({
											message:
												textPack.authorize.invalidToken,
											code: 401,
										});
									}
									return resolve(decoded);
								}
							);
						}
						return reject({
							message: textPack.authorize.invalidToken,
							code: 401,
						});
					});
				});
		});
		return promise;
	}

	function revoke(sessionId) {
		const promise = new Promise((resolve, reject) => {
			Sessions.doc(sessionId)
				.delete()
				.then(() => {
					return resolve();
				})
				.catch((err) => {
					logger.error(err.message);
					return reject(err);
				});
		});
		return promise;
	}

	return { model, create, verify, revoke };
}

export default Session;
