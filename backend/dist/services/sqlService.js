"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log(process.env.DB_URL);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
console.log(process.env.DB_SCHEMA);
const connection = mysql_1.default.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA
});
connection.connect((err) => {
    if (err)
        throw err;
    console.log('Connected to MySQL!');
});
exports.default = connection;
//# sourceMappingURL=sqlService.js.map