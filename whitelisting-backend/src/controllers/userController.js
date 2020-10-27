import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";
import fetch from "node-fetch";

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

    const restrictCop = (level) => {

    }
    // Fetch User
    app.get('/user', (req, res) => {
        const pid = req.query.pid; // Players ID

        if(pid === undefined) return res.sendStatus(404);
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=> {
            const newData = data || {}
            const adminLevel = newData.adminLevel || 0;
            const copLevel = newData.copLevel || 0;
            const emsLevel = newData.emsLevel || 0;
            
            let queryString = `SELECT name, players.aliases, players.exp_level,
            players.coplevel AS copWhitelisting, players.copdept, players.mediclevel AS medicWhitelisting, 
            players.medicdept, 
            players.donorlevel,
            players.arrested, 
            players.playtime, players.jail_time, players.developerlevel,
            players.last_seen, players.insert_time`;

            const adminTerms = ['players.cash', 'players.bankacc', 'players.civ_licenses', 'players.civ_gear', 'players.exp_perks', 'players.blacklist', 'panel_users.adminlevel']
            const copTerms = ['players.cop_licenses', 'players.cop_gear', 'panel_users.copLevel']
            const emsTerms = ['players.med_licenses', 'players.med_gear', 'panel_users.emsLevel']

            if (adminLevel > 1) {
                adminTerms.forEach(x => {
                    queryString = queryString + `, ${x}`
                })
            }

            if (copLevel >= 1 || adminLevel > 1) {
                copTerms.forEach(x => {
                    queryString = queryString + `, ${x}`
                })
            }

            if (emsLevel >= 1 || adminLevel > 1) {
                emsTerms.forEach(x => {
                    queryString = queryString + `, ${x}`
                })
            }

            queryString = queryString + `
            FROM players
            LEFT OUTER JOIN panel_users ON panel_users.pid = players.pid
            WHERE players.pid = ?`

            sql.query(queryString, [pid] , (err, userResult) => {
            if(err) return res.sendStatus(400);
            sql.query("SELECT id, side, classname, active FROM vehicles WHERE pid = ?", [pid], (err, vehicleResult) => {
                return res.send({
                    ...userResult[0],
                    vehicles: vehicleResult
                })
            })
        })
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
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Set Users Bank Amount
    app.post('/user/setBank', (req, res) => {
        const body = req.body;
        const { pid, amount } = body;
        sql.query(`UPDATE players SET bankacc = ? WHERE pid = ?`, [amount, pid] , (err, result) => {
            if(err) return res.sendStatus(400);
            res.sendStatus(200);
        })
    })

    // Compensate User (Bank Account)
    app.post('/user/compensate', (req, res) => {
        const body = req.body;
        const { pid, amount } = body;
        sql.query(`UPDATE players SET bankacc = bankacc + ? WHERE pid = ?`, [amount, pid] , (err, result) => {
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

    app.get('/user/steam', async (req, res) => {
        const pid = req.query.pid;
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${pid}`, {
            method: "GET"
        })

        const steamDetails = await response.json()
        const { personaname, profileurl, avatarfull } = steamDetails.response.players[0]
        res.send({
            profileName: personaname,
            profileUrl: profileurl,
            avatarUrl: avatarfull
            
        })
    })
}

export default userController;