require("dotenv").config();
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	mode: process.env.NODE_ENV,
	entry: "./main.js",
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "bundleServer.js",
	},
	target: "node",
	module: {
		rules: [
			{
				test: /\.js$/,
				use: "babel-loader",
			},
		],
	},
	externals: [nodeExternals()],
};
