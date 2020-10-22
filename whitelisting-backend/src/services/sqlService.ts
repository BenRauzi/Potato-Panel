import mysql from "mysql";
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.DB_URL)
console.log( process.env.DB_USER)
console.log(process.env.DB_PASS)
console.log(process.env.DB_SCHEMA)

const connection = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

export default connection;