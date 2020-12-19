const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");

const { hash, compare } = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const authController = (app, sql, sqlAsync) => {
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
            if(error) return console.log(error)
            if(result.length === 0) return res.sendStatus(401);
            // console.log(result[0].password, password)
            compare(password, result[0].password, (err, isValid) => {
                // console.log(isValid)
                const { pid, copLevel, copWhitelisting, emsLevel, emsWhitelisting, adminLevel} = result[0];
                if(isValid === true) {
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
                    res.cookie('authcookie',token,{maxAge:1000*60*60*60,httpOnly:true, domain: process.env.DOMAIN, path: '/'});

                    res.send({...result[0], password: undefined});
                } else {
                    res.sendStatus(401);
                };
            }); 
        });
    });

    app.get('/auth/logout', checkToken, (req, res) => {
        res.clearCookie("authcookie", {maxAge:1000*60*60*60, httpOnly:true, domain: process.env.DOMAIN, path: '/'});
        res.sendStatus(200);
    });

    app.post('/auth/user/create', checkToken, (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 5) return res.sendStatus(401); // Senior Admin+
            const body = req.body;
            const { pid, username, password } = body;
            const hashedPassword = hash(password, 10,(err, hashed) => {
                if(err) return res.sendStatus(400)
                
                sql.query("INSERT INTO panel_users (pid, username, password) VALUES (?, ?, ?)", [
                    pid,
                    username,
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