const medicController = (app, sql) => {
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
            })
        })
    })

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
        })
    })

    // Fetch Medic User
    app.get('/medic/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, name, mediclevel, medicdept, med_licenses, med_gear, med_stats, last_seen from players WHERE pid = ?`, [pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.send(result);
        })
    })

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
            })
        })
    })

    // Set Users Medic Whitelist Level
    app.post('/medic/setLevel', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET mediclevel = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Set Users Medic Department
    app.post('/medic/setDepartment', (req, res) => {
        const body = req.body;
        const { pid, level } = body;
        sql.query(`UPDATE players SET medicdept = ? WHERE pid = ?`, [level, pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })
};

export default medicController;