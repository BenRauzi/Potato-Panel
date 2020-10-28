import mysql from "mysql";
import mysqlAsync from "mysql-await";

import dotenv from 'dotenv';

dotenv.config();

export const connection = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

export const connectionAsync = mysqlAsync.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

connectionAsync.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to Database!');
});

export default connection;