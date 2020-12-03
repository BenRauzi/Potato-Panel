import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";

const housesController = (app, sql) => {
    app.get('/user/houses', checkToken, async (req, res) => {
        const pid = req.query.pid; // Page Number

        if(!pid) return res.send(400);

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

    app.post('/house/remove', checkToken, (req, res) => {
        const { id } = req.body;

        if(!id) return res.sendStatus(400);

        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err,data)=>{
            if(data.adminLevel < 3) return res.sendStatus(401);

            try {
                const result = await sql.awaitQuery("DELETE From houses WHERE id = ?", [id]);
    
                if(result.affectedRows === 0) return res.sendStatus(404);
    
                res.sendStatus(200);
            } catch {
                return res.sendStatus(500);
            }
        })
    })

    app.get('/user/containers', checkToken, async (req, res) => {
        const pid = req.query.pid; // Page Number

        if(!pid) return res.sendStatus(400);

        try {
            const containersCount = await sql.awaitQuery("SELECT COUNT(*) FROM containers WHERE pid = ?", [pid]);

            const containers = await sql.awaitQuery("SELECT id, classname, inventory, gear FROM containers WHERE pid = ?", [pid]);

            return res.send({
                count: containersCount[0]["COUNT(*)"],
                containers: containers
            })
        } catch {
            return res.sendStatus(404);
        }
    })

    app.post('/container/remove', checkToken, (req, res) => {
        const { id } = req.body;

        if(!id) return res.sendStatus(400);

        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err,data)=> {
            
            if(data.adminLevel < 3) return res.sendStatus(401);

            try {
                const result = await sql.awaitQuery(`DELETE FROM containers WHERE id = ?`, [id]);
    
                if(result.affectedRows === 0) return res.sendStatus(404);
    
                res.sendStatus(200);
            } catch {
                return res.sendStatus(404);
            }
        })
    })
}

export default housesController;