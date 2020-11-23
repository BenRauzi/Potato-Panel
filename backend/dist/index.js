"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const authController_1 = __importDefault(require("./controllers/authController"));
const authService_1 = require("./services/authService");
const sqlService_1 = __importDefault(require("./services/sqlService"));
const app = express_1.default();
dotenv_1.default.config();
// middlewares
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(cookie_parser_1.default());
// listen
console.log(process.env.DB_USER);
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log("API Online!");
});
app.get('/api', authService_1.checkToken, (req, res) => {
    /*if checkToken function succeed, api reach this block
    you can do whatever you want, also you can access to req.user      which sent from checkToken function
    */
    res.send("Test");
});
// init controllers
authController_1.default(app, sqlService_1.default);
//# sourceMappingURL=index.js.map