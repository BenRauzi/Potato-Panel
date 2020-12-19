const { checkToken } = require("../services/authService");

const experienceController = (app, sql) => {
    app.post('/user/setExperience', checkToken, async (req, res) => {
        const { pid, level, points } = req.body;

        try {
            const result = await sql.awaitQuery("UPDATE players SET exp_level = ?, exp_perkPoints = ? WHERE pid = ?", [level, points, pid])
            return res.sendStatus(200);
        } catch {
            res.sendStatus(404)
        }
    })
}

module.exports = experienceController;