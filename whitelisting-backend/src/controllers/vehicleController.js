const vehicleController = (app, sql) => {
    // Fetch Generic Vehicles 
    app.get('/vehicles', (req, res) => {
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const side = req.query.side; // Side Filter
        const type = req.query.type; // Type Filter

        const startingPoint = (pageN - 1) * count;

        sql.query(`SELECT COUNT(*) FROM vehicles ${side || type ? " WHERE " : ""} ${side ? 'vehicles.side = ?' : ""} ${side && type ? " AND " : ""} ${type ? 'vehicles.type = ?' : ""}`, [...(side ? [side] : []), ...(type ? [type] : [])], (err, countR) => {
            if(err) return res.sendStatus(400);
            sql.query(`SELECT vehicles.id, vehicles.side, vehicles.type, players.name, vehicles.classname, vehicles.active, vehicles.impound FROM vehicles INNER JOIN players ON players.pid = vehicles.pid ${side || type ? " WHERE " : ""} ${side ? 'vehicles.side = ?' : ""} ${side && type ? " AND " : ""} ${type ? 'vehicles.type = ?' : ""} LIMIT ?, ?`, [...(side ? [side] : []), ...(type ? [type] : []) ,startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Fetch Vehicle
    app.get('/vehicle', (req, res) => {
        const vid = req.query.vid; // Vehicle ID
        if(vid === undefined) return res.sendStatus(404);
        sql.query(`SELECT vehicles.id, vehicles.side, vehicles.type, players.name, vehicles.pid, vehicles.classname, vehicles.active, vehicles.fuel, vehicles.insert_time, vehicles.impound, vehicles.insured FROM vehicles INNER JOIN players ON players.pid = vehicles.pid WHERE vehicles.id = ?`, [vid] , (err, result) => {
            if(err) res.sendStatus(400);
            res.send(result);
        });
    });

    // Search Vehicle(s) (By Username)
    app.get('/vehicles/search', (req, res) => {
        const uname = req.query.uname; // Players Username
        const pageN = req.query.p || 1; // Page Number
        const count = parseInt(req.query.c) || 10; // Total Entires Gathered
        const side = req.query.side; // Side Filter
        const type = req.query.type; // Type Filter
        if(uname === undefined) return res.sendStatus(404);
        const startingPoint = (pageN - 1) * count;
    
        sql.query(`SELECT COUNT(*) FROM vehicles INNER JOIN players ON players.pid = vehicles.pid WHERE players.name like concat('%', ?, '%') ${side || type ? " AND " : ""} ${side ? 'vehicles.side = ?' : ""} ${side && type ? " AND " : ""} ${type ? 'vehicles.type = ?' : ""} order by players.name like concat(@?, '%') desc, ifnull(nullif(instr(players.name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(players.name, @?), 0), 99999),players.name`, [uname, ...(side ? [side] : []), ...(type ? [type] : []), uname, uname, uname, startingPoint, count], (err, countR) => { 
            if(err) return res.sendStatus(400);
            sql.query(`SELECT vehicles.id, vehicles.side, vehicles.type, players.name, vehicles.classname, vehicles.active, vehicles.impound FROM vehicles INNER JOIN players ON players.pid = vehicles.pid WHERE players.name like concat('%', ?, '%') ${side || type ? " AND " : ""} ${side ? 'vehicles.side = ?' : ""} ${side && type ? " AND " : ""} ${type ? 'vehicles.type = ?' : ""} order by players.name like concat(@?, '%') desc, ifnull(nullif(instr(players.name, concat(' ', @?)), 0), 99999), ifnull(nullif(instr(players.name, @?), 0), 99999),players.name LIMIT ?, ?`, [uname, ...(side ? [side] : []), ...(type ? [type] : []), uname, uname, uname, startingPoint, count], (err, result) => {
                if(err) return res.sendStatus(400);
                const response = {
                    count: countR[0]["COUNT(*)"],
                    result: result
                };
                res.send(response);
            });
        });
    });

    // Add Vehicle
    app.post('/vehicle/add', (req, res) => {
        const body = req.body;
        const { pid, classname, side, type, insured } = body;
        const plateNumber = Math.floor(Math.random() * 9999999) + 1000000;

        sql.query(`INSERT INTO vehicles (side, classname, type, pid, alive, blacklist, active, plate, color, inventory, gear, fuel, damage, impound, insured) VALUES (?, ?, ?, ?, 1, 0, 0, ?, "[[1,1,1,1],[1,1,1,1],0.5]", '"[[],0]"', '"[]"', 1, '"[]"', 0, ?)`, [side.toLowerCase(), classname, type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(), pid, plateNumber, insured] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    });

    // Remove Vehicle
    app.post('/vehicle/remove', (req, res) => {
        const body = req.body;
        const { vehicleID } = body;

        sql.query("DELETE FROM vehicles WHERE id = ?", [vehicleID] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    });

    // Return Vehicle (Garage)
    app.post('/vehicle/return', (req, res) => {
        const body = req.body;
        const { vehicleID } = body;
        sql.query("UPDATE vehicles SET alive = 1, active = 0, impound = 0 WHERE id = ?", [vehicleID] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })
};

export default vehicleController;