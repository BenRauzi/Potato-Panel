const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const { sql, connectionAsync } = require("./services/sqlService")
const policeController = require("./controllers/policeController");
const medicController = require("./controllers/medicController");
const staffController = require("./controllers/staffController");
const devController = require("./controllers/devController");
const vehicleController = require("./controllers/vehicleController");
const housesController = require("./controllers/housesController");
const experienceController = require("./controllers/experienceController");

const serverless = require("serverless-http");

const app = express();

dotenv.config();

// middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: `${process.env.ORIGIN || "http://localhost:3000"}`,
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
authController(app, sql, connectionAsync);
userController(app, sql, connectionAsync);
policeController(app, sql, connectionAsync);
medicController(app, sql, connectionAsync);
staffController(app, sql, connectionAsync);
devController(app, sql, connectionAsync);
vehicleController(app, sql, connectionAsync);
housesController(app, connectionAsync);
experienceController(app, connectionAsync);

module.exports.handler = serverless(app);
