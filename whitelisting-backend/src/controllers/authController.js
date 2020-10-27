import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";

import { hash, compare } from "bcrypt";

const authController = (app, sql) => {
    app.post('/auth/login', async (req,res)=>{
        // get username from request's body, eg. from login form
        const body = req.body;

        const { username, password } = body
        sql.query(`SELECT panel_users.uid, panel_users.pid, panel_users.username, panel_users.password,
                    players.name,
                    panel_users.copLevel,
                    panel_users.adminLevel,
                    panel_users.emsLevel,
                    players.coplevel AS copWhitelisting,
                    players.mediclevel AS emsWhitelisting,
                    players.adminlevel AS adminWhitelisting,
                    players.developerlevel
                    from panel_users
                    INNER JOIN players ON players.pid = panel_users.pid
                    WHERE panel_users.username = ?`, [
            username
        ], (error, result) => {
            if(error) console.log(error)
            if(result.length == 0) return res.sendStatus(401)
            
            compare(password, result[0].password, (err, isValid) => {
                const { pid, copLevel, copWhitelisting, emsLevel, emsWhitelisting, adminLevel} = result[0]
                if(isValid === true) {
                    const token = jwt.sign({
                        user:username, 
                        pid: pid,
                        copLevel: copLevel,
                        copWhitelisting: copWhitelisting,
                        emsLevel: emsLevel,
                        emsWhitelisting: emsWhitelisting,
                        adminLevel: adminLevel
                        
                    }, process.env.JWT_SECRET)
                    // save token in cookie
                    res.cookie('authcookie',token,{maxAge:1000*60*60,httpOnly:true})

                    res.send({...result[0], password: undefined})
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

                sql.query(`SELECT panel_users.uid, panel_users.pid, panel_users.username,
                players.name,
                panel_users.copLevel,
                panel_users.adminLevel,
                panel_users.emsLevel,
                players.coplevel AS copWhitelisting,
                players.mediclevel AS emsWhitelisting,
                players.adminlevel AS adminWhitelisting,
                players.developerlevel
                from panel_users
                INNER JOIN players ON players.pid = panel_users.pid
                WHERE panel_users.pid = ?`, [
                    data.pid
                ], (err, result) => {
                    if(err){
                        

                        res.sendStatus(403)
                    } else {
                        res.clearCookie("authcookie");
                        
                        const { pid, username, copLevel, adminLevel, emsLevel, 
                            copWhitelisting, emsWhitelisting 
                        } = result[0] 

                        if(copLevel != data.copLevel || adminLevel != data.adminLevel || emsLevel != data.emsLevel
                            || copWhitelisting != data.copWhitelisting || emsWhitelisting != data.emsWhitelisting
                            ) {
                                const token = jwt.sign({
                                    user:username, 
                                    pid: pid,
                                    copLevel: copLevel,
                                    copWhitelisting: copWhitelisting,
                                    emsLevel: emsLevel,
                                    emsWhitelisting: emsWhitelisting,
                                    adminLevel: adminLevel
                                    
                                }, process.env.JWT_SECRET)
                                // save token in cookie
                                res.cookie('authcookie',token,{maxAge:1000*60*60,httpOnly:true})
                            }
                        
                        res.send(result[0])
                    }
                })
            }
        })
    })
}

export default authController;