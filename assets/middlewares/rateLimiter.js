// const redis = require("redis");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const response = require("../response");
const textPack = require("../textPack.json");

const points = 50;
const minimizedPoints = 5;
const duration = 1800; // 30 minutos em segundos
const pointsConsumed = 200;
const minimizedPointsConsumed = 10;
const blockDuration = 30; // segundos

/* const redisClient = redis.createClient({
	enable_offline_queue: false,
});

redisClient.on("connect", () => {
	console.log("Conectado ao redis.");
});

redisClient.on("error", (err) => {
	console.error("Conexão interrompida com o redis.");
	throw new Error(err);
});
 */
const normalLimiter = new RateLimiterMemory({
	// storeClient: redisClient,
	points,
	duration,
	inmemoryBlockOnConsumed: pointsConsumed,
	inmemoryBlockDuration: blockDuration,
});

const minimizedLimiter = new RateLimiterMemory({
	// storeClient: redisClient,
	points: minimizedPoints,
	duration,
	inmemoryBlockOnConsumed: minimizedPointsConsumed,
	inmemoryBlockDuration: blockDuration,
});

const rateLimiter = (req, res, next) => {
	if (req.path === "/api/status/" || req.path === "/api/status") {
		minimizedLimiter
			.consume(req.ip)
			.then(() => {
				res.set("X-Rate-Limit-Status", "OK");
				next();
			})
			.catch(() => {
				res.set("X-Rate-Limit-Status", "LIMITED");
				return res.status(429).json(
					response(true, textPack.rateLimiter.responseError, {
						limit: `${points - 45} requests em ${Math.floor(
							duration / 60
						)} minutos.`,
					})
				);
			});
	} else {
		normalLimiter
			.consume(req.ip)
			.then(() => {
				res.set("X-Rate-Limit-Status", "OK");
				next();
			})
			.catch(() => {
				res.set("X-Rate-Limit-Status", "LIMITED");
				return res.status(429).json(
					response(true, textPack.rateLimiter.responseError, {
						limit: `${points} requests em ${Math.floor(
							duration / 60
						)} minutos.`,
					})
				);
			});
	}
};

module.exports = rateLimiter;
