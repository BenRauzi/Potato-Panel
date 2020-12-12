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

                console.log("Ban Type: " + banIDType); // DEBUG ONLY

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

                console.log("Player is Connected: " + playerConnected); // DEBUG ONLY
                console.log("Players ID: " + pid); // DEBUG ONLY

                // If the player isn't connected, and the banIDType is 0 (ID) then cancel request, and return 'Not Found'
                if (!playerConnected && banIDType === 0) return res.sendStatus(404);

                // Format the ban reason -- Plan on changing this to a simple message that includes the ban id, and a basic way to appeal it
                if (banLength === 0) {
                    banReason = `You have been permenantly banned by ${banningUser}.`;
                } else {
                    banReason = `You have been banned for ${banLength} minutes by ${banningUser}.`;
                };

                console.log("Formatted Ban Reason: " + banReason); // DEBUG ONLY

                // Create the reload bans function -- Need to do it this way to prevent timing out because I once again, cbf setting up async
                const reloadServerBans = () => {
                    console.log("Now reloading the bans on the server"); // DEBUG ONLY
                    rCon.sendCommand('writeBans', (err) => {
                        if (err) {
                            console.log(err);
                            return res.sendStatus(503);
                        };
                        rCon.sendCommand('loadBans', (err) => {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(503);
                            };
                        });
                    });
                };

                // Now handle the actual ban
                switch (banIDType) {
                    case 0: // ID -- Already checked to ensure the selected player exists and is online
                        console.log("Banning by ID"); // DEBUG ONLY
                        rCon.sendCommand(`ban ${pid} ${banLength} ${banReason}`, (err) => {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(503);
                            };
                            reloadServerBans();
                        });
                        break;
                    case 1: // IP - Checks if the player is on the server, if so then kick the player, then ban their IP using 'addBan'. Else, just ban the IP using 'addBan'
                        console.log("Banning by IP");
                        if (playerConnected) {
                            console.log("Player is online, so kicking then banning"); // DEBUG ONLY
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
                                    reloadServerBans();
                                });
                            });
                        } else {
                            console.log("Player isn't online, so just banning the IP"); // DEBUG ONLY
                            // The player isn't currently on the server, therefore ban the IP using `addBan` -- Copying code because I cbf setting up async...
                            rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                reloadServerBans();
                            });
                        };
                        break;
                    case 2: // GUID -- Checks if the player is on the server, if so then just ban them using 'ban'. However if they aren't, use 'addBan'
                        console.log("Banning by GUID");
                        if (playerConnected) {
                            console.log("Player is online, so banning them using 'ban'"); // DEBUG ONLY
                            rCon.sendCommand(`ban ${pid} ${banLength} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                reloadServerBans();
                            });
                        } else {
                            console.log("Player isn't online, so banning them using 'addBan'"); // DEBUG ONLY
                            // The player isn't currently on the server, therefore ban them using `addBan`
                            rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                reloadServerBans();
                            });
                        };
                        break;
                    default:
                        break;
                };

                res.sendStatus(200);
            });
        });
    });
};

module.exports = rconController;