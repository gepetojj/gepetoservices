import { Router } from 'express';
const router = Router();

import response from '../../assets/response';
import textPack from '../../assets/textPack.json';
import Token from '../../assets/token';

router.get("/", (req, res) => {
	const refreshToken = req.cookies["refreshToken"];
	const app = req.headers["x-from-app"] || "noapp";
	const agent = req.headers["user-agent"];

	if (!refreshToken) {
		return res
			.status(401)
			.json(response(true, textPack.authorize.nullToken));
	}

	if (!["noapp", "lastpwd", "ppt"].includes(app)) {
		return res
			.status(401)
			.json(response(true, textPack.authorize.invalidApp));
	}

	Promise.resolve([])
		.then(async (all) => {
			return await Token()
				.verify(refreshToken, "refresh")
				.then((decoded) => {
					if (decoded.app !== app) {
						throw new Error(
							`401:${textPack.users.refresh.invalidApp}`
						);
					}
					all.push(decoded);
					return all;
				})
				.catch((err) => {
					throw new Error(`${err.code}:${err.message}`);
				});
		})
		.then((all) => {
			const accessToken = Token().create(
				{
					id: all[0].id,
					app: all[0].app,
				},
				"access"
			);
			if (accessToken.error) {
				throw new Error(`500:${textPack.standards.responseError}`);
			}
			return res.json(
				response(false, textPack.users.refresh.tokenRefreshed, {
					accessToken: accessToken.token,
				})
			);
		})
		.catch((err) => {
			//performanceLog.finish();
			const error = err.message.split(":");
			return res.status(error[0]).json(response(true, error[1]));
		});
});

export default router;
