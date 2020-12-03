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
            console.log(error)
            res.sendStatus(500)   
        }
        
    })
}

module.exports = webController;