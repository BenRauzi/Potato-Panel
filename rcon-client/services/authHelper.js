import { compare } from 'bcrypt';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

export const jwtVerify = (cookie) => {
    return new Promise((resolve, reject) => {
        jwt.verify(cookie, process.env.JWT_SECRET, async (err, data) => {
            if(err) return reject(err)
            resolve(data)
        })
    })
}

export const validatePass = (password, hashedPassword) => {
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

export default {
    jwtVerify,
    validatePass
}