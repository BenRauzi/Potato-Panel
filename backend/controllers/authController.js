const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");

const { hash, compare } = require("bcrypt");
const dotenv = require("dotenv");
const CryptoJS = require("crypto-js");

dotenv.config();

const authController = (app, sql, sqlAsync) => {
    // app.post('/auth/test', async (req, res) => {
    //     const { password } = req.body
    //     hash(password, 10,(err, hashed) => {
    //         if(err) return res.sendStatus(400)
            
    //        console.log(hashed)
    //     });
    // })
    app.post('/auth/login', async (req,res)=>{
        // get username from request's body, eg. from login form
        const body = req.body;

        const { username, password } = body

        try {
            const requests = await sqlAsync.awaitQuery(`SELECT COUNT(*) FROM auth_requests WHERE time > CURRENT_TIMESTAMP()- INTERVAL 1 HOUR AND username = ?`, [
                username
            ])
    
            const requestCount = requests[0]["COUNT(*)"];

            const refuseRequest = requestCount > 5

            console.log(`Authentication attempted on user account ${username} - ${req.headers['x-forwarded-for']} - ${refuseRequest ? "Unauthorised" : "Authorised"}`)

            await sqlAsync.awaitQuery("INSERT into auth_requests (username, ip, authorised) VALUES (?, ?, ?)", [
                username, 
                CryptoJS.AES.encrypt(req.headers['x-forwarded-for'], process.env.IP_SECRET).toString(), 
                refuseRequest ? 0 : 1
            ])
             
            if(refuseRequest) return res.sendStatus(429); 
        } catch(err) {
            console.log(err)
            console.log(`Authentication attempted on user account ${username} - ${req.headers['x-forwarded-for']} - Error`)

            return res.sendStatus(500)
        }
        
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
            if(error) return console.log(error)
            if(result.length === 0) return res.sendStatus(401);
            // console.log(result[0].password, password)
            compare(password, result[0].password, (err, isValid) => {
                // console.log(isValid)
                const { pid, copLevel, copWhitelisting, emsLevel, emsWhitelisting, adminLevel, name} = result[0];
                if(isValid === true) {
                    const token = jwt.sign({
                        user:username, 
                        name: name,
                        pid: pid,
                        copLevel: copLevel,
                        copWhitelisting: copWhitelisting,
                        emsLevel: emsLevel,
                        emsWhitelisting: emsWhitelisting,
                        adminLevel: adminLevel
                        
                    }, process.env.JWT_SECRET);
                    // save token in cookie

                    res.cookie('authcookie',token,{ domain: process.env.DOMAIN, path: '/', maxAge: 1000*60*60*60, httpOnly:true});

                    res.send({...result[0], password: undefined});
                } else {
                    res.sendStatus(401);
                };
            }); 
        });
    });

    app.post('/auth/logout', checkToken, (req, res) => {
        res.clearCookie('authcookie', { domain: process.env.DOMAIN, path: "/" })
        res.sendStatus(200);
    });

    app.post('/auth/user/create', checkToken, (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 5) return res.sendStatus(401); // Senior Admin+
            const body = req.body;
            const { pid, username, password } = body;
            const hashedPassword = hash(password, 10,(err, hashed) => {
                if(err) return res.sendStatus(400)
                
                const newUsername = username.replace(/ /g,'') + Math.floor(1000 + Math.random() * 9000)
                sql.query("INSERT INTO panel_users (pid, username, password) VALUES (?, ?, ?)", [
                    pid,
                    newUsername,
                    hashed
                ], (error, results) => {
                    res.sendStatus(200)
                });
            });
        });
    });

    //Create new User (Testing)

    // app.post('/auth/user/create-op', (req, res) => {
    //     const body = req.body;
    //     const { pid, username, password } = body;
        
    //     const hashedPassword = hash(password, 10,(err, hashed) => {
    //         console.log(password, hashed)
    //         if(err) return res.send(400)
    //         sql.query("INSERT INTO panel_users (pid, username, password) VALUES (?, ?, ?)", [
    //             pid,
    //             username,
    //             hashed
    //         ], (error, results) => {
    //             res.send(200)
    //         });
    //     });
    // });

    app.get('/auth/verifyToken', checkToken, (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(err){
                res.clearCookie("authCookie");
                res.sendStatus(403)
            } else if(data.pid){ 

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
                        

                        res.sendStatus(403);
                    } else {
                       
                        
                        const { pid, username, copLevel, adminLevel, emsLevel, 
                            copWhitelisting, emsWhitelisting 
                        } = result[0];

                        if(copLevel != data.copLevel || adminLevel != data.adminLevel || emsLevel != data.emsLevel
                            || copWhitelisting != data.copWhitelisting || emsWhitelisting != data.emsWhitelisting
                            ) {
                                res.clearCookie("authcookie");
                                
                                const token = jwt.sign({
                                    user:username, 
                                    pid: pid,
                                    copLevel: copLevel,
                                    copWhitelisting: copWhitelisting,
                                    emsLevel: emsLevel,
                                    emsWhitelisting: emsWhitelisting,
                                    adminLevel: adminLevel
                                    
                                }, process.env.JWT_SECRET);
                                // save token in cookie
                                res.cookie('authcookie',token,{maxAge:1000*60*60,httpOnly:true});
                            };
                        
                        res.send(result[0]);
                    };
                });
            };
        });
    });
};

module.exports = authController;