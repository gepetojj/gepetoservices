require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const getIp = require("./assets/getIp");
const rateLimiter = require("./assets/rateLimiter");
const helmet = require("helmet");

const apiHandler = require("./api/handler");
const response = require("./assets/response");
const textPack = require("./assets/textPack.json");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: "*",
    })
);
app.use(compression());
app.use(
    fileUpload({
        createParentPath: true,
    })
);
app.use(getIp);
app.use(rateLimiter);
app.use(helmet());

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

app.listen(port, () => {
    console.log(textPack.main.serverStart);
});

module.exports = app;
