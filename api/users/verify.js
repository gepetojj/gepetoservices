require("dotenv").config();
import { Router } from "express";
const router = Router();

import response from "../../assets/response";
import textPack from "../../assets/textPack.json";
import authorize from "../../assets/middlewares/authorize";

router.get("/", authorize({ level: 0 }), (req, res) => {
	const app = req.headers["x-from-app"] || "noapp";

	if (req.user) {
		if (req.user.app === app) {
			return res.json(
				response(false, textPack.users.verify.authenticated, {
					user: req.user,
				})
			);
		} else {
			return res
				.status(401)
				.json(response(true, textPack.authorize.invalidApp));
		}
	} else {
		return res
			.status(401)
			.json(response(true, textPack.users.verify.notAuthenticated));
	}
});

export default router;
