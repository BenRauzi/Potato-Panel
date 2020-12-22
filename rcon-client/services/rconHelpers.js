import dotenv from 'dotenv';
import CryptoJS from "crypto-js";
import bigInt from "big-integer";

dotenv.config();

export const getPlayers = (rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand('players', async (players) => {
            // Process raw string output from Battleye. Entire player list outputs as one string....
            const playersStringArray = players.split("\n");
            playersStringArray.splice(0, 3);
            playersStringArray.pop();

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

            resolve(playersArray);
        });
    });
};

export const disconnectRCON = (RCON) => {
    return new Promise((resolve) => {
        try {
            console.log('RCON: Attempting to disconnect.');
            console.log(RCON);
            RCON.on('disconnected', function() {
                console.log('RCON: Connection has been disconnect.');
            });
            console.log('RCON: Attemptioned finsihed.');
        } catch (error) {
            console.log('RCON: Connection has FAILED to be disconnected.');
        };
        resolve();
    }); 
};

export const getUserByGUID = async (guid, rcon) => {
    const players = await getPlayers(rcon);
    return players.find(player => player.guid === guid) || undefined;
};

export const writeBans = (rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand('writeBans', async (err) => {
            if (err) {
                reject(err);
            };
            resolve(true);
        });
    });
};

export const loadBans = (rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand('loadBans', async (err) => {
            if (err) {
                reject(err);
            };
            resolve(true);
        });
    });
};

export const reloadServerBans = async (rcon) => {
    console.log("Now reloading the bans on the server"); // DEBUG ONLY
    try {
        await writeBans(rcon);
        await loadBans(rcon);    
    } catch(err) {
        console.log(err);
        return false;
    };
    return true;
};

export const kickPlayer = (reason, id, rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand(`kick ${id} ${reason}`, async (err) => {
            if (err) {
                reject(err)
            };

            resolve(true);
        });
    });
};

export const banPlayer = (reason, guid, length, rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand(`addBan ${guid} ${length} ${reason}`, async (err) => {
            if (err) {
                reject(err)
            };
            await reloadServerBans(rcon);
            resolve(true);
        });;
    });
};

export const sendMessageRcon = (pid, message, rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand(`say ${pid} ${message}`, async (err) => {
            if (err) {
                console.log(err);
                reject(err)
            };
            resolve(true);
        });
    });
};

export const getBansFromRcon = (rcon) => {
    return new Promise((resolve) => {
        rcon.sendCommand('bans', async (bans) => {
            let bansStringArray = bans.split("\n");
            bansStringArray.splice(0, 3);
            bansStringArray = bansStringArray.filter(e => e);

            // Remove IP ban labels
            bansStringArray.splice(bansStringArray.indexOf("IP Bans:"), 3);

            let filteredBans = bansStringArray.map(ban => {
                const splitArray = ban.split(" ");
                const banFiltered = splitArray.filter(e => e);
                banFiltered.splice(2, banFiltered.length);
                
                console.log("Ban Filtered: " + banFiltered);
                console.log(banFiltered[1]);

                return { id: banFiltered[0], user: banFiltered[1] };
            });
            resolve(filteredBans);
        });
    });
};

export const getBanFromDb = async (sql, banId) => {
    const banColumn = banId.length === 11 ? "ip" : "guid";
    const banTable = banColumn === "ip" ? "ip_bans" : "bans";
    
    const result = await sql.awaitQuery(`SELECT ${banColumn} FROM ${banTable} WHERE id = ?`, [banId]);

    if (result.length === 0) return { user: null }
    if (banColumn === "ip") {
        const encryptedIP = result[0].ip
        const bytes = CryptoJS.AES.decrypt(encryptedIP.toString(), process.env.IP_SECRET);
        const decyrptedIP = bytes.toString(CryptoJS.enc.Utf8);

        return {
            user: decyrptedIP
        };
    };
    return {
        user: result[0].guid
    };
};

export const removeBan = async (id, appealId, reason, staffId, sql, rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand(`removeBan ${id}`, async (err) => {
            if (err) {
                console.log(err);
                reject(err);
            };

            const column = appealId.length === 11 ? "ip" : "guid";
            const banTable = column === "ip" ? "ip_bans" : "bans";
            const unbanQuery = await sql.awaitQuery(`INSERT INTO unbans (id, banned_id, time_ban, time_expire, banned_by, ban_reason, unbanned_by, unban_reason) SELECT id, ${column}, time_ban, time_expire, banned_by, reason, ?, ? FROM ${banTable} WHERE id = '${appealId}'`, [staffId, reason]);
            const deleteBanQuery = await sql.awaitQuery(`DELETE FROM ${banTable} WHERE id = ?`, [appealId]);
            if (unbanQuery.length <= 0 || deleteBanQuery.length <= 0) reject("Ban Not Found");
        
            await reloadServerBans(rcon);

            resolve(true);
        });
    });
};

export const convertPID = async (pid) => {
    return new Promise((resolve, reject) => {
        if (!pid) return reject("No PID Given");
        let steamId = bigInt(pid);
        var parts = [0x42,0x45,0,0,0,0,0,0,0,0];
        for (var i = 2; i < 10; i++) {
            const response = steamId.divmod(256);
            steamId = response.quotient; 
            parts[i] = response.remainder.toJSNumber();
        };
        var wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(parts));
        var hash = CryptoJS.MD5(wordArray);
        resolve(hash.toString());
    });
};

export default {
    disconnectRCON,
    getUserByGUID,
    reloadServerBans,
    getPlayers,
    kickPlayer,
    banPlayer,
    getBansFromRcon,
    getBanFromDb,
    removeBan,
    sendMessageRcon,
    convertPID
};