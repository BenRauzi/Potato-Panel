const mysql = require("mysql");
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to Database!');
});

module.exports = connection;