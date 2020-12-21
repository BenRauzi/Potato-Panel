import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from 'cors';

import rconController from "./controllers/rconController";
import authController from "./controllers/authController";

import { sql } from "./services/sqlService";
import { rCon } from "./services/rconService";
import dotenv from 'dotenv';

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
// app.use(cors({
//     origin: process.env.ORIGIN,
//     credentials: true
// }));
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))


app.use('/', router); 
router.all(process.env.ORIGIN, cors());

const RCON_API_PORT = process.env.RCON_API_PORT || 9000;
app.listen(RCON_API_PORT, () => {
    console.log("API Online!");
});

dotenv.config();

// middlewares


// init controllers

rconController(router, rCon, sql);
authController(router, sql);

export default app;