require("dotenv").config();
const express = require("express");
const router = express.Router();
const xssFilters = require("xss-filters");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const ejs = require("ejs");

const authorize = require("../../../assets/middlewares/authorize");
const response = require("../../../assets/response");
const validator = require("../../../assets/validator");
const textPack = require("../../../assets/textPack.json");
const User = require("../../../assets/models/User");
const API = require("../../../assets/api");
const Token = require("../../../assets/token");

const Performance = require("../../../assets/tests/performance");

function verifyPassword(uid, password) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const user = await User.findOne({ _id: uid }, "+password");
			await bcrypt
				.compare(password, user.password)
				.then((same) => {
					resolve(same);
				})
				.catch((err) => {
					console.error(err);
					reject(err);
				});
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

function encryptPassword(password) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const hash = await bcrypt.hash(password, 12);
			resolve(hash);
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

function generateConfirmLink(uid, password) {
	const token = Token().create({
		id: uid,
		scope: "changePassword",
		newState: password,
	});
	if (token.error) {
		return { error: true };
	}
	const link = API(`/users/confirm?t=${encodeURIComponent(token.token)}`);
	return { error: false, link };
}

function sendMailConfirmation(username, link, target) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const transporter = nodemailer.createTransport({
				host: "smtp.gmail.com",
				port: 465,
				secure: true,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASS,
				},
			});

			let renderedHtml;

			ejs.renderFile(
				`${process.cwd()}/assets/templates/changePassword.ejs`,
				{ username, link },
				(err, html) => {
					if (err) {
						console.error(err);
						reject(err);
					}

					renderedHtml = html;
				}
			);

			const { err } = await transporter.sendMail({
				from: `GepetoServices <${process.env.MAIL_USER}>`,
				to: target,
				subject: "Mudança de senha da conta do GepetoServices",
				html: renderedHtml,
			});
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve();
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

router.put("/", authorize, (req, res) => {
	const performanceLog = new Performance(req.baseUrl);
	let { password, newPassword, newPasswordConfirm } = req.body;

	if (!password || !newPassword || !newPasswordConfirm) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullFields));
	}

	password = xssFilters.uriQueryInHTMLData(password);
	newPassword = xssFilters.uriQueryInHTMLData(newPassword);
	newPasswordConfirm = xssFilters.uriQueryInHTMLData(newPasswordConfirm);

	const validation = validator([
		{ type: "password", value: password },
		{ type: "password", value: newPassword },
		{ type: "password", value: newPasswordConfirm },
		{ type: "equals", value: newPassword, equal: newPasswordConfirm },
	]);

	if (validation.length > 0) {
		performanceLog.finish();
		return res.status(400).json(
			response(true, textPack.standards.responseError, {
				errors: validation,
			})
		);
	}

	Promise.resolve([])
		.then(async (all) => {
			return await verifyPassword(req.user.id, password)
				.then((same) => {
					if (same) {
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
			return await encryptPassword(newPassword)
				.then((hash) => {
					all.push(hash);
					return all;
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.standards.responseCriticError}`
					);
				});
		})
		.then((all) => {
			const link = generateConfirmLink(req.user.id, all[0]);
			if (!link.error) {
				all.push(link.link);
				return all;
			} else {
				throw new Error(`500:${textPack.standards.responseError}`);
			}
		})
		.then(async (all) => {
			return await sendMailConfirmation(
				req.user.username,
				all[1],
				req.user.email
			)
				.then(() => {
					performanceLog.finish();
					return res.json(
						response(false, "Confirme esse pedido no seu email.")
					);
				})
				.catch(() => {
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.catch((err) => {
			performanceLog.finish();
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

module.exports = router;
