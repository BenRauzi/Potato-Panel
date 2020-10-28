import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";
import { hash } from "bcrypt";

const staffController = (app, sql) => {
    // Fetch Staff Users 
    app.get('/staff/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM panel_users WHERE adminLevel >= ?`, [minRank], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE adminLevel >= ? LIMIT ?, ?`, [minRank, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Fetch Staff User
    app.get('/staff/user', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 1) return res.sendStatus(401); // Trial Staff+
            
            const pid = req.query.pid; // Players ID
            if(pid === undefined) return res.sendStatus(404);

            sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE pid = ?`, [pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.send(result);
            });
        });
    });

    // Search Staff User (By Username)
    app.get('/staff/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM panel_users WHERE username like concat('%', ?, '%') order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE username like concat('%', ?, '%') order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Change Users Admin Whitelist Level (In-Game)
    app.post('/admin/setLevel', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 4) return res.sendStatus(401); // Trial Staff+

            sql.query(`UPDATE players SET adminlevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.sendStatus(200);
            });
        });
    });

    // Change Users Admin Whitelist Level (Panel)  --> Senior Admins get admin level 2, rest get 1
    app.post('/admin/setLevelP', checkToken, (req, res) => {
        const body = req.body;
        const { username, pid, level } = body;
        console.log(username);
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 4) return res.sendStatus(401); // Trial Staff+

            // Check if user can change admin level, then make sure it's not higher than their own unless they are director
            

            sql.query("SELECT COUNT(*) FROM panel_users WHERE pid = ?", [pid], (err, result) => {
                if(result[0]["COUNT(*)"] === 0) {
                    const pass = (Math.floor(Math.random() * 999999) + 100000).toString();
                    const hashedPassword = hash(pass, 10,(err, hashed) => {
                        console.log(hashed);
                        sql.query("INSERT INTO panel_users (pid, username, password, adminLevel, copLevel, emsLevel) VALUES (?, ?, ?, ?, 0, 0)", [pid, username, hashed, level], (err, result) => {
                            console.log(err);
                            if(err) return res.sendStatus(400);
                            res.send({pass : pass});
                        });
                    });
                } else {
                    // edit ingame admin level (SA+ get level 2)          ${level === 3 ? 1 : level > 3 ? 2 : 0}
                    sql.query(`UPDATE players SET adminlevel = ? WHERE pid = ?`, [...(level === 3 ? [1] : level > 3 ? [2] : [0]), pid] , (err, result) => {
                        if(err) return res.sendStatus(400);
                        res.sendStatus(200);
                    });
                };


            });     


            //sql.query(`UPDATE panel_users SET adminlevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
//
            //    if(level > 1) {
            //        sql.query(`UPDATE player SET adminlevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
//
            //        });
            //    };
//
            //    if(err) return res.sendStatus(400);
            //    res.sendStatus(200);
            //});
        });
    });
};

export default staffController;