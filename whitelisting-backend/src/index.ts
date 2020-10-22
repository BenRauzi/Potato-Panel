import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';


import { Request, Response, NextFunction  } from 'express';
import { nextTick } from "process";


const app = express();

dotenv.config();

// middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())

// listen
app.listen(9000, () => {
    console.log("API Online!");
});

function checkToken (req, res, next: NextFunction   ) {
    // get authcookie from request
    const authcookie = req.cookies.authcookie
    console.log(authcookie)

    // verify token which is in cookie value
    jwt.verify(authcookie,"secret_key",(err,data)=>{
        if(err){
            res.sendStatus(403)
        }
        else if(data.user){
            console.log(1)
        req.user = data.user
        next()
        }
    })
}

app.get('/test', (req, res) => {

    console.log(process.env.PORT)
    res.send({number: 10})

})

interface Test {
    username: string;
    password: string;
}
app.post('/auth/login', (req: Request,res)=>{
    // get username from request's body, eg. from login form
    const body: Test = req.body;
    const {password} = body
    const username = req.body.username
    console.log(password)
    // if(password !== "test") return res.send(403)

    const token = jwt.sign({user:username},'secret_key')
    // save token in cookie
    res.cookie('authcookie',token,{maxAge:900000,httpOnly:true})

    res.sendStatus(200)
})

app.get('/api', checkToken , (req,res)=>{
    /*if checkToken function succeed, api reach this block
    you can do whatever you want, also you can access to req.user      which sent from checkToken function
    */

    res.send("Test")
})