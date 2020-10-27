const staffController = (app, sql) => {
    // Fetch Staff Users 
    app.get('/staff/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM panel_users WHERE adminLevel >= ?`, [minRank], (err, countR) => {
            if(err) res.sendStatus(400);
            sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE adminLevel >= ? LIMIT ?, ?`, [minRank, startingPoint, count], (err, result) => {
                if(err) res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            })
        })
    })

    // Fetch Staff User
    app.get('/staff/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE pid = ?`, [pid] , (err, result) => {
            if(err) res.sendStatus(400);
            res.send(result);
        })
    })

    // Search Staff User (By Username)
    app.get('/staff/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM panel_users WHERE username like concat('%', ?, '%') order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) res.sendStatus(400);
            sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE username like concat('%', ?, '%') order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            })
        })
    })

    // Change Users Admin Whitelist Level (In-Game)
    app.post('/admin/setLevel', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET adminlevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })
};

export default staffController;