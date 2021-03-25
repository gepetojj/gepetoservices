require("dotenv").config();
import "core-js/stable";
import "regenerator-runtime/runtime";
import express from "express";
import { connect, connection } from "mongoose";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import compression from "compression";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import hsts from "hsts";
import enforceSSL from "express-enforces-ssl";
import cookieSession from "cookie-session";
import moment from "moment-timezone";
import pinoHttp from "pino-http";

import getIp from "./assets/middlewares/getIp";
import rateLimiter from "./assets/middlewares/rateLimiter";
import apiHandler from "./api/handler";
import response from "./assets/response";
import textPack from "./assets/textPack.json";
import logger from "./assets/logger";

const app = express();
const port = process.env.PORT;
moment().locale("pt-br");
moment().tz("America/Maceio");

if (process.env.NODE_ENV === "production") {
	app.enable("trust proxy");
	app.use(enforceSSL());
}
app.use(
	hsts({
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true,
	})
);
app.use(
	helmet({
		hsts: false,
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				"script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
			},
		},
	})
);
app.use(
	cors({
		origin: "*",
	})
);
app.use(compression());
app.use(getIp);
app.use(rateLimiter);
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(
	cookieSession({
		secret: process.env.COOKIE_SECRET,
		expires: moment().add(1, "day").toDate(),
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		signed: true,
		sameSite: "lax",
	})
);
app.use(
	fileUpload({
		createParentPath: true,
	})
);
if (process.env.NODE_ENV === "development") {
	app.use(pinoHttp({ logger }));
}

const mongoDB = process.env.MONGO_URI;
connect(mongoDB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});
connection.on("error", (err) => {
	throw logger.fatal(`Erro com o MongoDB: ${err.message}`);
});

app.use(express.static("build/public"));
app.use("/api", apiHandler);

app.get("/", (req, res) => {
	const html = `
      <!DOCTYPE html>
      <html lang="pt-br">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>GepetoServices</title>
		</head>
		<body>
			<div id="app">
			</div>
			<script src="bundleClient.js"></script>
		</body>
      </html>
    `;
	res.send(html);
});
app.use((req, res) => {
	return res.status(404).json(
		response(true, textPack.main.notFound, {
			method: req.method,
			endpoint: req.path,
		})
	);
});

app.listen(port, "0.0.0.0", () => {
	logger.info(textPack.main.serverStart);
});
