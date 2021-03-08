import axios from 'axios';
import moment from 'moment-timezone';
import Form from 'form-data';
import { createReadStream } from 'fs';
import API from './api';

moment().locale("pt-br");
moment().tz("America/Maceio");

function status(endpoint = undefined) {
	/**
	 * Classifica uma API e retorna seu status.
	 * @param {Number} statusCode Código da resposta da API.
	 * @param {String} timeToRespond Tempo de resposta da API em milisegundos.
	 * @returns {String} Retorna o status da API.
	 */
	function classify(statusCode, timeToRespond) {
		if (statusCode > 199 && statusCode < 300) {
			if (timeToRespond < 1700) {
				return "OK";
			} else {
				return "ALERT";
			}
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
			createReadStream(`${process.cwd()}/assets/tests/testImage.png`)
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

export default status;
