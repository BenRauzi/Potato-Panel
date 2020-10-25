const userController = (app, sql) => {
    // Fetch Generic Users 
    app.get('/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT uid, name, pid, exp_level, cash, bankacc from players LIMIT ?, ?`, [startingPoint, count] , (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })

    // Fetch User
    app.get('/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, name, aliases, exp_level, cash, bankacc, adminlevel, coplevel, copdept, mediclevel, medicdept, donorlevel, civ_licenses, cop_licenses, med_licenses, civ_gear, cop_gear, med_gear, civ_stats, cop_stats, med_stats, arrested, blacklist, civ_alive, civ_position, insert_time, last_seen, jail_time from players WHERE pid = ?`, [pid] , (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })

    // Fetch Cop User
    app.get('/police/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, name, coplevel, copdept, cop_licenses, cop_gear, cop_stats, last_seen from players WHERE pid = ?`, [pid] , (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })

    // Fetch Medic User
    app.get('/medic/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);

        sql.query(`SELECT uid, name, mediclevel, medicdept, med_licenses, med_gear, med_stats, last_seen from players WHERE pid = ?`, [pid] , (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })
}

export default userController;