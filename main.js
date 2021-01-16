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
    res.status(300).redirect("https://github.com/gepetojj/gepetoservices/wiki");
});

app.listen(port, () => {
    console.log("Servidor online.");
});

module.exports = app;
