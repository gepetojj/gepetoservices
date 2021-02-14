require("dotenv").config();
const express = require("express");
const router = express.Router();

const response = require("../../assets/response");
const textPack = require("../../assets/textPack.json");
const authorize = require("../../assets/middlewares/authorize");

router.get("/", authorize, (req, res) => {
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

module.exports = router;
