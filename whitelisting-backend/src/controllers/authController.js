import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";

import { hash, compare } from "bcrypt";

const authController = (app, sql) => {

    app.post('/auth/login', async (req,res)=>{
        // get username from request's body, eg. from login form
        const body = req.body;

        const { username, password } = body

        sql.query("SELECT * from panel_users WHERE username = ?", [
            username
        ], (error, result) => {
            compare(password, result[0].password, (err, isValid) => {
                if(isValid === true) {
                    const token = jwt.sign({user:username}, process.env.JWT_SECRET)
                    // save token in cookie
                    res.cookie('authcookie',token,{maxAge:900000,httpOnly:true})

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

    // app.get('/validate', (req, res) => {
    //     sql.query("SELECT * FROM panel_users WHERE pid = '76561198049947102'", [
    //         "76561198049947102",
    //     ], (error, results) => {
    //         const oof = compare("test", results[0].password, (err, isValid) => {
    //             console.log(isValid)
    //         })
    //         res.send(results)
    //     });

    // })

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
}

export default authController;