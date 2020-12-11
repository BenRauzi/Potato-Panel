const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");

const rconController = (app, rCon) => {
    // Send a Message (Global & Private)
    app.post('/rcon/message', (req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, (err, data) => {
            let { pid, message } = req.body;
            const user = "Nicholas Jo'Foski"; // data.user;

            rCon.sendCommand(`say ${pid} [${user}] ${message}`, (err) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(503);
                };
                res.sendStatus(200);
            });
        });
    });

    // Kick a Player (By ID)
    app.post('/rcon/kick', (req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            const { pid, reason } = req.body;
            const user = "Nicholas Jo'Foski"; // data.user;

            rCon.sendCommand(`kick ${pid} Reason: ${reason} | ${user}`, (err) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(503);
                };
                res.sendStatus(200);
            }); 
        });
    });

    // Ban a Player (By ID [If on server], IP or BattlEYE GUID)
    app.post('/rcon/ban', (req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, (err, data) => {
            rCon.sendCommand('players', (players) => {
                const { banID, banLength, reason } = req.body;
                const banningUser = "Nicholas Jo'Foski"; // data.user;
        
                // Set the banID type
                let banIDType = 0; // Default - ID
                let pid = banID;
                if (banID.includes(".")) { // IP
                    banIDType = 1;
                } else if (banID.length > 10) { // GUID
                    banIDType = 2;
                };

                // Check if player is currently connected
                let playerConnected = false;
                const playersStringArray = players.split("\n");
                playersStringArray.splice(0, 3);
                playersStringArray.pop();
                
                for (const player of playersStringArray) {
                    if (playerConnected) break;
                    const splitArray = player.split(" ");
                    const playerData = splitArray.filter(e => e);
                    const playersData = [playerData[0], playerData[1].split(":")[0], playerData[3].split("(")[0]];

                    console.log(playersData); // DEBUG ONLY
                    console.log(banIDType); // DEBUG ONLY
                    console.log(playersData[banIDType]); // DEBUG ONLY

                    // If player is connected, then set 'pid' to the players ingame ID despite the input ID
                    if (playersData[banIDType] === banID) {
                        playerConnected = true;
                        pid = playerData[0];
                    };
                };

                console.log("Is Connected: " + playerConnected); // DEBUG ONLY
                console.log(pid); // DEBUG ONLY

                // Format the reason
                 if (banLength === 0) {
                    banReason = `You have been permenantly banned by ${banningUser}.`;
                 } else {
                    banReason = `You have been banned for ${banLength} minutes by ${banningUser}.`;
                 };

                switch (banIDType) {
                    case 0: // ID 
                        if (!playerConnected) return res.sendStatus(404); // If the player isn't current connected, seeming it is a player ID ban return 404
                        rCon.sendCommand(`ban ${pid} ${banLength} ${banReason}`, (err) => {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(503);
                            };
                            res.sendStatus(200);
                        });
                        break;
                    case 1: // IP
                        if (playerConnected) {
                            // The player is currently on the server, therefore kick them off the server first then ip ban them using 'addBan'
                            rCon.sendCommand(`kick ${pid} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                // Now ban the IP using `addBan`
                                rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, (err) => {
                                    if (err) {
                                        console.log(err);
                                        return res.sendStatus(503);
                                    };
                                });
                            });
                        } else {
                            // The player isn't currently on the server, therefore ban the IP using `addBan` -- Copying code because I cbf setting up async...
                            rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                            });
                        };
                        break;
                    case 2: // GUID
                        if (playerConnected) {
                            rCon.sendCommand(`ban ${banID} ${banLength} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                            });
                        } else {
                            // The player isn't currently on the server, therefore ban them using `addBan`
                            rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                            });
                        };
                        break;
                    default:
                        break;
                };
                // Now reload the server bans live on the server
                rCon.sendCommand('loadBans', (err) => {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(503);
                    };
                    res.sendStatus(200);
                });
            });
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
};

module.exports = rconController;