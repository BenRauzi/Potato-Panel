"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function checkToken(req, res, next) {
    // get authcookie from request
    const authcookie = req.cookies.authcookie;
    // verify token which is in cookie value
    jsonwebtoken_1.default.verify(authcookie, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            res.sendStatus(403);
        }
        else if (data.user) {
            req.user = data.user;
            next();
        }
    });
}
exports.checkToken = checkToken;
//# sourceMappingURL=authService.js.map