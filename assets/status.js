const axios = require("axios");
const moment = require("moment-timezone");
const Form = require("form-data");
const fs = require("fs");

const API = require("./api");

moment().locale("pt-br");
moment().tz("America/Maceio");

function status(endpoint = undefined) {
	function classify(statusCode, timeToRespond) {
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

	async function get() {
		let testData = {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
		};

		const testStart = moment().valueOf();
		try {
			const test = await axios.get(API(endpoint));
			const testEnd = moment().valueOf();

			testData.statusCode = test.status;
			testData.timeToRespond = Number(
				moment(testEnd - testStart).format("x")
			);
			testData.classifiedAs = classify(
				testData.statusCode,
				testData.timeToRespond
			);

			return testData;
		} catch (err) {
			const testEnd = moment().valueOf();
			testData.timeToRespond = Number(
				moment(testEnd - testStart).format("x")
			);

			if (err.response === undefined) {
				testData.statusCode = 503;
			} else {
				testData.statusCode = err.response.status;
			}

			testData.classifiedAs = classify(
				testData.statusCode,
				testData.timeToRespond
			);

			return testData;
		}
	}

	async function post(name = "file") {
		let testData = {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
			filename: "",
		};

		const formData = new Form();
		formData.append(
			name,
			fs.createReadStream(`${process.cwd()}/assets/tests/testImage.png`)
		);

		const testStart = moment().valueOf();
		try {
			const test = await axios.post(API(endpoint), formData, {
				headers: formData.getHeaders(),
			});
			const testEnd = moment().valueOf();

			testData.statusCode = test.status;
			testData.timeToRespond = Number(
				moment(testEnd - testStart).format("x")
			);
			testData.filename = test.data.filename;
			testData.classifiedAs = classify(
				testData.statusCode,
				testData.timeToRespond
			);

			return testData;
		} catch (err) {
			const testEnd = moment().valueOf();
			testData.timeToRespond = Number(
				moment(testEnd - testStart).format("x")
			);

			if (err.response === undefined) {
				testData.statusCode = 503;
			} else {
				testData.statusCode = err.response.status;
			}

			testData.classifiedAs = classify(
				testData.statusCode,
				testData.timeToRespond
			);

			return testData;
		}
	}

	async function del() {
		let testData = {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
		};

		const testStart = moment().valueOf();
		try {
			const test = await axios.delete(API(endpoint));
			const testEnd = moment().valueOf();

			testData.statusCode = test.status;
			testData.timeToRespond = Number(
				moment(testEnd - testStart).format("x")
			);
			testData.classifiedAs = classify(
				testData.statusCode,
				testData.timeToRespond
			);

			return testData;
		} catch (err) {
			const testEnd = moment().valueOf();
			testData.timeToRespond = Number(
				moment(testEnd - testStart).format("x")
			);

			if (err.response === undefined) {
				testData.statusCode = 503;
			} else {
				testData.statusCode = err.response.status;
			}

			testData.classifiedAs = classify(
				testData.statusCode,
				testData.timeToRespond
			);

			return testData;
		}
	}

	return {
		get,
		post,
		del,
	};
}

module.exports = status;
