const express = require("express");
const router = express.Router();

const API = require("../../assets/api");
const response = require("../../assets/response");
const status = require("../../assets/status");
const textPack = require("../../assets/textPack.json");

const Performance = require("../../assets/tests/performance");

router.get("/", async (req, res) => {
	const performanceLog = new Performance("/status");
	let testResults = {
		translator: {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
		},
		upload: {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
		},
		access: {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
		},
		delete: {
			statusCode: 0,
			timeToRespond: 0,
			classifiedAs: "",
		},
	};

	try {
		performanceLog.watchpoint("translatorTest");
		await status(`/translator?text=testando essa API&from=pt&to=en`)
			.get()
			.then((test) => {
				testResults.translator = test;
			})
			.catch((test) => {
				testResults.translator = test;
			});
		performanceLog.watchpointEnd("translatorTest");

		let testImageName = "";

		performanceLog.watchpoint("uploadTest");
		await status(`/storage/upload`)
			.post()
			.then((test) => {
				testImageName = test.filename;
				testResults.upload.statusCode = test.statusCode;
				testResults.upload.timeToRespond = test.timeToRespond;
				testResults.upload.classifiedAs = test.classifiedAs;
			})
			.catch((test) => {
				testResults.upload.statusCode = test.statusCode;
				testResults.upload.timeToRespond = test.timeToRespond;
				testResults.upload.classifiedAs = test.classifiedAs;
			});
		performanceLog.watchpointEnd("uploadTest");

		performanceLog.watchpoint("accessTest");
		await status(`/storage/access?filename=${testImageName}`)
			.get()
			.then((test) => {
				testResults.access = test;
			})
			.catch((test) => {
				testResults.access = test;
			});
		performanceLog.watchpointEnd("accessTest");

		performanceLog.watchpoint("deleteTest");
		await status(`/storage/delete?filename=${testImageName}`)
			.del()
			.then((test) => {
				testResults.delete = test;
			})
			.catch((test) => {
				testResults.delete = test;
			});
		performanceLog.watchpointEnd("deleteTest");

		performanceLog.finish();
		return res.json(
			response(false, textPack.status.responseOK, {
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
			.json(response(true, textPack.standards.responseError));
	}
});

module.exports = router;
