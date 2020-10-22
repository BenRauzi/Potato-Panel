import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authController from "./controllers/authController";

import { checkToken } from "./services/authService";

import sql from "./services/sqlService";

const app = express();

dotenv.config();

// middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())

// listen

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log("API Online!");
});

app.get('/api', checkToken , (req,res)=>{
    /*if checkToken function succeed, api reach this block
    you can do whatever you want, also you can access to req.user      which sent from checkToken function
    */

    res.send("Test")
})

// init controllers
authController(app, sql)