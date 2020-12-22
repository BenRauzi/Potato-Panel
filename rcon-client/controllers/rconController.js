import jwt from "jsonwebtoken";
import { checkToken } from "../services/authService";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import moment from 'moment';
import dotenv from 'dotenv';
import { getPlayers, getUserByGUID, reloadServerBans, sendMessageRcon, kickPlayer, banPlayer, getBansFromRcon, getBanFromDb, removeBan, convertPID } from "../services/rconHelpers";
import { jwtVerify } from "../services/authHelper";

dotenv.config();

export const rconController = (app, getRcon, sql) => {
    // Send a Message (Global & Private)
    app.post('/rcon/message', checkToken, async(req, res) => {
        const rcon = getRcon();

        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err, data) => {
            if(err) return res.sendStatus(401)
            let { pid, message } = req.body;
            const { user, name } = data;
            // Check users permissions here..
            try {

                if(pid !== -1) {
                    const player = await getUserByGUID(pid, rcon);
                    await sendMessageRcon(player.id, `[${name}] ${message}`, rcon);
                    console.log(`RCON: '${user}' just sent the following message to ${player.name} - '${pid}': ${message}.`);
                } else {
                    await sendMessageRcon(pid, `[${name}] ${message}`, rcon);
                    console.log(`RCON: '${user}' just sent the following message globally: ${message}.`);
                }

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
        const rcon = getRcon();
        try {
            const userData = await jwtVerify(req.cookies.authcookie);
            // Fetch Players List
            const playersArray = await getPlayers(rcon);
                // Log to Console (DEBUG)
            console.log(`RCON: '${userData.user}' has just fetched the players list.`);


            return res.send(playersArray.map(player => ({
                ...player,
                ip: undefined,
                // ip: userData.adminLevel >= 5 ? player.ip : undefined,
            })));
        
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        };
    });

    // Fetch a Player (Single)
    app.get('/rcon/player', checkToken, async(req, res) => {
        const rcon = getRcon();
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async (err, data) => {
            if(err) return res.sendStatus(401)
            let playersID = req.query.pid || 0; // Players ID

            // Check users permissions here..

            try {        
                // If given ID is a GUID, then convert it to their player list ID
                const player = await getUserByGUID(playersID, rcon);
                if(!player) return res.sendStatus(404);
                return res.send({...player, ip: undefined});

            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            };
        });
    });

    // Kick a Player (By ID)
    app.post('/rcon/kick', checkToken, async(req, res) => { // Will add checkToken
        const rcon = getRcon();
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            if(err) return res.sendStatus(401)
            const { pid, reason } = req.body;
            const { name } = data;

            const player = await getUserByGUID(pid, rcon);
            if(!player) return res.sendStatus(404);
            try {
                await kickPlayer(`${reason} | ${name}`, player.id, rcon)
                return res.sendStatus(200);
            } catch(err) {
                console.log(err);
                return res.sendStatus(500);
            }
        });
    });

    // Ban a Player (By ID [If on server], IP or BattlEYE GUID)
    app.post('/rcon/ban', checkToken, async(req, res) => { // Will add checkToken
        const rcon = getRcon();
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err, data) => {
            if(err) return res.sendStatus(401)
            const players = await getPlayers(rcon);

            const { banID, banLength, reason } = req.body;

            const banIDType = banID.includes(".") ? "ip" : "guid"

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
                await reloadServerBans(rcon);
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
        const rcon = getRcon();
        jwt.verify(req.cookies.authcookie, process.env.JWT_SECRET, async(err,data)=>{
            if(err) return res.sendStatus(401)
            const { banID, reason } = req.body;

            // Check what type of ID was given
                    
            // Now get all of the current bans on the server
            await reloadServerBans(rcon);

            
            const [ bans, banUser ] = await Promise.all([getBansFromRcon(rcon), getBanFromDb(sql, banID)])
            console.log(bans)
            console.log(banUser)
            if(bans.length === 0) return res.sendStatus(404);

            const ban = bans.find(({user}) => user == banUser.user);
            if(!ban) return res.sendStatus(404);
 
            await removeBan(ban.id, banID, reason, data.pid, sql, rcon);

            return res.sendStatus(200);
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

    // Set GUID
    app.get('/rcon/setGUID', async (req, res) => {
        const apiKey = req.query.k;
        const pid = req.query.pid;
        if (!apiKey || !pid) return res.sendStatus(500);
        if (apiKey !== process.env.WEB_API_KEY) return res.sendStatus(401);
        try {
            const guid = await convertPID(pid);
            const updateQuery = await sql.awaitQuery('UPDATE players SET guid = ? WHERE pid = ?', [guid, pid]);
            if (updateQuery.length === 0) return res.sendStatus(400);
            return res.sendStatus(200);
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        };
    });
};

export default rconController;