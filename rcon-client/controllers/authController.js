// Auth Controller for Testing

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validatePass } from "../services/authHelper";

dotenv.config();

const authController = (app, sql) => {
    return true
    app.post('/auth/login', async (req,res)=>{
        // get username from request's body, eg. from login form
        const body = req.body;

        const { username, password } = body
        console.log(`Authentication attempted on user account ${username} - ${req.headers['x-forwarded-for']}`)
        try {
            const result = await sql.awaitQuery(`SELECT panel_users.uid, panel_users.pid, panel_users.username, panel_users.password, players.name
            from panel_users
            INNER JOIN players ON players.pid = panel_users.pid
            WHERE panel_users.username = ?`, [ username ]);

            if(result.length === 0) return res.sendStatus(401);

            try {
                const isValidPass = await validatePass(password, result[0].password);
                const { pid, copLevel, copWhitelisting, emsLevel, emsWhitelisting, adminLevel} = result[0];

                if(isValidPass) {
                    const token = jwt.sign({
                        user:username, 
                        pid: pid,
                        copLevel: copLevel,
                        copWhitelisting: copWhitelisting,
                        emsLevel: emsLevel,
                        emsWhitelisting: emsWhitelisting,
                        adminLevel: adminLevel
                        
                    }, process.env.JWT_SECRET);

                    res.cookie('authcookie',token,{ domain: process.env.DOMAIN, path: '/', maxAge: 1000*60*60*60, httpOnly:true});

                    res.send({...result[0], password: undefined});
                } else {
                    return res.sendStatus(500)
                }
            } catch(err) {
                console.log(err)
                return res.sendStatus(500)
            }

        } catch(error) {
            if(error) console.log(error)
            res.sendStatus(500)
        }
    });
};

export default authController;