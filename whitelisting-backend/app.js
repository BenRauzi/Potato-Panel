const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");

//middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())

//listen
app.listen(9000, () => {
    console.log("connected!");
});

function checkToken (req, res) {
    //get authcookie from request
    const authcookie = req.cookies.authcookie
    
    //verify token which is in cookie value
    jwt.verify(authcookie,"secret_key",(err,data)=>{
        if(err){
            res.sendStatus(403)
        } 
        else if(data.user){
        req.user = data.user
            next()
        }
    })
}

app.get('/test', (req, res) => {
    res.send({number: 10})
})

app.post('/auth/login', (req,res)=>{
    //get username from request's body, eg. from login form
    let username = req.body.username
    /*
    check username and password correctness here,
    if they matched then:
    */
    //create jwt token
    const token = jwt.sign({user:username},'secret_key')
    //save token in cookie
    res.cookie('authcookie',token,{maxAge:900000,httpOnly:true}) 
})

app.get('/api', checkToken , (req,res)=>{
    /*if checkToken function succeed, api reach this block
    you can do whatever you want, also you can access to req.user      which sent from checkToken function
    */
})