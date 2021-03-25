import pino from "pino";

export default pino({
	level: "debug",
	prettyPrint: {
		levelFirst: true,
		colorize: true,
	},
});
