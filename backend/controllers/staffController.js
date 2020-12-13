const jwt = require("jsonwebtoken");
const { checkToken } = require( "../services/authService");
const { hash } = require("bcrypt")

function randomInt(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const staffController = (app, sql, sqlAsync) => {
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

        sql.query(`SELECT COUNT(*) FROM panel_users WHERE (adminLevel > 0 AND username like concat('%', ?, '%')) order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE (adminLevel > 0 AND username like concat('%', ?, '%')) order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
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
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if (data.pid === pid) return res.sendStatus(403); // Can't edit your own staff rank
            if(data.adminLevel < 4) return res.sendStatus(401); // Senior Admin+

            // Prevent being able to change someones staff rank to the same as yours, or higher UNLESS you are a director :)
            if (data.adminLevel !== 7 && (data.adminLevel <= level)) return res.sendStatus(401);

            sql.query("SELECT COUNT(*) FROM panel_users WHERE pid = ?", [pid], (err, result) => {
                if(result[0]["COUNT(*)"] === 0) {
                    
                    let pass = ""
                    for(let i = 0; i < 12; i++) {
                        pass = pass + String.fromCharCode(randomInt(40, 124))
                    }

                    hash(pass, 10,(err, hashed) => {
                        sql.query("INSERT INTO panel_users (pid, username, password, adminLevel, copLevel, emsLevel) VALUES (?, ?, ?, ?, 0, 0)", [pid, username, hashed, level], (err, result) => {
                            if(err) return res.sendStatus(400);
                            res.send({pass : pass});
                        });
                    });
                } else {
                    // USER ALREADY HAS PANEL ACCOUNT --> CHANGE PANEL ACCOUNT STAFF RANK

                    sql.query("SELECT adminLevel FROM panel_users WHERE pid = ?", [pid] , (err, result) => {
                        if(err) return res.sendStatus(400);
                        const usersCurLevel = result[0].adminLevel;

                        // First check if the user is allowed to change their rank (eg. admins can't edit directors staff rank)
                        if (data.adminLevel !== 7 && (data.adminLevel <= usersCurLevel)) return res.sendStatus(401);

                        sql.query(`UPDATE panel_users SET adminlevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
                            if(err) return res.sendStatus(400);
                            res.send({});
                        });
                    });
                };
                // edit ingame admin level (SA+ get level 2)          ${level === 3 ? 1 : level > 3 ? 2 : 0}
                sql.query(`UPDATE players SET adminlevel = ? WHERE pid = ?`, [...(level === 3 ? [1] : level > 3 ? [2] : [0]), pid] , (err, result) => {
                    if(err) return console.log(err);
                    //res.sendStatus(200);
                });
            });     
        });
    });
};

module.exports = staffController;