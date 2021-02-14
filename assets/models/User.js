const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Schema = mongoose.Schema;
moment().locale("pt-br");
moment().tz("America/Maceio");

const textPack = require("../textPack.json");

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
	state: {
		banned: {
			type: Boolean,
			default: false,
		},
		reason: {
			type: String,
		},
		banDate: {
			type: Date,
		},
		emailConfirmed: {
			type: Boolean,
			default: false,
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

const UserModel = mongoose.model("User", User, "users");
module.exports = UserModel;
