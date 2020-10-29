import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";
import { hash } from "bcrypt";

const medicController = (app, sql, sqlAsync) => {
    // Fetch Medic Users 
    app.get('/medic/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM players WHERE medicLevel >= ?`, [minRank], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, mediclevel, medicdept from players WHERE medicLevel >= ? LIMIT ?, ?`, [minRank, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Fetch Medic Department Users
    app.get('/medic/department', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank
        const department = parseInt(req.query.d) || 0; // Selected Department

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT uid, name, pid, mediclevel, medicdept from players WHERE (medicLevel >= ? AND medicdept = ?) LIMIT ?, ?`, [minRank, department, startingPoint, count] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.send(result);
        });
    });

    // Fetch Medic User
    app.get('/medic/user', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 1 && data.emsLevel === 0) return res.sendStatus(401); // Trial Staff+ AND Medic Whitelisting Access

            const pid = req.query.pid; // Players ID
            if(pid === undefined) return res.sendStatus(404);

            sql.query(`SELECT uid, name, mediclevel, medicdept, med_licenses, med_gear, med_stats, last_seen from players WHERE pid = ?`, [pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.send(result);
            });
        });
    });

    // Search Medic User (By Username)
    app.get('/medic/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM players WHERE (mediclevel > 0 AND name like concat('%', ?, '%')) order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, mediclevel, medicdept from players WHERE (mediclevel > 0 AND name like concat('%', ?, '%')) order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    const hasPermission = async (adminsPID, usersPID, newMedicLevel) => {
        // Gather Admin Users Data
        try {
            const adminUserResult = await sqlAsync.awaitQuery("SELECT panel_users.adminLevel, players.mediclevel FROM panel_users INNER JOIN players ON panel_users.pid = players.pid WHERE players.pid = ?", [adminsPID]);
            const userResult = await sqlAsync.awaitQuery("SELECT mediclevel FROM players WHERE players.pid = ?", [usersPID]);
            const adminsStaffLevel = adminUserResult[0].adminLevel;
            const adminsMedicLevel = adminUserResult[0].mediclevel;
            const usersMedicLevel = userResult[0].mediclevel;

            if(adminsMedicLevel >= 8 && newMedicLevel < adminsMedicLevel) {
                // Whitelist user
                return true;
            } else {
                if (adminsStaffLevel < 2) return false // Sorry you cannot whitelist
                if (adminsStaffLevel === 2 && newMedicLevel > 6) return false // Moderators can't whitelist users higher than level 6
                if (adminsStaffLevel === 3 && newMedicLevel > 9) return false // Administrators can't whitelist users higher than level 9
                
                // Whitelist
                return true;
            };
        } catch (error) {
            return false;
        };
    };

    // Set Users Medic Whitelist Level
    app.post('/medic/setLevel', checkToken, async (req, res) => {
        const body = req.body;
        const { username, pid, level } = body;
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err,data)=>{

            const permission = await hasPermission(data.pid, pid, level);
            if(!permission) return res.sendStatus(401);

            if(data.adminLevel < 3 && data.pid === pid) return res.sendStatus(403); // Can't edit your own medic rank unless you are Admin+

            try {

                // Check if user already has an account on the panel
                const checkUserHasPanelAccount = await sqlAsync.awaitQuery("SELECT COUNT(*) FROM panel_users WHERE pid = ?", [pid]);

                if(checkUserHasPanelAccount[0]["COUNT(*)"] === 0) {
                    // Check if user is getting whitelisted to Lieutenant+, if so create a panel account for them
                    if(level >= 8) {
                        const generatedPassword = (Math.floor(Math.random() * 999999) + 100000).toString();
                        const hashedPassword = hash(generatedPassword, 10, async (err, hashed) => {
                            const createAccount = await sqlAsync.awaitQuery("INSERT INTO panel_users (pid, username, password, adminLevel, copLevel, emsLevel) VALUES (?, ?, ?, 0, 0, ?)", [pid, username, hashed, level]);
                            res.send({pass : generatedPassword});
                        });
                    };
                } else {
                    const updatePanelUsersPoliceLevel = await sqlAsync.awaitQuery("UPDATE panel_users SET medicLevel = ? WHERE pid = ?", [...(level === 0 ? [0] : level < 9 ? [1] : [2]), pid]);
                };
                
                const updateIngamePoliceLevel = await sqlAsync.awaitQuery("UPDATE players SET mediclevel = ? WHERE pid = ?", [level, pid]);
                res.send({});

            } catch (error) {
                return false;
            };
        });
    });

    /* OLD SET WHITELIST LEVEL
    // Set Users Medic Whitelist Level
    app.post('/medic/setLevel', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            const body = req.body;
            const { pid, level } = body;
            if ((data.adminLevel < 2  && data.emsLevel === 0)) return res.sendStatus(401); // Moderator+ OR Medic Whitelisting Access
            if (data.adminLevel < 3 && level >= data.emsWhitelisting) return res.sendStatus(401); // Can't whitelist higher than ur own medic level, unless you are Admin+
            
            sql.query(`UPDATE players SET mediclevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.sendStatus(200);
            });
        });
    });
    */

    // Set Users Medic Department
    app.post('/medic/setDepartment', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            if(data.adminLevel < 2 && data.emsLevel === 8) return res.sendStatus(401); // Moderator+ AND Medic Whitelisting Access

            const body = req.body;
            const { pid, level } = body;
            sql.query(`UPDATE players SET medicdept = ? WHERE pid = ?`, [level, pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.sendStatus(200);
            });
        });
    });
};

export default medicController;