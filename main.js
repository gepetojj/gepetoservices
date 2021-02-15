require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const getIp = require("./assets/middlewares/getIp");
const rateLimiter = require("./assets/middlewares/rateLimiter");
const helmet = require("helmet");
const hsts = require("hsts");
const enforceSSL = require("express-enforces-ssl");

const apiHandler = require("./api/handler");
const response = require("./assets/response");
const textPack = require("./assets/textPack.json");

const app = express();
const port = process.env.PORT;

if (process.env.NODE_ENV === "production") {
	app.enable("trust proxy");
	app.use(enforceSSL());
	app.use(
		hsts({
			maxAge: 31536000,
			includeSubDomains: true,
			preload: true,
		})
	);
}
app.use(helmet());
app.use(
	cors({
		origin: "*",
	})
);
app.use(getIp);
app.use(rateLimiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(
	fileUpload({
		createParentPath: true,
	})
);

const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});
mongoose.connection.on("error", (err) => {
	console.error(`Erro no MongoDB: ${err}`);
	throw new Error(err);
});

app.use("/api", apiHandler);

app.get("/", (req, res) => {
	return res.status(300).redirect(textPack.main.redirectURL);
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
	console.log(textPack.main.serverStart);
});

if (process.env.NODE_ENV === "development") {
	module.exports = app;
}
