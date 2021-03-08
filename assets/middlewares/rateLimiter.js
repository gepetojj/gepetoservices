require("dotenv").config();
import { RateLimiterMemory } from 'rate-limiter-flexible';
import moment from 'moment-timezone';
import response from '../response';
import textPack from '../textPack.json';

moment().locale("pt-br");
moment().tz("America/Maceio");

const points = 50;
const minimizedPoints = 5;
const duration = 1800; // 30 minutos em segundos
const pointsConsumed = 200;
const minimizedPointsConsumed = 10;
const blockDuration = 30; // segundos

const normalLimiter = new RateLimiterMemory({
	points,
	duration,
	inmemoryBlockOnConsumed: pointsConsumed,
	inmemoryBlockDuration: blockDuration,
});

const minimizedLimiter = new RateLimiterMemory({
	points: minimizedPoints,
	duration,
	inmemoryBlockOnConsumed: minimizedPointsConsumed,
	inmemoryBlockDuration: blockDuration,
});

function getHeaders(limiter, type = "normal") {
	if (type !== "normal") {
		const headers = {
			"Retry-After": limiter.msBeforeNext / 1000,
			"X-RateLimit-Limit": minimizedPoints,
			"X-RateLimit-Remaining": limiter.remainingPoints,
			"X-RateLimit-Reset": moment(moment() + limiter.msBeforeNext).format(
				"DD/MM/YYYY hh:mm:ss [GMT-3]"
			),
		};
		return headers;
	} else {
		const headers = {
			"Retry-After": limiter.msBeforeNext / 1000,
			"X-RateLimit-Limit": points,
			"X-RateLimit-Remaining": limiter.remainingPoints,
			"X-RateLimit-Reset": moment(moment() + limiter.msBeforeNext).format(
				"DD/MM/YYYY hh:mm:ss [GMT-3]"
			),
		};
		return headers;
	}
}

const rateLimiter = (req, res, next) => {
	if (textPack.rateLimiter.endpoints.includes(req.path)) {
		minimizedLimiter
			.consume(req.headers["x-ip"])
			.then((limiter) => {
				const headers = getHeaders(limiter, "minimized");
				res.set(headers);
				return next();
			})
			.catch((limiter) => {
				const headers = getHeaders(limiter, "minimized");
				res.set(headers);

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
			.consume(req.headers["x-ip"])
			.then((limiter) => {
				const headers = getHeaders(limiter);
				res.set(headers);
				return next();
			})
			.catch((limiter) => {
				const headers = getHeaders(limiter);
				res.set(headers);

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

export default rateLimiter;
