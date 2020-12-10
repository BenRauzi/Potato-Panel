const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");

const rconController = (app, rCon) => {
    // Send a Message (Global & Private)
    app.get('/rcon/message', (req, res) => {
        let message = req.query.message; // Message
        const from = req.query.from; // Name of Sender
        const toID = req.query.toID || -1; // ID of reciever - Default is -1 [GLOBAL]
        if (!message) return res.sendStatus(205);

        // Format message
        if (from) {
            message = `[${from}] ${message}`;
        };

        // Send the Message
        rCon.sendCommand(`say ${toID} ${message}`, (err) => {
            if (err) {
                console.log(err);
                return res.sendStatus(503);
            };
            res.sendStatus(200);
        }); 
    });

    // Fetch a Player (Single)
    app.get('/rcon/player', (req, res) => {
        const playersID = req.query.id || 0; // Players ID

        // Semi-Duplicate fkn code... YAAAAAAYY
        rCon.sendCommand('players', (players) => {
            const playersStringArray = players.split("\n");
            playersStringArray.splice(0, 3);
            playersStringArray.pop();
            let playersInformation = [];

            for (const player of playersStringArray) {
                if (playersInformation.length > 0) break;
                const splitArray = player.split(" ");
                const playerFiltered = splitArray.filter(e => e);
                const playersNameArray = playerFiltered.slice(4, playerFiltered.length);
                playerFiltered.splice(4, playerFiltered.length);
                playerFiltered.push(playersNameArray.join(" "));

                if (playerFiltered[0] == playersID) {
                    playersInformation.push(playerFiltered);
                };
            };
            res.send(playersInformation);
        });
    });

    // Fetch All Players
    app.get('/rcon/players', (req, res) => {
        rCon.sendCommand('players', (players) => {
            // Split player list string (Remove first 3, and last line)
            const playersStringArray = players.split("\n");
            playersStringArray.splice(0, 3);
            playersStringArray.pop();

            // Filter through each individual players information, converting the string to an array
            let playersArray = [];
            playersStringArray.forEach(player => {
                // Filter ID, IP:PORT, Ping & GUID
                const splitArray = player.split(" ");
                const playerFiltered = splitArray.filter(e => e);
                const playersNameArray = playerFiltered.slice(4, playerFiltered.length);

                // Get players name, and join them to one string (if multiple words)
                playerFiltered.splice(4, playerFiltered.length);
                playerFiltered.push(playersNameArray.join(" "));
            
                // Push filtered players data to master array
                playersArray.push(playerFiltered);
            });
            res.send(playersArray);
        });
    });

    // Kick a Player (By ID)
    app.post('/rcon/kick', checkToken, (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            //if(data.adminLevel < 2 && data.copWhitelisting < 6) return res.sendStatus(401); // Moderator+ AND Lieutenant+
            const { pid, reason } = req.body;
            console.log(data.username);
            // Format kick message
            const kickMessage = `Reason: ${reason} - ${from}`;
        });
    });



    // app.get('/rcon/kick', checkToken, (req, res) => {
        // const playerID = req.query.pid; // Players ID
        // let reason = req.query.reason; // Reason
        // const from = req.query.from; // Name of Kicker
        // if (!playerID || !reason) return res.sendStatus(205);
// 
        //Format reason
        // reason = `Reason: ${reason} - ${from}`;
// 
       // Kick the Player
        // rCon.sendCommand(`kick ${playerID} ${reason}`, (err) => {
            // if (err) {
                // console.log(err);
                // return res.sendStatus(503);
            // };
            // res.sendStatus(200);
        // }); 
    // });
};

module.exports = rconController;