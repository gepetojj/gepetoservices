const retryHandler = async (func, times) => {
    let timesExecuted = 0;
    let retryData = [];
    while (timesExecuted < times) {
        timesExecuted++;
        try {
            const returnedData = await func();
            retryData.push({
                try: timesExecuted,
                error: false,
                data: returnedData,
            });
            break;
        } catch (err) {
            retryData.push({
                try: timesExecuted,
                error: true,
                data: err.message,
            });
        }
    }
    return retryData;
};

module.exports = retryHandler;
