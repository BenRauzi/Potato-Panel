import jwt from "jsonwebtoken";

export function checkToken (req, res, next) {
    // get authcookie from request
    const authcookie = req.cookies.authcookie

    // verify token which is in cookie value
    jwt.verify(authcookie, process.env.JWT_SECRET,(err,data)=>{
        if(err){
            res.clearCookie("authcookie")
            res.sendStatus(403)
        }
        else if(data.user){ 
            req.user = data.user
            next()
        }
    })
}

export default {
    checkToken
}