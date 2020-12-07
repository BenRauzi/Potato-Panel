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
const webController = require("./controllers/webController");
const casesController = require("./controllers/casesController");

const serverless = require("serverless-http");

const app = express();

dotenv.config();

const router = express.Router();


// middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: `${process.env.ORIGIN || "http://localhost:3000"}`,
    credentials: true
}));

app.use('/api', router);  // path must route to lambda

router.get('/test' , (req,res)=>{
    res.send("asd");
})

// init controllers
authController(router, sql, connectionAsync);
userController(router, sql, connectionAsync);
policeController(router, sql, connectionAsync);
medicController(router, sql, connectionAsync);
staffController(router, sql, connectionAsync);
devController(router, sql, connectionAsync);
vehicleController(router, sql, connectionAsync);
housesController(router, connectionAsync);
experienceController(router, connectionAsync);
webController(router, connectionAsync);
casesController(router, connectionAsync);

module.exports = app;
module.exports.handler = serverless(app);
