const userController = (app, sql) => {
    // Fetch Generic Users 
    app.get('/users', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered

        const startingPoint = (pageN - 1) * count;

        sql.query("SELECT COUNT(*) FROM players" , (err, countR) => {
            if(err) res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, exp_level, cash, bankacc, coplevel, mediclevel from players LIMIT ?, ?`, [startingPoint, count] , (err, result) => {
                if(err) res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            })
        })
    })

    // Fetch User
    app.get('/user', (req, res) => {
        const pid = req.query.pid; // Players ID
        if(pid === undefined) return res.sendStatus(404);
        sql.query(`SELECT uid, name, aliases, exp_level, cash, bankacc, adminlevel, coplevel, copdept, mediclevel, medicdept, donorlevel, civ_licenses, cop_licenses, med_licenses, civ_gear, cop_gear, med_gear, civ_stats, cop_stats, med_stats, arrested, blacklist, civ_alive, civ_position, insert_time, last_seen, jail_time from players WHERE pid = ?`, [pid] , (err, result) => {
            if(err) res.sendStatus(400);
            res.send(result);
        })
    })

    // Search User (By Username)
    app.get('/user/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;
    
        sql.query(`SELECT COUNT(*) FROM players WHERE name like concat('%', ?, '%') order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name`, [uname, uname, uname, uname, startingPoint, count], (err, countR) => {
            if(err) res.sendStatus(400);
            sql.query(`SELECT uid, name, pid, exp_level, cash, bankacc, coplevel, mediclevel from players WHERE name like concat('%', ?, '%') order by name like concat(@?, '%') desc, ifnull(nullif(instr(name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(name, @?), 0), 99999),name LIMIT ?, ?`, [uname, uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            })
        })
    })

    // Set Users Cash Amount
    app.post('/user/setCash', (req, res) => {
        const body = req.body;
        const { pid, amount } = body;
        sql.query(`UPDATE players SET cash = ? WHERE pid = ?`, [amount, pid] , (err, result) => {
            console.log(err);
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Set Users Bank Amount
    app.post('/user/setBank', (req, res) => {
        const body = req.body;
        const { pid, amount } = body;
        sql.query(`UPDATE players SET bankacc = ? WHERE pid = ?`, [amount, pid] , (err, result) => {
            console.log(err);
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Compensate User (Bank Account)
    app.post('/user/compensate', (req, res) => {
        const body = req.body;
        const { pid, amount } = body;
        sql.query(`UPDATE players SET bankacc = bankacc + ? WHERE pid = ?`, [amount, pid] , (err, result) => {
            console.log(err);
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Set Users Civilian License
    app.post('/user/setLicense', (req, res) => {
        const body = req.body;
        const { pid, license, value } = body;

        sql.query(`SELECT civ_licenses from players WHERE pid = ?`, [pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            const civLicences = result[0].civ_licenses.substring(3, result[0].civ_licenses.length-3).split('],[').map(x => {
                const split = x.split(',')
                if (split[0] === `\`${license}\``) return [split[0], parseInt(value)];
                return [split[0], parseInt(split[1])]
            })
            const newString = `"${JSON.stringify(civLicences).replace(/"/g, '')}"`;
            sql.query(`UPDATE players SET civ_licenses = ? WHERE pid = ?`, [newString, pid] , (err, result) => {
                if(err) return res.sendStatus(400);
                res.sendStatus(200);
            })
        })
    })
}

export default userController;