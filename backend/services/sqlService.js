const mysql = require("mysql");
const mysqlAsync = require("mysql-await");

const dotenv = require('dotenv');

dotenv.config();

const sql = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

const  = mysqlAsync.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

connectionAsync.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
});

sql.connect((err) => {
    if (err) throw err;
    console.log('Connected to Database!');
});

module.exports = { sql, connectionAsync };