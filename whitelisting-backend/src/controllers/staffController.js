const staffController = (app, sql) => {
    // Fetch Staff Users 
    app.get('/staff/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const minRank = parseInt(req.query.mR) || 1; // Minimum Rank

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT username, adminLevel, copLevel, emsLevel from panel_users WHERE adminLevel >= ? LIMIT ?, ?`, [minRank, startingPoint, count] , (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })

    // Fetch Staff User
    app.get('/staff/user', (req, res) => {
        const uname = req.query.uname; // Players Username
        if(uname === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, pid, username, adminLevel, copLevel, emsLevel from panel_users WHERE username like concat('%', ?, '%') order by username like concat(@?, '%') desc, ifnull(nullif(instr(username, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(username, @?), 0), 99999),username`, [uname, uname, uname, uname], (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })
};

export default staffController;