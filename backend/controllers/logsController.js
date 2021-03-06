const { jwtVerify } = require("../services/authHelper")
const { checkToken } = require("../services/authService")

const logsController = (app, sqlAsync) => {
    app.get("/logs", checkToken, async (req, res) => {
        const userData = await jwtVerify(req.cookies.authcookie);

        const pageNumber = parseInt(req.query.p) || 1;
        const count = parseInt(req.query.c) || 10
        const startingPoint = (pageNumber - 1) * count;

        const type = req.query.type;

        if(userData.adminLevel < 4) return res.sendStatus(403);
        try {
            let result;
            let resultCount;
            if(!type) {
                resultCount = await sqlAsync.awaitQuery("SELECT COUNT(*) from panel_logs");
                result = await sqlAsync.awaitQuery(`SELECT panel_logs.*, CURRENT_TIMESTAMP, p1.name AS staff_member_name, p2.name as member_name FROM panel_logs
                INNER JOIN players p1
                ON panel_logs.staff_member = p1.pid
                LEFT JOIN players p2
                ON panel_logs.member = p2.pid
                ORDER BY ID 
                DESC LIMIT ?, ?`, [
                    startingPoint,
                    count
                ])
            } else {
                resultCount = await sqlAsync.awaitQuery("SELECT COUNT(*) from panel_logs WHERE type = ?", [type]);

                result = await sqlAsync.awaitQuery(`SELECT panel_logs.*, panel_users.username AS staff_member_name, players.name as member_name FROM panel_logs
                INNER JOIN panel_users
                ON panel_logs.staff_member = panel_users.pid
                LEFT JOIN players
                ON panel_logs.member = players.pid
                WHERE type = ? 
                ORDER BY ID DESC 
                LIMIT ?, ?`, [
                    type,
                    startingPoint,
                    count
                ])
            }

            return res.send({
                count: resultCount[0]["COUNT(*)"],
                result: result.map(log => {
                    log["COUNT(*)"] = undefined
                    return log
                })
            })
           
        } catch(err) {
            console.log(err);
            return res.sendStatus(500);
        }
    })

    app.get("/logs/search", checkToken, async (req, res) => {
        const userData = await jwtVerify(req.cookies.authcookie);

        const pageNumber = parseInt(req.query.p) || 1;
        const count = parseInt(req.query.c) || 10;
        const startingPoint = (pageNumber - 1) * count;
        const searchQuery = req.query.search;
        const type = req.query.type;

        if(userData.adminLevel < 4) return res.sendStatus(403);
        try {
            let result;
            let resultCount;
            if(!type) {
                resultCount = await sqlAsync.awaitQuery(`SELECT COUNT(*) from panel_logs WHERE log like concat('%', ?, '%')`, [searchQuery]);

                result = await sqlAsync.awaitQuery(`SELECT panel_logs.*, CURRENT_TIMESTAMP, p1.name AS staff_member_name, p2.name as member_name FROM panel_logs
                INNER JOIN players p1
                ON panel_logs.staff_member = p1.pid
                LEFT JOIN players p2
                ON panel_logs.member = p2.pid
                WHERE log like concat('%', ?, '%') 
                order by log like concat(@?, '%') desc, 
                ifnull(nullif(instr(log, concat(' ', @?)), 0), 99999),
                ifnull(nullif(instr(log, @?), 0), 99999),log
                LIMIT ?, ?`, [
                    ...Array(4).fill(searchQuery),
                    startingPoint,
                    count
                ])
            } else {
                resultCount = await sqlAsync.awaitQuery(`
                SELECT COUNT(*) from panel_logs 
                WHERE (type = ? AND log like concat('%', ?, '%')`, [
                    type, 
                    searchQuery
                ]);

                result = await sqlAsync.awaitQuery(`SELECT panel_logs.*, panel_users.username AS staff_member_name, players.name as member_name FROM panel_logs
                INNER JOIN panel_users
                ON panel_logs.staff_member = panel_users.pid
                LEFT JOIN players
                ON panel_logs.member = players.pid
                WHERE (type = ? AND log like concat('%', ?, '%')_
                order by log like concat(@?, '%') desc, 
                ifnull(nullif(instr(log, concat(' ', @?)), 0), 99999),
                ifnull(nullif(instr(log, @?), 0), 99999),log
                LIMIT ?, ?`, [
                    type,
                    ...Array(4).fill(searchQuery),
                    startingPoint,
                    count
                ])
            }

            return res.send({
                count: resultCount[0]["COUNT(*)"],
                result: result.map(log => {
                    log["COUNT(*)"] = undefined
                    return log
                })
            })
           
        } catch(err) {
            console.log(err);
            return res.sendStatus(500);
        }
    })
}

module.exports = logsController