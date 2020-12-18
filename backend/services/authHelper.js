const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");

dotenv.config();

const jwtVerify = (cookie) => {
    return new Promise((resolve, reject) => {
        jwt.verify(cookie, process.env.JWT_SECRET, async (err, data) => {
            if(err) return reject(err)
            resolve(data)
        })
    })
}

module.exports = {
    jwtVerify
}