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


    const hasPermission = async (adminsPID, usersPID, newPoliceLevel) => {
        // Gather Admin Users Data
        try {
            const adminUserResult = await sqlAsync.awaitQuery("SELECT panel_users.adminLevel, players.coplevel FROM panel_users INNER JOIN players ON panel_users.pid = players.pid WHERE players.pid = ?", [adminsPID]);
            const userResult = await sqlAsync.awaitQuery("SELECT coplevel FROM players WHERE players.pid = ?", [usersPID]);
            const adminsStaffLevel = adminUserResult[0].adminLevel;
            const adminsPoliceLevel = adminUserResult[0].coplevel;
            const usersPoliceLevel = userResult[0].coplevel;

            if(adminsPoliceLevel >= 6 && newPoliceLevel < adminsPoliceLevel) {
                // Whitelist user
                return true;
            } else {
                if (adminsStaffLevel < 2) return false // Sorry you cannot whitelist
                if (adminsStaffLevel === 2 && newPoliceLevel > 5) return false // Moderators can't whitelist users higher than level 5
                if (adminsStaffLevel === 3 && newPoliceLevel > 7) return false // Administrators can't whitelist users higher than level 7
                
                // Whitelist
                return true;
            };
        } catch (error) {
            return false;
        };
    };


    // Set Users Police Whitelist Level
    app.post('/police/setLevel', checkToken, async (req, res) => {
        const body = req.body;
        const { username, pid, level } = body;
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err,data)=>{

            const permission = await hasPermission(data.pid, pid, level);
            if(!permission) return res.sendStatus(401);

            if(data.adminLevel < 3 && data.pid === pid) return res.sendStatus(403); // Can't edit your own police rank unless you are Admin+


            try {

                // Check if user already has an account on the panel
                const checkUserHasPanelAccount = await sqlAsync.awaitQuery("SELECT COUNT(*) FROM panel_users WHERE pid = ?", [pid]);

                if(checkUserHasPanelAccount[0]["COUNT(*)"] === 0) {
                    // Check if user is getting whitelisted to Lieutenant+, if so create a panel account for them
                    if(level >= 6) {
                        const generatedPassword = (Math.floor(Math.random() * 999999) + 100000).toString();
                        const hashedPassword = hash(generatedPassword, 10, async (err, hashed) => {
                            const createAccount = await sqlAsync.awaitQuery("INSERT INTO panel_users (pid, username, password, adminLevel, copLevel, emsLevel) VALUES (?, ?, ?, 0, ?, 0)", [pid, username, hashed, level]);
                            res.send({pass : generatedPassword});
                        });
                    };
                } else {
                    const updatePanelUsersPoliceLevel = await sqlAsync.awaitQuery("UPDATE panel_users SET copLevel = ? WHERE pid = ?", [...(level === 0 ? [0] : level < 8 ? [1] : [2]), pid]);
                };
                
                const updateIngamePoliceLevel = await sqlAsync.awaitQuery("UPDATE players SET coplevel = ? WHERE pid = ?", [level, pid]);
                res.send({});

            } catch (error) {
                return false;
            };
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