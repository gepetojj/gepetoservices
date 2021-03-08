import { getClientIp } from "@supercharge/request-ip";

const getIp = (req, res, next) => {
	const userIp = getClientIp(req);
	req.headers["x-ip"] = userIp;
	next()
};

export default getIp;
