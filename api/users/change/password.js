import { Router } from 'express';
const router = Router();
import xssFilters from 'xss-filters';
import bcrypt from 'bcrypt';
import authorize from '../../../assets/middlewares/authorize';
import response from '../../../assets/response';
import validator from '../../../assets/validator';
import textPack from '../../../assets/textPack.json';
import User from '../../../assets/models/User';
import API from '../../../assets/api';
import Token from '../../../assets/token';
import mailer from '../../../assets/mailer';
import Performance from '../../../assets/tests/performance';

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
	const token = Token().create(
		{
			id: uid,
			scope: "changePassword",
			newState: password,
		},
		"refresh"
	);
	if (token.error) {
		return { error: true };
	}
	const link = API(`/users/confirm?t=${encodeURIComponent(token.token)}`);
	return { error: false, link };
}

router.put("/", authorize({ level: 0 }), (req, res) => {
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
					}
					throw new Error(
						`401:${textPack.users.login.wrongPassword}`
					);
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
						`500:${textPack.users.change.password.couldntChangePassword}`
					);
				});
		})
		.then((all) => {
			const link = generateConfirmLink(req.user.id, all[0]);
			if (!link.error) {
				all.push(link.link);
				return all;
			}
			throw new Error(
				`500:${textPack.users.change.password.couldntChangePassword}`
			);
		})
		.then(async (all) => {
			return await mailer({
				template: "changePassword",
				templateParams: { username: req.user.username, link: all[1] },
				target: req.user.email,
				subject: "Mudança de senha da conta do GepetoServices",
			})
				.then(() => {
					performanceLog.finish();
					return res.json(
						response(
							false,
							textPack.users.change.password.confirmAction
						)
					);
				})
				.catch(() => {
					throw new Error(
						`500:${textPack.users.change.password.couldntSendEmail}`
					);
				});
		})
		.catch((err) => {
			performanceLog.finish();
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
