require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const ejs = require("ejs");

const response = require("../../assets/response");
const API = require("../../assets/api");
const validator = require("../../assets/validator");
const textPack = require("../../assets/textPack.json");
const User = require("../../assets/models/User");
const Token = require("../../assets/Token");

const Performance = require("../../assets/tests/performance");

async function verifyUsernameAndEmail(username, email) {
	try {
		const usernameVerification = await User.find({ username });
		const emailVerification = await User.find({ email });

		if (
			usernameVerification.length === 0 &&
			emailVerification.length === 0
		) {
			return { error: false };
		} else {
			return {
				error: true,
				message: textPack.users.register.userOrEmailAlreadyRegistered,
				code: 400,
			};
		}
	} catch (err) {
		console.error(err);
		return { error: true, message: err, code: 500 };
	}
}

async function encryptPassword(password) {
	try {
		const hash = await bcrypt.hash(password, 12);
		return { error: false, hash };
	} catch (err) {
		console.error(err);
		return { error: true, message: err };
	}
}

async function generateConfirmationLink(id) {
	const token = Token().create({
		id,
		scope: "confirmEmail",
		newState: true,
	});
	if (token.error) {
		return { error: true };
	}
	return { error: false, token: encodeURIComponent(token.token) };
}

async function sendMailConfirmation(username, link, target) {
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
			`${process.cwd()}/assets/templates/emailConfirmation.ejs`,
			{ username, link },
			(err, html) => {
				if (err) {
					console.error(err);
					return { error: true, message: err };
				}

				renderedHtml = html;
			}
		);

		const { err } = await transporter.sendMail({
			from: `GepetoServices <${process.env.MAIL_USER}>`,
			to: target,
			subject: "Confirmação de conta do GepetoServices",
			html: renderedHtml,
		});
		if (err) {
			console.error(err);
			return { error: true, message: err };
		}
		return { error: false };
	} catch (err) {
		console.error(err);
		return { error: true, message: err };
	}
}

async function deleteUser(id) {
	try {
		await User.deleteOne({ _id: id });
		return { error: false };
	} catch (err) {
		console.error(err);
		return { error: true, message: err };
	}
}

router.post("/", async (req, res) => {
	const performanceLog = new Performance("/users/register");
	let { username, email, password, passwordConfirm } = req.body;
	const app = req.headers["x-from-app"] || "noapp";
	const agent = req.headers["user-agent"];
	const ip = req.ip;

	if (!username || !email || !password || !passwordConfirm) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.nullFields));
	}

	if (!agent || !ip) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.standards.responseError));
	}

	if (!["noapp", "lastpwd", "ppt"].includes(app)) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.authorize.invalidApp));
	}

	username = username.toLowerCase();

	const validation = validator([
		{ type: "username", value: username },
		{ type: "email", value: email },
		{ type: "password", value: password },
		{ type: "password", value: passwordConfirm },
		{ type: "equals", value: password, equal: passwordConfirm },
	]);

	if (validation.length > 0) {
		performanceLog.finish();
		return res.status(400).json(
			response(true, textPack.standards.responseError, {
				errors: validation,
			})
		);
	}

	performanceLog.watchpoint("verifyUsernameAndEmail");
	const verification = await verifyUsernameAndEmail(username, email);
	if (verification.error) {
		performanceLog.watchpointEnd("verifyUsernameAndEmail");
		performanceLog.finish();
		return res.status(verification.code).json(
			response(true, textPack.standards.responseError, {
				errors: verification.message,
			})
		);
	}
	performanceLog.watchpointEnd("verifyUsernameAndEmail");

	performanceLog.watchpoint("encryptPassword");
	const hashedPassword = await encryptPassword(password);
	if (hashedPassword.error) {
		performanceLog.watchpointEnd("encryptPassword");
		performanceLog.finish();
		return res
			.status(500)
			.json(response(true, textPack.standards.responseError));
	}
	performanceLog.watchpointEnd("encryptPassword");

	const newUser = new User({
		username,
		email,
		password: hashedPassword.hash,
		register: {
			agent,
			ip,
		},
		apps: [app],
	});

	newUser.save(async (err, user) => {
		if (err) {
			console.error(err);
			performanceLog.finish();
			return res
				.status(500)
				.json(response(true, textPack.users.register.userNotCreated));
		}

		performanceLog.watchpoint("generateConfirmationLink");
		const confirmationLink = await generateConfirmationLink(user._id);

		if (confirmationLink.error) {
			performanceLog.watchpointEnd("generateConfirmationLink");
			performanceLog.watchpoint("deleteUser");
			const failSafe = await deleteUser(user._id);
			if (failSafe.error) {
				performanceLog.watchpointEnd("deleteUser");
				performanceLog.finish();
				return res
					.status(500)
					.json(
						response(true, textPack.standards.responseCriticError)
					);
			} else {
				performanceLog.watchpointEnd("deleteUser");
				performanceLog.finish();
				return res
					.status(500)
					.json(
						response(true, textPack.users.register.userNotCreated)
					);
			}
		} else {
			performanceLog.watchpointEnd("generateConfirmationLink");
			performanceLog.watchpoint("sendMailConfirmation");
			const emailConfirmation = await sendMailConfirmation(
				username,
				API(`/users/confirm?t=${confirmationLink.token}`),
				email
			);

			if (!emailConfirmation.error) {
				performanceLog.watchpointEnd("sendMailConfirmation");
				performanceLog.finish();
				return res.json(
					response(false, textPack.users.register.userCreated)
				);
			} else {
				performanceLog.watchpointEnd("sendMailConfirmation");
				performanceLog.watchpoint("deleteUser");
				const failSafe = await deleteUser(user._id);
				if (failSafe.error) {
					performanceLog.watchpointEnd("deleteUser");
					performanceLog.finish();
					return res
						.status(500)
						.json(
							response(
								true,
								textPack.standards.responseCriticError
							)
						);
				} else {
					performanceLog.watchpointEnd("deleteUser");
					performanceLog.finish();
					return res
						.status(500)
						.json(
							response(
								true,
								textPack.users.register.userNotCreated
							)
						);
				}
			}
		}
	});
});

module.exports = router;
