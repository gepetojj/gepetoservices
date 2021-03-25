import moment from "moment-timezone";

import logger from "../logger";

moment().locale("pt-br");
moment().tz("America/Maceio");

class Performance {
	constructor(endpoint) {
		this.endpoint = endpoint || "um endpoint";
		this.start = moment().valueOf();
		this.watchpoints = [];
		this.end = null;
		this.executionTime = null;
	}

	watchpoint(name) {
		this.watchpoints.push({
			name,
			start: moment().valueOf(),
			end: null,
		});
		return;
	}

	watchpointEnd(name) {
		const index = this.watchpoints.findIndex((doc) => doc.name === name);
		this.watchpoints[index] = {
			name,
			start: this.watchpoints[index].start,
			end: moment().valueOf(),
		};
		return;
	}

	finish() {
		this.watchpoints.forEach((watchpoint) => {
			const performance = moment(
				watchpoint.end - watchpoint.start
			).format("x [ms.]");
			logger.info(
				`A execução do processo '${watchpoint.name}' gastou ${performance}`
			);
		});

		this.end = moment().valueOf();
		this.executionTime = this.end - this.start;
		const finalPerformance = moment(this.end - this.start).format(
			"x [ms.]"
		);
		logger.info(
			`O endpoint '${this.endpoint}' respondeu em ${finalPerformance}`
		);
		return;
	}
}

export default Performance;
