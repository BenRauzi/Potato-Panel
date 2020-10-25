const userController = (app, sql) => {
    app.get('/users', (req, res) => {
        sql.query("SELECT uid, name, pid, exp_level, cash, bankacc from players", (err, result) => {
            console.log(err)
            if(err) res.sendStatus(400)
            res.send(result)
        })
    })
}

export default userController;