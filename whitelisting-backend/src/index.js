import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authController from "./controllers/authController";
import userController from "./controllers/userController";

import sql, { connectionAsync as sqlAsync} from "./services/sqlService";
import policeController from "./controllers/policeController";
import medicController from "./controllers/medicController";
import staffController from "./controllers/staffController";
import devController from "./controllers/devController";
import vehicleController from "./controllers/vehicleController";
import housesController from "./controllers/housesController";

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
authController(app, sql, sqlAsync);
userController(app, sql, sqlAsync);
policeController(app, sql, sqlAsync);
medicController(app, sql, sqlAsync);
staffController(app, sql, sqlAsync);
devController(app, sql, sqlAsync);
vehicleController(app, sql, sqlAsync);
housesController(app, sqlAsync);