import { Schema, model } from 'mongoose';
import moment from 'moment-timezone';

moment().locale("pt-br");
moment().tz("America/Maceio");

import textPack from '../textPack.json';

const User = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		max: 12,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		select: false,
	},
	avatar: {
		type: String,
		default: textPack.users.register.avatarURL,
	},
	level: {
		type: Number,
		default: 0,
	},
	state: {
		banned: {
			type: Boolean,
			default: false,
		},
		reason: {
			type: String,
		},
		banDate: {
			type: Number,
		},
		emailConfirmed: {
			type: Boolean,
			default: false,
		},
		tfaActivated: {
			type: Boolean,
			default: false,
		},
	},
	tfa: {
		recoverCodes: [String],
		secret: {
			hash: {
				type: String,
			},
			key: {
				type: Buffer,
			},
			iv: {
				type: Buffer,
			},
		},
	},
	register: {
		date: {
			type: Number,
			default: moment().valueOf(),
		},
		agent: {
			type: String,
			required: true,
		},
		ip: {
			type: String,
			required: true,
		},
	},
	lastLogin: {
		date: {
			type: Number,
		},
		agent: {
			type: String,
		},
		ip: {
			type: String,
		},
		token: {
			type: String,
		},
		app: {
			type: String,
		},
	},
	apps: [String],
});

const UserModel = model("User", User, "users");
export default UserModel;
