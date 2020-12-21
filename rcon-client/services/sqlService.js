import mysqlAsync from "mysql-await";

import dotenv from "dotenv";

dotenv.config();

export const sql = mysqlAsync.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});

sql.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
});


export default { sql }