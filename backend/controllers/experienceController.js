const { checkToken } = require("../services/authService");
const { logAction } = require("../services/staffHelper");

const experienceController = (app, sqlAsync) => {
    app.post('/user/setExperience', checkToken, async (req, res) => {
        const { pid, level, points } = req.body;

        const currentData = await sqlAsync.awaitQuery(`SELECT exp_level, exp_perkPoints FROM players WHERE pid = ?`, [pid]);
        logAction(req.cookies.authcookie, pid, `Set EXP level from ${currentData[0].exp_level} to ${level}, and EXP perk points from ${currentData[0].exp_perkPoints} to ${points}`, "misc", sqlAsync);

        try {
            const result = await sqlAsync.awaitQuery("UPDATE players SET exp_level = ?, exp_perkPoints = ? WHERE pid = ?", [level, points, pid]);
            return res.sendStatus(200);
        } catch {
            res.sendStatus(404);
        };
    });
};

module.exports = experienceController;