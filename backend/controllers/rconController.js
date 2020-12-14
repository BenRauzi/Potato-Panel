const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

// RCON Functions
const { rconConnection } = require("../services/RCON/rconConnection");
const { disconnectRCON } = require("../services/RCON/disconnectRCON");
const { getUserByGUID } = require("../services/RCON/getUserByGUID");
const { reloadServerBans } = require("../services/RCON/reloadServerBans");

const rconController = (app, rCon, sql) => {
    // Send a Message (Global & Private)
    app.post('/rcon/message', checkToken, async(req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            let { pid, message } = req.body;
            const user = data.user;

            // Check users permissions here..

            try {
                // Connect to RCON
                const RCON = await rconConnection();
        
                // Send Message
                RCON.sendCommand(`say ${pid} [${user}] ${message}`, async(err) => {
                    if (err) {
                        console.log(err);
                    };
                });

                // Log to Console (DEBUG)
                console.log(`RCON: '${user}' just sent the following message to '${pid}': ${message}.`);

                // Disconnected RCON
                //await disconnectRCON(RCON);

                return res.sendStatus(200);
            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            };
        });
    });

    // Fetch All Players
    app.get('/rcon/players', checkToken, async(req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err, data) => {

            // Check users permissions here..

            try {
                // Connect to RCON
                const RCON = await rconConnection();
        
                // Fetch Players List
                RCON.sendCommand('players', async(players) => {
                    // Split player list string (Remove first 3, and last line)
                    const playersStringArray = players.split("\n");
                    playersStringArray.splice(0, 3);
                    playersStringArray.pop();

                    console.log(playersStringArray); // DEBUG ONLY

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

                        const curPlayer = {
                            id: playerFiltered[0],
                            ip: playerFiltered[1],
                            ping: playerFiltered[2],
                            guid: playerFiltered[3],
                            name: playerFiltered[4]
                        };

                        // Push filtered players data to master array
                        playersArray.push(curPlayer);
                    };

                    // Log to Console (DEBUG)
                    console.log(`RCON: '${data.user}' has just fetched the players list.`);

                    // Disconnected RCON
                    //await disconnectRCON(RCON);

                    return res.send(playersArray);
                });
            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            };
        });
    });

    // Fetch a Player (Single)
    app.get('/rcon/player', checkToken, async(req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err, data) => {
            let playersID = req.query.id || 0; // Players ID

            // Check users permissions here..

            try {
                // Connect to RCON
                const RCON = await rconConnection();
        
                // If given ID is a GUID, then convert it to their player list ID
                if (playersID.length > 20) {
                    playersID = getUserByGUID(playersID, RCON);
                };

                // Fetch Players Information
                RCON.sendCommand('players', async (players) => {
                    const playersStringArray = players.split("\n");
                    playersStringArray.splice(0, 3);
                    playersStringArray.pop();
                    let playersInformation;
                    for (const player of playersStringArray) {
                        if (playersInformation) break;
                        const splitArray = player.split(" ");
                        const playerFiltered = splitArray.filter(e => e);
                        const playersNameArray = playerFiltered.slice(4, playerFiltered.length);
                        playerFiltered[1] = playerFiltered[1].split(":")[0];
                        playerFiltered[3] = playerFiltered[3].split("(")[0];
                        playerFiltered.splice(4, playerFiltered.length);
                        playerFiltered.push(playersNameArray.join(" "));

                        playersInformation = {
                            id: playerFiltered[0],
                            ip: playerFiltered[1],
                            ping: playerFiltered[2],
                            guid: playerFiltered[3],
                            name: playerFiltered[4]
                        };
                    };

                    // Log to Console (DEBUG)
                    console.log(`RCON: '${data.user}' has just fetched a players information (${playersID}).`);

                    // Disconnected RCON
                    //await disconnectRCON(RCON);

                    return res.send(playersInformation);
                });
            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            };
        });
    });

    // Kick a Player (By ID)
    app.post('/rcon/kick', checkToken, async(req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            const { pid, reason } = req.body;
            const user = data.user;

            rCon.sendCommand(`kick ${pid} Reason: ${reason} | ${user}`, async(err) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(503);
                };
                res.sendStatus(200);
            });
        });
    });

    // Ban a Player (By ID [If on server], IP or BattlEYE GUID)
    app.post('/rcon/ban', checkToken, async(req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            rCon.sendCommand('players', async(players) => {
                const { banID, banLength, reason } = req.body;
                const banningUser = "Nicholas Jo'Foski"; // data.user;
                console.log(banLength);
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
                let idLength = 10;
                if (banIDType === 1) {
                    idLength = 11;
                };
                const rand = crypto.randomBytes(idLength);
                let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                let banAppealID = "";
                for (let i = 0; i < rand.length; i++) {
                    let index = rand[i] % chars.length;
                    banAppealID += chars[index];
                };
                const banReason = `(   Ban ID: ${banAppealID} - appeal.arma-studios.com`;

                console.log("Formatted Ban Reason: " + banReason); // DEBUG ONLY

                // Now handle the actual ban
                switch (banIDType) {
                    case 0: // ID -- Already checked to ensure the selected player exists and is online
                        console.log("Banning by ID"); // DEBUG ONLY
                        rCon.sendCommand(`ban ${pid} ${banLength} ${banReason}`, async(err) => {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(503);
                            };
                            await reloadServerBans(rCon);
                        });
                        break;
                    case 1: // IP - Checks if the player is on the server, if so then kick the player, then ban their IP using 'addBan'. Else, just ban the IP using 'addBan'
                        console.log("Banning by IP");
                        if (playerConnected) {
                            console.log("Player is online, so kicking then banning"); // DEBUG ONLY
                            // The player is currently on the server, therefore kick them off the server first then ip ban them using 'addBan'
                            rCon.sendCommand(`kick ${pid} Account Banned - ${banReason.substring(4)}`, async(err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                // Now ban the IP using `addBan`

                                rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, async(err) => {
                                    if (err) {
                                        console.log(err);
                                        return res.sendStatus(503);
                                    };
                                    await reloadServerBans(rCon);
                                });
                            });
                        } else {
                            console.log("Player isn't online, so just banning the IP"); // DEBUG ONLY
                            // The player isn't currently on the server, therefore ban the IP using `addBan` -- Copying code because I cbf setting up async...
                            console.log(`addBan ${banID} ${banLength} ${banReason}`);
                            console.log(banLength);
                            rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, async(err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                await reloadServerBans(rCon);
                            });
                        };
                        break;
                    case 2: // GUID -- Checks if the player is on the server, if so then just ban them using 'ban'. However if they aren't, use 'addBan'
                        console.log("Banning by GUID");
                        if (playerConnected) {
                            console.log("Player is online, so banning them using 'ban'"); // DEBUG ONLY
                            rCon.sendCommand(`ban ${pid} ${banLength} ${banReason}`, async(err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                await reloadServerBans(rCon);
                            });
                        } else {
                            console.log("Player isn't online, so banning them using 'addBan'"); // DEBUG ONLY
                            // The player isn't currently on the server, therefore ban them using `addBan`
                            rCon.sendCommand(`addBan ${banID} ${banLength} ${banReason}`, async(err) => {
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(503);
                                };
                                await reloadServerBans(rCon);
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
                        encrypted = CryptoJS.AES.encrypt(banningLogID, process.env.IP_SECRET);
                        banningLogID = encrypted.toString();
                        console.log("Encrypted: " + banningLogID);

                        // Decrypt IP - TESTING
                        //var bytes = CryptoJS.AES.decrypt(encrypted.toString(), process.env.IP_SECRET);
                        //var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                        //console.log("Decrypted: " + plaintext);
                    };

                    if (banIDType === 0) {
                        banningLogID = playersGUID;
                    };

                    console.log("Players GUID: " + playersGUID);

                    if (banLength < 1) {
                        const logBan = await sql.awaitQuery(`INSERT INTO ${banTable} (id, ${banColumn}, banned_by, reason) VALUES (?, ?, ?, ?)`, [banAppealID, banningLogID, data.pid, reason]);
                    } else {
                        // Get the expire datestamp
                        const curDBTime = await sql.awaitQuery(`SELECT CURRENT_TIMESTAMP()`);
                        const time_expire = moment(curDBTime[0]["CURRENT_TIMESTAMP()"]).add(banLength, 'm').toDate();

                        const logBan = await sql.awaitQuery(`INSERT INTO ${banTable} (id, ${banColumn}, time_expire, banned_by, reason) VALUES (?, ?, ?, ?, ?)`, [banAppealID, banningLogID, time_expire, data.pid, reason]);
                    };

                    return res.sendStatus(200);
                } catch (error) {
                    console.log(error)
                    return res.sendStatus(500)
                };
            });
        });
    });

    // Remove a Ban (By Ban Appeal ID or Players GUID / IP -- Unban)
    app.post('/rcon/unban', checkToken, async(req, res) => { // Will add checkToken
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err,data)=>{
            const { banID, reason } = req.body;
            const user = data.user;

            // Check what type of ID was given
            let bannedID = banID;
            let banIDType = 0; // Default - Appeal ID
            let banTable = "bans";
            if (banID.includes(".")) { // IP
                banIDType = 1;
                banTable = "ip_bans";
            } else if (banID.length > 15) { // GUID
                banIDType = 2;
            };

            // Determine if the given appeal ID is for a guid or ip ban
            if (banIDType === 0 && banID.length === 11) {
                banTable = "ip_bans";
            };
            console.log(banIDType);

            // Set the correct column name
            let selectedColumn = "guid";
            if (banTable === "ip_bans") {
                selectedColumn = "ip";
            };

            // Get the banned ID if the given input was an Appeal ID
            let encryptedIP;
            if (banIDType === 0) {
                let query = await sql.awaitQuery(`SELECT ${selectedColumn} FROM ${banTable} WHERE id=?`, [banID]);
                if (query.length <= 0) return res.sendStatus(404);
                bannedID = query[0][selectedColumn];

                // Decrypt result if an IP
                if (banTable === "ip_bans") {
                    encryptedIP = bannedID;
                    const bytes = CryptoJS.AES.decrypt(bannedID.toString(), process.env.IP_SECRET);
                    bannedID = bytes.toString(CryptoJS.enc.Utf8);
                };
            };
            console.log(bannedID);

            
            // Now get all of the current bans on the server
            await reloadServerBans(rCon);
            rCon.sendCommand('bans', async(bans) => {
                console.log("Encrypted IP: " + encryptedIP);
                // Split player list string (Remove first 3, and last line)
                let bansStringArray = bans.split("\n");
                bansStringArray.splice(0, 3);
                bansStringArray = bansStringArray.filter(e => e)

                // Remove IP ban labels
                bansStringArray.splice(bansStringArray.indexOf("IP Bans:"), 3);

                console.log("Banned ID: " + bannedID);

                // Filter through each individual ban, converting the string to an array
                let banFound = [];
                for (const ban of bansStringArray) {
                    if (banFound.length > 0) break;
                    // Filter ID, BannedID, Minutes Left & Reason
                    const splitArray = ban.split(" ");
                    const banFiltered = splitArray.filter(e => e);
                    banFiltered.splice(2, banFiltered.length);
                    
                    console.log("Ban Filtered: " + banFiltered);
                    console.log(banFiltered[1]);

                    if (banFiltered[1] === bannedID) {
                        banFound.push(banFiltered[0]);
                    };
                };
                console.log(banFound);

                if (banFound.length === 0) return res.sendStatus(404);

                rCon.sendCommand(`removeBan ${banFound[0]}`, async(err) => {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(503);
                    };
                    await reloadServerBans(rCon);

                    // Now update the database
                    let whereColumn = "guid";
                    if (banTable === "ip_bans") {
                        whereColumn = "ip";
                        bannedID = encryptedIP;
                    };

                    console.log(whereColumn);
                    console.log(bannedID);

                    const unbanQuery = await sql.awaitQuery(`INSERT INTO unbans (id, banned_id, time_ban, time_expire, banned_by, ban_reason, unbanned_by, unban_reason) SELECT id, ${whereColumn}, time_ban, time_expire, banned_by, reason, ?, ? FROM ${banTable} WHERE ${whereColumn} = '${bannedID}'`, [data.pid, reason]);
                    const deleteBanQuery = await sql.awaitQuery(`DELETE FROM ${banTable} WHERE ${whereColumn} = ?`, [bannedID]);
                    if (unbanQuery.length <= 0 || deleteBanQuery.length <= 0) return res.sendStatus(404);
                
                    return res.sendStatus(200);
                });
            });
        });
    });

    // Fetch All Active Bans (From DB)
    app.get('/rcon/bans', checkToken, async (req, res) => {
        const bansQuery = await sql.awaitQuery(`
            SELECT bans.*, players.name FROM bans 
                INNER JOIN players 
                ON bans.banned_by = players.name
                WHERE (time_expire > CURRENT_TIMESTAMP() OR time_expire IS NULL) 
            UNION ALL 
            SELECT ip_bans.*, players.name FROM ip_bans 
                INNER JOIN players ON 
                ip_bans.banned_by = players.pid
                WHERE (time_expire > CURRENT_TIMESTAMP() OR time_expire IS NULL)`);

        let bans = [];
        for (const ban of bansQuery) {
            console.log(ban);
            let banType = 0;
            let bannedUser = ban["guid"];
            if (bannedUser.length > 35) {
                banType = 1;
                const bytes = CryptoJS.AES.decrypt(bannedUser.toString(), process.env.IP_SECRET);
                bannedUser = bytes.toString(CryptoJS.enc.Utf8);
            };
            bans.push({
                ...ban,
                user: bannedUser,
                type: banType,
                guid: undefined
            });
        };
        return res.send(bans);
    });

    // Fetch All Expired Bans (From DB)
    app.get('/rcon/expired_bans', checkToken, async (req, res) => {
        const bansQuery = await sql.awaitQuery("SELECT * FROM bans WHERE time_expire < CURRENT_TIMESTAMP() UNION ALL SELECT * FROM ip_bans WHERE time_expire < CURRENT_TIMESTAMP()");
        console.log(bansQuery);

        let bans = [];
        for (const ban of bansQuery) {
            console.log(ban);
            let banType = 0;
            let bannedUser = ban["guid"];
            if (bannedUser.length > 35) {
                banType = 1;
                const bytes = CryptoJS.AES.decrypt(bannedUser.toString(), process.env.IP_SECRET);
                bannedUser = bytes.toString(CryptoJS.enc.Utf8);
            };
            bans.push({
                id: ban["id"],
                type: banType,
                user: bannedUser,
                time_ban: ban["time_ban"],
                time_expire: ban["time_expire"],
                banned_by: ban["banned_by"],
                reason: ban["reason"]
            });
        };
        return res.send(bans);
    });

    app.get('/rcon/debugBans', checkToken, async (req, res) => {
        rCon.sendCommand(`bans`, async (bans) => {
            console.log(bans)
            rCon.sendCommand(`removeBan 0`, async (err) => { });
            reloadServerBans(rCon);
        });

    });
};

module.exports = rconController;