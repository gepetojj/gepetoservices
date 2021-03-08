import validator from 'validator';
import moment from 'moment-timezone';
import uuid from 'uuid';
import textPack from '../textPack.json';

moment().locale("pt-br");
moment().tz("America/Maceio");

function Session({ uid, username, agent, ip, app, refreshToken }) {
	if (!validator.isMongoid(uid)) {
		return { error: true, message: "UID inválido." };
	}
	if (validator.isEmpty(username)) {
		return { error: true, message: "Username não pode ser nulo." };
	}
	if (validator.isEmpty(agent)) {
		return { error: true, message: "Agent não pode ser nulo." };
	}
	if (!validator.isIP(ip, 4)) {
		return { error: true, message: "IP inválido." };
	}
	if (!textPack.authorize.apps.includes(app)) {
		return { error: true, message: "App inválido." };
	}
	if (!validator.isJWT(refreshToken)) {
		return { error: true, message: "RefreshToken inválido." };
	}

	return {
		error: false,
		session: {
			uid,
			username,
			agent,
			ip,
			refreshToken,
			sessionId: uuid.v4(),
			loginDate: moment().valueOf(),
			validUntil: moment().add(1, "day").valueOf(),
		},
	};
}

export default Session;
