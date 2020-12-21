const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rconController = require("./controllers/rconController");
const authController = require("./controllers/authController");

const { sql } = require("./services/sqlService");
const { rCon } = require("./services/rconService");
const dotenv = require('dotenv');

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log("API Online!");
});

dotenv.config();

// middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: `${process.env.ORIGIN || "http://localhost:9000"}`,
    credentials: true
}));
// init controllers

app.use('/', router);  // path must route to lambda

rconController(router, rCon, sql);
authController(router, sql);

module.exports = app;