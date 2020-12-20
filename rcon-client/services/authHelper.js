const { compare } = require('bcrypt');
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

const validatePass = (password, hashedPassword) => {
    return new Promise((resolve, reject) => {
        compare(password, hashedPassword, (err, isValid) => {
            if(err) return reject(err)
            if(isValid === true) {
                resolve(true);
            } else {
               reject("Unauthorised");
            };
        });
    })
}

module.exports = {
    jwtVerify,
    validatePass
}