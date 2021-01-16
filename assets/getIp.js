const RequestIp = require("@supercharge/request-ip");

const getIp = (req, res, next) => {
    const userIp = RequestIp.getClientIp(req);
    req.ip = userIp;
    next();
};

module.exports = getIp;
