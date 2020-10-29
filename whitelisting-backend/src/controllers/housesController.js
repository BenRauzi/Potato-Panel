const housesController = (app, sql) => {
    app.get('/user/houses', async (req, res) => {
        const pid = req.query.pid; // Page Number

        if(!pid) return res.send(400)

        try {
            const housesCount = await sql.awaitQuery("SELECT COUNT(*) FROM houses WHERE pid = ?", [pid]);

            const houses = await sql.awaitQuery("SELECT id, pos, insert_time FROM houses WHERE pid = ?", [pid]);

            return res.send({
                count: housesCount[0]["COUNT(*)"],
                houses: houses
            })
        } catch {
            return res.sendStatus(404);
        }
    })
}

export default housesController;