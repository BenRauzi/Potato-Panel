import jwt from "jsonwebtoken";

const devController = (app, sql) => {
    // Fetch Dev Users 
    app.get('/dev/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM players WHERE developerlevel >= ?`, [minRank], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, coplevel, mediclevel, developerlevel, developerdept from players WHERE developerlevel >= ? LIMIT ?, ?`, [minRank, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Search Dev User (By Username)
    app.get('/dev/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM players WHERE (developerlevel > 0 AND name like concat('%', ?, '%')) order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, coplevel, mediclevel, developerlevel, developerdept from players WHERE (developerlevel > 0 AND name like concat('%', ?, '%')) order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Set Users Developer Whitelist Level
    app.post('/dev/setLevel', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET developerlevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        });
    });

    // Set Users Developer Department Level
    app.post('/dev/setDepartment', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET developerdept = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        });
    });
};

export default devController;