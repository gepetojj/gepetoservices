const RequestIp = require("@supercharge/request-ip");

const getIp = (req, res, next) => {
    const userIp = RequestIp.getClientIp(req);
    req.ip = userIp;
    console.log(`Novo acesso a API pelo ip: ${userIp}`);
    next();
};

module.exports = getIp;
