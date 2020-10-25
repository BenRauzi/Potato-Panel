import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";

import { hash, compare } from "bcrypt";

const authController = (app, sql) => {
    app.post('/auth/login', async (req,res)=>{
        // get username from request's body, eg. from login form
        const body = req.body;

        const { username, password } = body
        console.log(`SELECT * from panel_users WHERE username = ${username}`)
        sql.query("SELECT * from panel_users WHERE username = ?", [
            username
        ], (error, result) => {
            if(error) console.log(error)
            if(result.length == 0) return res.sendStatus(401)
            
            compare(password, result[0].password, (err, isValid) => {
                if(isValid === true) {
                    const token = jwt.sign({user:username, pid: result[0].pid}, process.env.JWT_SECRET)
                    // save token in cookie
                    res.cookie('authcookie',token,{maxAge:1000*60*60,httpOnly:true})

                    res.send(result[0])
                } else {
                    res.sendStatus(401)
                }
            })
        })
    })

    app.get('/auth/logout', checkToken, (req, res) => {
        res.clearCookie("authcookie");
        res.sendStatus(200)
    })

    app.post('/auth/user/create', (req, res) => {

        const body = req.body;
        const { pid, username, password } = body;
        const hashedPassword = hash(password, 10,(err, hashed) => {
            if(err) return res.send(400)
            sql.query("INSERT INTO panel_users (pid, username, password) VALUES (?, ?, ?)", [
                pid,
                username,
                hashed
            ], (error, results) => {
                res.send(200)
            })
        })
    })

    app.get('/auth/verifyToken', checkToken, (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(err){
                res.clearCookie("authCookie");
                res.sendStatus(403)
            }
            else if(data.pid){ 
                console.log(`SELECT * from panel_users WHERE pid = ${data.pid}`)
                sql.query('SELECT * from panel_users WHERE pid = ?', [
                    data.pid
                ], (err, result) => {
                    console.log(result)
                    if(err){
                        res.sendStatus(403)
                    } else {
                        res.send(result[0])
                    }
                })
            }
        })
    })
}

export default authController;