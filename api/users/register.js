import { Router } from "express";
const router = Router();
import bcrypt from "bcrypt";
import xssFilters from "xss-filters";
import response from "../../assets/response";
import API from "../../assets/api";
import validator from "../../assets/validator";
import textPack from "../../assets/textPack.json";
import User from "../../assets/models/User";
import Token from "../../assets/token";
import mailer from "../../assets/mailer";
import Performance from "../../assets/tests/performance";

async function verifyUsernameAndEmail(username, email) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const usernameVerification = await User.find({ username });
			const emailVerification = await User.find({ email });

			if (
				usernameVerification.length === 0 &&
				emailVerification.length === 0
			) {
				resolve();
			} else {
				reject(textPack.users.register.userOrEmailAlreadyRegistered);
			}
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

function generateConfirmationLink(id) {
	const token = Token().create(
		{
			id,
			scope: "confirmEmail",
			newState: true,
		},
		"refresh"
	);
	if (token.error) {
		return { error: true };
	}
	return { error: false, token: encodeURIComponent(token.token) };
}

async function deleteUser(id) {
	const promise = new Promise(async (resolve, reject) => {
		try {
			await User.deleteOne({ _id: id });
			resolve();
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	return promise;
}

router.post("/", async (req, res) => {
	const performanceLog = new Performance(req.baseUrl);
	let { username, email, password, passwordConfirm } = req.body;
	const app = req.headers["x-from-app"] || "noapp";
	const agent = req.headers["user-agent"];
	const ip = req.headers["x-ip"];

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
	username = xssFilters.uriQueryInHTMLData(username);
	email = xssFilters.uriQueryInHTMLData(email);

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

	Promise.resolve([])
		.then(async (all) => {
			return await verifyUsernameAndEmail(username, email)
				.then(() => {
					return all;
				})
				.catch((err) => {
					if (
						err ===
						textPack.users.register.userOrEmailAlreadyRegistered
					) {
						throw new Error(`400:${err}`);
					}
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			return await bcrypt
				.hash(password, 12)
				.then((hash) => {
					all.push(hash);
					return all;
				})
				.catch(() => {
					throw new Error(`500:${textPack.standards.responseError}`);
				});
		})
		.then(async (all) => {
			const newUser = new User({
				username,
				email,
				password: all[0],
				register: {
					agent,
					ip,
				},
				apps: [app],
			});

			return await newUser
				.save()
				.then((user) => {
					all.push(user);
					return all;
				})
				.catch((err) => {
					console.error(err);
					throw new Error(
						`500:${textPack.users.register.userNotCreated}`
					);
				});
		})
		.then(async (all) => {
			const link = generateConfirmationLink(all[1]._id);
			if (link.error) {
				return await deleteUser(all[1]._id)
					.then(() => {
						throw new Error(
							`500:${textPack.standards.responseError}`
						);
					})
					.catch(() => {
						throw new Error(
							`500:${textPack.standards.responseCriticError}`
						);
					});
			}
			all.push(link.token);
			return all;
		})
		.then(async (all) => {
			await mailer({
				template: "emailConfirmation",
				templateParams: {
					username,
					link: API(`/users/confirm?t=${all[2]}`),
				},
				target: email,
				subject: "Confirmação de conta do GepetoServices",
			})
				.then(() => {
					performanceLog.finish();
					return res.json(
						response(false, textPack.users.register.userCreated)
					);
				})
				.catch(async () => {
					return await deleteUser(all[1]._id)
						.then(() => {
							throw new Error(
								`500:${textPack.users.register.userNotCreated}`
							);
						})
						.catch(() => {
							throw new Error(
								`500:${textPack.standards.responseCriticError}`
							);
						});
				});
		})
		.catch((err) => {
			performanceLog.finish();
			const error = err.message.split(":");
			console.log(error);
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
