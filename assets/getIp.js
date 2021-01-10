const ip = require("ip");

const getIp = (req, res, next) => {
    req.ip = ip.address();
    next();
};

module.exports = getIp;
