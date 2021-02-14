const response = (error, message, optional = {}) => {
    if (optional.length < 1) {
        return {
            error,
            message,
        };
    } else {
        return {
            error,
            message,
            ...optional,
        };
    }
};

module.exports = response;
