// Handles Integration with Website for Light

const webController = (app, sqlAsync) => {
    app.get ('/user/info', async (req,res)=>{
        const id = req.query.pid

        const key = req.headers["x-api-key"] || undefined

        if(key !== process.env.WEB_API_KEY) return res.send(401)
        
        try {
            const userInfo = await sqlAsync.awaitQuery("SELECT uid, name, cash, bankacc, playtime from players where pid = ?", [id])
            res.send(userInfo)
        } catch (error) {
            res.sendStatus(500)   
        }
    })

    app.post('/user/cop-whitelist', async(req, res) => {
        const id = req.body.pid

        const key = req.headers["x-api-key"] || undefined

        if(key !== process.env.WEB_API_KEY) return res.send(401)

        try {
            const userInfo = await sqlAsync.awaitQuery("UPDATE players SET copLevel = 1, copdept = 1 WHERE pid = ?", [id])
            res.sendStatus(200)
        } catch (error) {
            res.sendStatus(500)   
        }
    })

    app.post('/user/ems-whitelist', async(req, res) => {
        const id = req.body.pid

        const key = req.headers["x-api-key"] || undefined

        if(key !== process.env.WEB_API_KEY) return res.send(401)

        try {
            await sqlAsync.awaitQuery("UPDATE players SET medicLevel = 1, medicdept = 1 WHERE pid = ?", [id])
            res.sendStatus(200)
        } catch (error) {
            res.sendStatus(500)   
        }
    })
}

module.exports = webController;