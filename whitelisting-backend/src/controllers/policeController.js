const policeController = (app, sql) => {
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
            })
        })
    })

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
        })
    })

    // Fetch Police User
    app.get('/police/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, name, coplevel, copdept, cop_licenses, cop_gear, cop_stats, last_seen from players WHERE pid = ?`, [pid] , (err, result) => {
            if(err) res.sendStatus(400);
            res.send(result);
        })
    })

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
            })
        })
    })

    // Set Users Police Whitelist Level
    app.post('/police/setLevel', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET coplevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            console.log(err);
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Set Users Police Department
    app.post('/police/setDepartment', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET copdept = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            console.log(err);
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })
};

export default policeController;