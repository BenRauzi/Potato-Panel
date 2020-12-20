const mysqlAsync = require("mysql-await");

const dotenv = require('dotenv');

dotenv.config();

const sql = mysqlAsync.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

sql.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
});

module.exports = { sql };