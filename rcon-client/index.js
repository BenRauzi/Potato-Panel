import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from 'cors';

import rconController from "./controllers/rconController";
import authController from "./controllers/authController";

import { getRcon } from "./services/rconService";
import dotenv from 'dotenv';

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())

var whitelist = process.env.ALL_ORIGINS.split(",")
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

app.use(cors(corsOptions))

app.use('/', router); 
router.all(process.env.ORIGIN, cors());

const RCON_API_PORT = process.env.RCON_API_PORT || 9000;
app.listen(RCON_API_PORT, () => {
    console.log("API Online!");
});

dotenv.config();

// init controllers

rconController(router, getRcon);
authController(router);

export default app;