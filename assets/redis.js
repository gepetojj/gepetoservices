require("dotenv").config();
import { createClient } from "redis";

import logger from "./logger";

const redisServer = process.env.REDIS_SERVER;

const redisClient = createClient({
	url: redisServer,
	enable_offline_queue: false,
});

redisClient.on("connect", () => {
	logger.info("Conectado ao redis.");
});

redisClient.on("error", (err) => {
	throw logger.fatal(err.message);
});

export default redisClient;
