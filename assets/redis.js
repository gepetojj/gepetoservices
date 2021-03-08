require("dotenv").config();
import { createClient } from 'redis';

const redisServer = process.env.REDIS_SERVER;

const redisClient = createClient({
	url: redisServer,
	enable_offline_queue: false,
});

redisClient.on("connect", () => {
	console.log("Conectado ao redis.");
});

redisClient.on("error", (err) => {
	console.error("Conexão interrompida com o redis.");
	throw new Error(err);
});

export default redisClient;
