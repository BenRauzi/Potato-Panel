const jwt = require("jsonwebtoken");
const { checkToken } = require("../services/authService");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

const { getPlayers, getUserByGUID, reloadServerBans, rconConnection, kickPlayer, banPlayer } = require("../services/rconHelpers")

const rconController = (app, rcon, sql) => {
    // Send a Message (Global & Private)
    app.post('/rcon/message', checkToken, async(req, res) => {
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            let { pid, message } = req.body;
            const user = data.user;

            // Check users permissions here..

            try {
                rcon.sendCommand(`say ${pid} [${user}] ${message}`, async(err) => {
                    if (err) {
                        console.log(err);
                    };
                });

                // Log to Console (DEBUG)
                console.log(`RCON: '${user}' just sent the following message to '${pid}': ${message}.`);

                // Disconnected RCON

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
                // Fetch Players List
                const playersArray = await getPlayers(rcon)
                    // Log to Console (DEBUG)
                console.log(`RCON: '${data.user}' has just fetched the players list.`);


                return res.send(playersArray);
            
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
                // If given ID is a GUID, then convert it to their player list ID
                const player = await getUserByGUID(playersID, rcon);
                if(!player) return res.sendStatus(404);
                return res.send(player);

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

            rcon.sendCommand(`kick ${pid} Reason: ${reason} | ${user}`, async(err) => {
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

            const players = await getPlayers(rcon);

            const { banID, banLength, reason } = req.body;

            let banIDType = "guid";
            if(banID.includes(".")) {
                banIDType = "ip";
            };

            let appealIdLength = banIDType === "guid" ? 10 : 11 //10 if GUID,  11 if IP

            const userToBan = players.find(player => player[banIDType] === banID);

            //Generate Appeal ID
            const rand = crypto.randomBytes(appealIdLength);
            let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            let banAppealID = "";
            for (let i = 0; i < rand.length; i++) {
                let index = rand[i] % chars.length;
                banAppealID += chars[index];
            };
            const banReason = `(   Ban ID: ${banAppealID} - appeal.arma-studios.com`;

            if(userToBan) {
                try {
                    const result = await kickPlayer(`Account Banned - ${banReason.substring(4)}`, userToBan.id, rcon);
                    if(result) console.log("Kicked Player");
                }  catch(err) {
                    console.log(err)
                    return res.sendStatus(500);
                }
            }
            
            try {
                const result = await banPlayer(banReason, banID, banLength, rcon);
                if(result) console.log("Banned Player");
            } catch(err) {
                console.log(err);
                return res.sendStatus(500);
            };

            try {
                await reloadServerBans();
            } catch(err) {
                console.log(err);
            };


            // Log ban to database
            try {
                const banTable = banIDType === "ip" ? "ip_bans" : "bans";
                const banColumn = banIDType === "ip" ? "ip" : "guid";
                const banningLogID = banIDType === "ip" ? CryptoJS.AES.encrypt(banID, process.env.IP_SECRET).toString() : banID;

                console.log("Players GUID: " + banID);

                if (banLength < 1) {
                    await sql.awaitQuery(`INSERT INTO ${banTable} (id, ${banColumn}, banned_by, reason) VALUES (?, ?, ?, ?)`, [banAppealID, banningLogID, data.pid, reason]);
                } else {
                    // Get the expire datestamp
                    const curDBTime = await sql.awaitQuery(`SELECT CURRENT_TIMESTAMP()`);
                    const time_expire = moment(curDBTime[0]["CURRENT_TIMESTAMP()"]).add(banLength, 'm').toDate();
                    await sql.awaitQuery(`INSERT INTO ${banTable} (id, ${banColumn}, time_expire, banned_by, reason) VALUES (?, ?, ?, ?, ?)`, [banAppealID, banningLogID, time_expire, data.pid, reason]);
                };

                return res.sendStatus(200);
            } catch (error) {
                console.log(error)
                return res.sendStatus(500)
            };
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
            await reloadServerBans(rcon);
            rcon.sendCommand('bans', async(bans) => {
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

                rcon.sendCommand(`removeBan ${banFound[0]}`, async(err) => {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(503);
                    };
                    await reloadServerBans(rcon);

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
                ON bans.banned_by = players.pid
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
        rcon.sendCommand(`bans`, async (bans) => {
            console.log(bans)
            rcon.sendCommand(`removeBan 0`, async (err) => { });
            reloadServerBans(rcon);
        });

    });
};

module.exports = rconController;