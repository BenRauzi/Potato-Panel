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

module.exports = app;