require("dotenv").config();
const redis = require("redis");

const redisServer = process.env.REDIS_SERVER;

const redisClient = redis.createClient({
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

module.exports = redisClient;
