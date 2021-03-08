require("dotenv").config();

function API(endpoint) {
    return process.env.NODE_ENV === "development"
        ? `http://localhost:5002/api${endpoint}`
        : `https://gepetoservices.herokuapp.com/api${endpoint}`;
}

export default API;
