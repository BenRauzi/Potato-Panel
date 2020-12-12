const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");
const crypto = require("crypto");
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config();

const rconController = (app, rCon, sql) => {
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

    // Fetch All Players
    app.get('/rcon/players', (req, res) => {
        rCon.sendCommand('players', (players) => {
            // Split player list string (Remove first 3, and last line)
            const playersStringArray = players.split("\n");
            playersStringArray.splice(0, 3);
            playersStringArray.pop();

            // Filter through each individual players information, converting the string to an array
            let playersArray = [];
            for (const player of playersStringArray) {
                // Filter ID, IP:PORT, Ping & GUID
                const splitArray = player.split(" ");
                const playerFiltered = splitArray.filter(e => e);
                const playersNameArray = playerFiltered.slice(4, playerFiltered.length);

                // Remove port from players IP
                playerFiltered[1] = playerFiltered[1].split(":")[0];

                // Remove suffix from players GUID
                playerFiltered[3] = playerFiltered[3].split("(")[0];

                // Get players name, and join them to one string (if multiple words)
                playerFiltered.splice(4, playerFiltered.length);
                playerFiltered.push(playersNameArray.join(" "));
            
                // Push filtered players data to master array
                playersArray.push(playerFiltered);
            };
            res.send(playersArray);
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
                playerFiltered[1] = playerFiltered[1].split(":")[0];
                playerFiltered[3] = playerFiltered[3].split("(")[0];
                playerFiltered.splice(4, playerFiltered.length);
                playerFiltered.push(playersNameArray.join(" "));
                if (playerFiltered[0] == playersID) {
                    playersInformation.push(playerFiltered);
                };
            };
            res.send(playersInformation);
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

    // Ban a Player (By ID [If on server], IP or BattlEYE GUID)
    app.post('/rcon/ban', checkToken, async(req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            rCon.sendCommand('players', async(players) => {
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
                
                let playersGUID = "";
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
                        pid = playersData[0];
                        playersGUID = playersData[2];
                    };
                };

                console.log("Player is Connected: " + playerConnected); // DEBUG ONLY
                console.log("Players ID: " + pid); // DEBUG ONLY

                // If the player isn't connected, and the banIDType is 0 (ID) then cancel request, and return 'Not Found'
                if (!playerConnected && banIDType === 0) return res.sendStatus(404);

                // Generate ban appeal ID, and format the ban message
                const rand = crypto.randomBytes(10);
                let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                let banAppealID = "";
                for(let i=0; i < rand.length; i++) {
                    let index = rand[i] % chars.length;
                    banAppealID += chars[index];
                };
                const banReason = `(   Ban ID: ${banAppealID} - appeal.arma-studios.com`;

                console.log("Formatted Ban Reason: " + banReason); // DEBUG ONLY

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
                            rCon.sendCommand(`kick ${pid} Account Banned - ${banReason.substring(4)}`, (err) => {
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

                // Log ban to database
                try {
                    let banTable = "bans";
                    let banningLogID = banID;
                    let banColumn = "guid";
                    if (banIDType === 1) {
                        banTable = "ip_bans";
                        banColumn = "ip";
                        // Encrypt IP
                        //const algorithm = 'aes-256-ctr';
                        //const iv2 = crypto.randomBytes(banningLogID.length);
                        //const cipher = crypto.createCipheriv(algorithm, process.env.IP_SECRET, iv2);
                        //const encrypted = Buffer.concat([cipher.update(banningLogID), cipher.final()]);
                        //banningLogID = encrypted.toString('hex');
                    };

                    if (banIDType === 0) {
                        banningLogID = playersGUID;
                    };

                    console.log("Players GUID: " + playersGUID);

                    // Get the expire datestamp
                    const curDBTime = await sql.awaitQuery(`SELECT CURRENT_TIMESTAMP()`);
                    const time_expire = moment(curDBTime[0]["CURRENT_TIMESTAMP()"]).add(banLength, 'm').toDate();

                    const logBan = await sql.awaitQuery(`INSERT INTO ${banTable} (id, ${banColumn}, time_expire, banned_by, reason) VALUES (?, ?, ?, ?, ?)`, [banAppealID, banningLogID, time_expire, data.pid, reason]);
        
                    res.sendStatus(200);
                } catch (error) {
                    console.log(error)
                    return res.sendStatus(500)
                };
            });
        });
    });

    // Remove a Ban (By ID -- Unban)
    app.post('/rcon/unban', (req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET,(err,data)=>{
            const { banID, reason } = req.body;
            const user = "Nicholas Jo'Foski"; // data.user;

            rCon.sendCommand(`removeBan ${banID}`, (err) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(503);
                };
                reloadServerBans();
                res.sendStatus(200);
            });
        });
    });

    // Fetch All Bans
    app.get('/rcon/bans', (req, res) => {
        reloadServerBans();
        rCon.sendCommand('bans', (bans) => {
            // Split player list string (Remove first 3, and last line)
            let bansStringArray = bans.split("\n");
            bansStringArray.splice(0, 3);
            bansStringArray = bansStringArray.filter(e => e)

            // Remove IP ban labels
            bansStringArray.splice(bansStringArray.indexOf("IP Bans:"), 3);

            // Filter through each individual ban, converting the string to an array
            let bansArray = [];
            for (const ban of bansStringArray) {
                // Filter ID, BannedID, Minutes Left & Reason
                const splitArray = ban.split(" ");
                const banFiltered = splitArray.filter(e => e);
                const banReason = banFiltered.slice(3, banFiltered.length);

                // Get players name, and join them to one string (if multiple words)
                banFiltered.splice(3, banFiltered.length);
                banFiltered.push(banReason.join(" "));
            
                // Push filtered ban data to master array
                bansArray.push(banFiltered);
            };
            res.send(bansArray);
        });
    });
};

module.exports = rconController;