"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService_1 = require("../services/authService");
const bcrypt_1 = require("bcrypt");
const authController = (app, sql) => {
    app.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // get username from request's body, eg. from login form
        const body = req.body;
        const { username, password } = body;
        sql.query("SELECT * from panel_users WHERE username = ?", [
            username
        ], (error, result) => {
            bcrypt_1.compare(password, result[0].password, (err, isValid) => {
                if (isValid === true) {
                    const token = jsonwebtoken_1.default.sign({ user: username }, process.env.JWT_SECRET);
                    // save token in cookie
                    res.cookie('authcookie', token, { maxAge: 900000, httpOnly: true });
                    res.send(result[0]);
                }
                else {
                    res.sendStatus(401);
                }
            });
        });
    }));
    app.get('/auth/logout', authService_1.checkToken, (req, res) => {
        res.clearCookie("authcookie");
        res.sendStatus(200);
    });
    // app.get('/validate', (req, res) => {
    //     sql.query("SELECT * FROM panel_users WHERE pid = '76561198049947102'", [
    //         "76561198049947102",
    //     ], (error, results) => {
    //         const oof = compare("test", results[0].password, (err, isValid) => {
    //             console.log(isValid)
    //         })
    //         res.send(results)
    //     });
    // })
    app.post('/auth/user/create', (req, res) => {
        const body = req.body;
        const { pid, username, password } = body;
        const hashedPassword = bcrypt_1.hash(password, 10, (err, hashed) => {
            if (err)
                return res.send(400);
            sql.query("INSERT INTO panel_users (pid, username, password) VALUES (?, ?, ?)", [
                pid,
                username,
                hashed
            ], (error, results) => {
                res.send(200);
            });
        });
    });
};
exports.default = authController;
//# sourceMappingURL=authController.js.map