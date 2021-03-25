const path = require("path");

module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "build/public"),
		filename: "bundleClient.js",
	},
	module: {
		rules: [
			{
				test: /\.js$|jsx/,
				use: "babel-loader",
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.png$/,
				use: "file-loader",
			},
		],
	},
};
