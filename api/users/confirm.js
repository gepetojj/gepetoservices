require("dotenv").config();
const express = require("express");
const router = express.Router();

const response = require("../../assets/response");
const textPack = require("../../assets/textPack.json");
const User = require("../../assets/models/User");
const Token = require("../../assets/token");

const Performance = require("../../assets/tests/performance");

async function getCurrentUserState(id) {
	try {
		const userState = await User.findOne({ _id: id });
		if (userState) {
			return { error: false, state: userState.state };
		} else {
			return { error: true, message: "Usuário inexistente." };
		}
	} catch (err) {
		console.error(err);
		return { error: true, message: err };
	}
}

async function changeUserState(id, newState) {
	try {
		await User.updateOne({ _id: id }, { state: { ...newState } });
		return { error: false };
	} catch (err) {
		console.error(err);
		return { error: true, message: err };
	}
}

router.get("/", async (req, res) => {
	const performanceLog = new Performance("/users/confirm");
	let { t } = req.query;

	if (!t) {
		performanceLog.finish();
		return res
			.status(400)
			.json(response(true, textPack.authorize.nullToken));
	}

	t = decodeURIComponent(t);

	await Token()
		.verify(t)
		.then(async (decoded) => {
			await Token()
				.revoke(decoded.tokenId)
				.then(async () => {
					performanceLog.watchpoint("getCurrentUserState");
					const userState = await getCurrentUserState(decoded.id);
					if (userState.error) {
						performanceLog.watchpointEnd("getCurrentUserState");
						performanceLog.finish();
						return res
							.status(500)
							.json(
								response(true, textPack.standards.responseError)
							);
					} else {
						performanceLog.watchpointEnd("getCurrentUserState");
						switch (decoded.scope) {
							case "confirmEmail":
								if (
									userState.state.emailConfirmed ===
									decoded.newState
								) {
									performanceLog.finish();
									return res
										.status(400)
										.json(
											response(
												true,
												textPack.users.confirmEmail
													.emailAlreadyConfirmed
											)
										);
								}

								performanceLog.watchpoint("changeUserState");
								const cusOperation = await changeUserState(
									decoded.id,
									{
										emailConfirmed: decoded.newState,
										banned: userState.state.banned,
										reason: userState.state.reason,
										banDate: userState.state.banDate,
									}
								);

								if (cusOperation.error) {
									performanceLog.watchpointEnd(
										"changeUserState"
									);
									performanceLog.finish();
									return res
										.status(500)
										.json(
											response(
												true,
												textPack.users.confirmEmail
													.couldNotConfirmEmail
											)
										);
								} else {
									performanceLog.watchpointEnd(
										"changeUserState"
									);
									performanceLog.finish();
									return res.json(
										response(
											false,
											textPack.users.confirmEmail
												.emailConfirmed
										)
									);
								}
						}
					}
				})
				.catch((err) => {
					return res
						.status(err.code)
						.json(response(true, err.message));
				});
		})
		.catch((err) => {
			return res.status(err.code).json(response(true, err.message));
		});
});

module.exports = router;
