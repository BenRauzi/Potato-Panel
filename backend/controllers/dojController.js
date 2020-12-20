const { jwtVerify } = require("../services/authHelper");
const { checkToken } = require("../services/authService");

const dojController = (app, sql) => {
    app.post("/doj/whitelist", checkToken, async (req, res) => {
        const { pid, level } = req.body;

        if(!pid || level === undefined) return res.sendStatus(403)
        const userData = await jwtVerify(req.cookies.authcookie);
        if(userData.adminLevel < 2) return res.send(401);

        try {
            await sql.awaitQuery("UPDATE players SET dojlevel = ? WHERE pid = ?", [level, pid]);
            return res.sendStatus(200);
        } catch(err) {
            console.log(err);
            return res.sendStatus(500);
        }
    })

    app.post("/doj/set-department", checkToken, async (req, res) => {
        const { pid, department } = req.body;

        if(!pid || !department === undefined) return res.sendStatus(403)
        const userData = await jwtVerify(req.cookies.authcookie);
        if(userData.adminLevel < 2) return res.send(401);

        try {
            await sql.awaitQuery("UPDATE players SET dojdept = ? WHERE pid = ?", [department, pid]);
            return res.sendStatus(200);
        } catch(err) {
            console.log(err);
            return res.sendStatus(500);
        }
    })
}

module.exports = dojController;