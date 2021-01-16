const moment = require("moment-timezone");
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
        this.watchpoints.push({ name, point: moment().valueOf() });
    }

    finish() {
        this.watchpoints.forEach((watchpoint) => {
            console.log(
                `A execução do processo '${watchpoint.name}' gastou ${moment(
                    watchpoint.point - this.start
                ).format("x [ms.]")}`
            );
        });
        this.end = moment().valueOf();
        this.executionTime = this.end - this.start;
        console.log(
            `O endpoint '${this.endpoint}' respondeu em ${moment(
                this.end - this.start
            ).format("x [ms.]")}`
        );
        return console.log("---");
    }
}

module.exports = Performance;
