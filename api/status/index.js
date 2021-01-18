const express = require("express");
const router = express.Router();
const axios = require("axios");
const formData = require("form-data");
const fs = require("fs");
const moment = require("moment-timezone");

moment().locale("pt-br");
moment().tz("America/Maceio");

const API = require("../../assets/api");
const response = require("../../assets/response");

const Performance = require("../../assets/tests/performance");

function classifier(statusCode, timeToRespond) {
    if (statusCode > 199 < 300 && timeToRespond < 2000) {
        return "OK";
    } else if (statusCode > 199 < 300 && timeToRespond > 2000) {
        return "ALERT";
    } else if (statusCode > 299) {
        return "ERROR";
    } else {
        return "UNKNOWN";
    }
}

router.get("/", async (req, res) => {
    const performanceLog = new Performance("/status");
    let testResults = {
        translator: {
            statusCode: 0,
            timeToRespond: 0,
            classifiedAs: "nt",
        },
        upload: {
            statusCode: 0,
            timeToRespond: 0,
            classifiedAs: "nt",
        },
        access: {
            statusCode: 0,
            timeToRespond: 0,
            classifiedAs: "nt",
        },
        delete: {
            statusCode: 0,
            timeToRespond: 0,
            classifiedAs: "nt",
        },
    };

    try {
        const translatorTestStart = moment().valueOf();
        try {
            var translatorTest = await axios.get(
                API(`/translator?text=testando essa API&from=pt&to=en`)
            );
            testResults.translator.statusCode = translatorTest.status;
        } catch (err) {
            testResults.translator.statusCode = err.response.status;
        }
        const translatorTestEnd = moment().valueOf();
        const translatorTimeToRespond = Number(
            moment(translatorTestEnd - translatorTestStart).format("x")
        );
        testResults.translator.timeToRespond = translatorTimeToRespond;
        testResults.translator.classifiedAs = classifier(
            translatorTest.status,
            translatorTimeToRespond
        );
        performanceLog.watchpoint("translatorTest");

        let testImageName = "";

        const uploadTestStart = moment().valueOf();
        try {
            const testImage = new formData();
            testImage.append(
                "file",
                fs.createReadStream(
                    `${process.cwd()}/assets/tests/testImage.png`
                )
            );
            var uploadTest = await axios.post(
                API(`/storage/upload`),
                testImage,
                {
                    headers: testImage.getHeaders(),
                }
            );
            testImageName = uploadTest.data.filename;
            testResults.upload.statusCode = uploadTest.status;
        } catch (err) {
            testResults.upload.statusCode = err.response.status;
        }
        const uploadTestEnd = moment().valueOf();
        const uploadTimeToRespond = Number(
            moment(uploadTestEnd - uploadTestStart).format("x")
        );
        testResults.upload.timeToRespond = uploadTimeToRespond;
        testResults.upload.classifiedAs = classifier(
            uploadTest.status,
            uploadTimeToRespond
        );
        performanceLog.watchpoint("uploadTest");

        const accessTestStart = moment().valueOf();
        try {
            var accessTest = await axios.get(
                API(`/storage/access?filename=${testImageName}`)
            );
            testResults.access.statusCode = accessTest.status;
        } catch (err) {
            testResults.access.statusCode = err.response.status;
        }
        const accessTestEnd = moment().valueOf();
        const accessTimeToRespond = Number(
            moment(accessTestEnd - accessTestStart).format("x")
        );
        testResults.access.timeToRespond = accessTimeToRespond;
        testResults.access.classifiedAs = classifier(
            accessTest.status,
            accessTimeToRespond
        );
        performanceLog.watchpoint("accessTest");

        const deleteTestStart = moment().valueOf();
        try {
            var deleteTest = await axios.delete(
                API(`/storage/delete?filename=${testImageName}`)
            );
            testResults.delete.statusCode = deleteTest.status;
        } catch (err) {
            testResults.delete.statusCode = err.response.status;
        }
        const deleteTestEnd = moment().valueOf();
        const deleteTimeToRespond = Number(
            moment(deleteTestEnd - deleteTestStart).format("x")
        );
        testResults.delete.timeToRespond = deleteTimeToRespond;
        testResults.delete.classifiedAs = classifier(
            deleteTest.status,
            deleteTimeToRespond
        );
        performanceLog.watchpoint("deleteTest");

        performanceLog.finish();
        return res.json(
            response(false, "Status obtido com sucesso.", {
                storage: {
                    access: testResults.access,
                    delete: testResults.delete,
                    upload: testResults.upload,
                },
                translator: testResults.translator,
            })
        );
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json(response(true, "Não foi possível obter o status."));
    }
});

module.exports = router;
