require("dotenv").config();
import express from "express";
import { connect, connection } from "mongoose";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import compression from "compression";
import fileUpload from "express-fileupload";
import getIp from "./assets/middlewares/getIp";
import rateLimiter from "./assets/middlewares/rateLimiter";
import helmet from "helmet";
import hsts from "hsts";
import enforceSSL from "express-enforces-ssl";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import apiHandler from "./api/handler";
import response from "./assets/response";
import { main } from "./assets/textPack.json";

const app = express();
const port = process.env.PORT;

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
app.use(cookieParser());
app.use(
	fileUpload({
		createParentPath: true,
	})
);
app.use(morgan("dev"));

const mongoDB = process.env.MONGO_URI;
connect(mongoDB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});
connection.on("error", (err) => {
	console.error(`Erro no MongoDB: ${err}`);
	throw new Error(err);
});

app.use("/api", apiHandler);

app.get("/", (req, res) => {
	return res.status(300).redirect(main.redirectURL);
});
app.use((req, res) => {
	return res.status(404).json(
		response(true, main.notFound, {
			method: req.method,
			endpoint: req.path,
		})
	);
});

app.listen(port, "0.0.0.0", () => {
	console.log(main.serverStart);
});

export default app;
