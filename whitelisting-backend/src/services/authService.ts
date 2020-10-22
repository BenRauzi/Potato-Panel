import { NextFunction } from "express";
import jwt from "jsonwebtoken";

function checkToken (req, res, next: NextFunction   ) {
    // get authcookie from request
    const authcookie = req.cookies.authcookie

    // verify token which is in cookie value
    jwt.verify(authcookie, process.env.JWT_SECRET,(err,data)=>{
        if(err){
            res.sendStatus(403)
        }
        else if(data.user){
            req.user = data.user
            next()
        }
    })
}

export {
    checkToken
};