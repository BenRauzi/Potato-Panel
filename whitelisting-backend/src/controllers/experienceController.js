const experienceController = (app, sql) => {
    app.post('/user/setExperience', async (req, res) => {
        const { pid, level, points } = req.body;

        try {
            const result = await sql.awaitQuery("UPDATE players SET exp_level = ?, exp_perkPoints = ? WHERE pid = ?", [level, points, pid])
            console.log(result)
            return res.sendStatus(200);
        } catch {
            res.sendStatus(404)
        }
    })
}

export default experienceController;