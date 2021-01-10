const { RateLimiterMemory } = require("rate-limiter-flexible");
const response = require("./response");

const points = 50;
const duration = 1800; // 30 minutos

const limiter = new RateLimiterMemory({
    points,
    duration,
});

const rateLimiter = (req, res, next) => {
    limiter
        .consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json(
                response(
                    true,
                    "Você atingiu o limite de requests ao servidor.",
                    {
                        limit: `${points} requests em ${Math.floor(
                            duration / 60
                        )} minutos`,
                    }
                )
            );
        });
};

module.exports = rateLimiter;
