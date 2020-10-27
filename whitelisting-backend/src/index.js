import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authController from "./controllers/authController";
import userController from "./controllers/userController";

import sql from "./services/sqlService";
import policeController from "./controllers/policeController";
import medicController from "./controllers/medicController";
import staffController from "./controllers/staffController";
import devController from "./controllers/devController";

const app = express();

dotenv.config();

// middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


// listen

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log("API Online!");
});

app.get('/api' , (req,res)=>{
    res.sendStatus(200);
})

// init controllers
authController(app, sql);
userController(app, sql);
policeController(app, sql);
medicController(app, sql);
staffController(app, sql);
devController(app, sql);