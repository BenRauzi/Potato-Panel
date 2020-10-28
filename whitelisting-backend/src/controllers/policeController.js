import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";
import { hash } from "bcrypt";

const policeController = (app, sql, sqlAsync) => {
    // Fetch Police Users 
    app.get('/police/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM players WHERE copLevel >= ?`, [minRank], (err, countR) => {
            if(err) res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, coplevel, copdept from players WHERE copLevel >= ? LIMIT ?, ?`, [minRank, startingPoint, count], (err, result) => {
                if(err) res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Fetch Police Department Users
    app.get('/police/department', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank
        const department = parseInt(req.query.d) || 0; // Selected Department

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT uid, name, pid, coplevel, copdept from players WHERE (copLevel >= ? AND copdept = ?) LIMIT ?, ?`, [minRank, department, startingPoint, count] , (err, result) => {
            if(err) res.sendStatus(400);
            res.send(result);
        });
    });

    // Fetch Police User
    app.get('/police/user', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 1 && data.copLevel === 0) return res.sendStatus(401); // Trial Staff+ AND Cop Whitelisting Access

            const pid = req.query.pid; // Players ID
            if(pid === undefined) return res.sendStatus(404);

            sql.query(`SELECT uid, name, coplevel, copdept, cop_licenses, cop_gear, cop_stats, last_seen from players WHERE pid = ?`, [pid] , (err, result) => {
                if(err) res.sendStatus(400);
                res.send(result);
            });
        });
    });

    // Search Police User (By Username)
    app.get('/police/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM players WHERE (copLevel > 0 AND name like concat('%', ?, '%')) order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, coplevel, copdept from players WHERE (copLevel > 0 AND name like concat('%', ?, '%')) order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });


    const hasPermission = (adminsStaffLevel, adminsPoliceLevel, usersPoliceLevel, newPoliceLevel) => {
        console.log("Started");

        if(adminsPoliceLevel >= 6 && newPoliceLevel < adminsPoliceLevel) {
            // Whitelist user
            console.log("User whitelisted");
            return true;
        } else {
            if (adminsStaffLevel < 2) return false // Sorry you cannot whitelist
            if (adminsStaffLevel === 2 && newPoliceLevel > 5) return false // Moderators can't whitelist users higher than level 5
            if (adminsStaffLevel === 3 && newPoliceLevel > 7) return false // Administrators can't whitelist users higher than level 7
            
            // Whitelist
            return true;
        };
    };


    // Set Users Police Whitelist Level
    app.post('/police/setLevel', checkToken, (req, res) => {
        const body = req.body;
        const { username, pid, level } = body;
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{

        // Gather Admin Users Data
        sql.query("SELECT panel_users.adminLevel, players.coplevel FROM panel_users INNER JOIN players ON panel_users.pid = players.pid WHERE players.pid = ?", [data.pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            const adminsStaffLevel = result[0].adminLevel;
            const adminsPoliceLevel = result[0].coplevel;

            // Gather Users Data
            sql.query("SELECT coplevel FROM players WHERE players.pid = ?", [pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                const usersPoliceLevel = result[0].coplevel;

                console.log("Admins Staff Level: " + adminsStaffLevel);
                console.log("Admins Police Level: " + adminsPoliceLevel);
                console.log("Users Police Level: " + usersPoliceLevel);

                console.log(hasPermission(adminsStaffLevel, adminsPoliceLevel, usersPoliceLevel, level));
            });
        });

            return res.sendStatus(301);




            //if ((data.adminLevel < 2  && data.copLevel === 0)) return res.sendStatus(401); // Moderator+ OR Cop Whitelisting Access
            //if (data.adminLevel < 3 && level >= data.copWhitelisting) return res.sendStatus(401); // Can't whitelist higher than ur own cop level, unless you are Admin+

            if (data.adminLevel < 3 && data.pid === pid) return res.sendStatus(403); // Can't edit your own police rank unless you are a staff Admin+

            // Moderator (2): -> Sgt (5)
            // Administrator (3): -> Cpt (7)
            // Senior Admin (4): -> Higher
            // Lieutenant+ (6)

            if(data.adminLevel < 2 && data.copWhitelisting < 6) return res.sendStatus(401); // Can't whitelist anyone if you aren't a staff Moderator+ or police Lieutenant+
            
            if (data.adminLevel === 2 && level > 5) return res.sendStatus(401);
            if (data.adminLevel === 3 && level > 7) return res.sendStatus(401);
            if (data.adminLevel < 2 && data.copWhitelisting <= level) return res.sendStatus(401);

            //sql.query(`UPDATE players SET coplevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            //    if(err) return res.sendStatus(400);
            //    res.sendStatus(200);
            //});

            sql.query("SELECT COUNT(*) FROM panel_users WHERE pid = ?", [pid], (err, result) => {
                if(result[0]["COUNT(*)"] === 0) {
                    const pass = (Math.floor(Math.random() * 999999) + 100000).toString();
                    const hashedPassword = hash(pass, 10,(err, hashed) => {
                        sql.query("INSERT INTO panel_users (pid, username, password, adminLevel, copLevel, emsLevel) VALUES (?, ?, ?, 0, ?, 0)", [pid, username, hashed, level], (err, result) => {
                            if(err) return res.sendStatus(400);
                            res.send({pass : pass});
                        });
                    });
                } else {
                    // USER ALREADY HAS PANEL ACCOUNT --> CHANGE PANEL ACCOUNT STAFF RANK

                    sql.query("SELECT coplevel FROM players WHERE pid = ?", [pid] , (err, result) => {
                        if(err) return res.sendStatus(400);
                        const usersCurLevel = result[0].coplevel;

                        // First check if the user is allowed to change their rank (eg. admins can't edit directors staff rank)
                        if ((data.copWhitelisting !== 9 && data.adminLevel < 2) && (data.copWhitelisting <= usersCurLevel)) return res.sendStatus(401);

                        sql.query(`UPDATE players SET coplevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
                            if(err) return res.sendStatus(400);
                            res.sendStatus(200);
                        });
                    });
                };
                // edit ingame admin level (SA+ get level 2)          ${level === 3 ? 1 : level > 3 ? 2 : 0
                sql.query(`UPDATE panel_users SET copLevel = ? WHERE pid = ?`, [...(level === 0 ? [0] : level < 8 ? [1] : [2]), pid] , (err, result) => {
                    if(err) return console.log(err);
                    //res.sendStatus(200);
                });
            }); 
        });
    });

    // Set Users Police Department
    app.post('/police/setDepartment', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 2 && data.copLevel === 0) return res.sendStatus(401); // Moderator+ AND Cop Whitelisting Access

            const body = req.body;
            const { pid, level } = body;
            sql.query(`UPDATE players SET copdept = ? WHERE pid = ?`, [level, pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.sendStatus(200);
            });
        });
    });
};

export default policeController;