const BattleNode = require('battle-node');
const dotenv = require('dotenv');

dotenv.config();

const getPlayers = (rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand('players', async(players) => {
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
        })
    })
    
}

const disconnectRCON = (RCON) => {
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

const getUserByGUID = async (guid, rcon) => {
        const players = await getPlayers(rcon);

        console.log(players.find(player => player.guid === guid))
        return players.find(player => player.guid === guid) || undefined
};

const rconConnection = () => {
    return new Promise((resolve, reject) => {
        console.log("Attempting to connect to rCon"); // DEBUG ONLY

        const RCON = new BattleNode({
            ip: process.env.RCON_IP,
            port: parseInt(process.env.RCON_PORT),
            rconPassword: process.env.RCON_PASS
        });

        RCON.login();

        console.log(process.env.RCON_IP)

        RCON.on('login', (err, success) => {
            if (err) {
                console.log('Unable to connect to the rCon serve.')
                reject("Unable to connect to the rCon server");
            };
            if (success) {
                console.log('Logged into rCon successfully.');
                resolve(RCON);
            } else {
                console.log('Unsuccessful logon attempt to rCon, please check inputs.');
                reject("Unsuccessful logon attempt to rCon, please check inputs");
            };
        });
    }); 
};

const writeBans = (rcon) => {
    return  new Promise((resolve, reject) => {
        rcon.sendCommand('writeBans', async(err) => {
            if (err) {
                reject(err)
            };
            resolve(true)
        });
    })
}

const loadBans = (rcon) => {
    return  new Promise((resolve, reject) => {
        rcon.sendCommand('loadBans', async(err) => {
            if (err) {
                reject(err)
            };
            resolve(true)
        });
    })
}


const reloadServerBans = async (rcon) => {
        console.log("Now reloading the bans on the server"); // DEBUG ONLY

        try {
            await writeBans(rcon);
            await loadBans(rcon);    
        } catch(err) {
            console.log(err)
            return false
        }
      
        return true
};

const kickPlayer = (reason, guid, rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand(`kick ${guid} ${reason}}`, async(err) => {
            if (err) {
                reject(err)
            };

            // Now ban the IP using `addBan`

            resolve(true)
        });
    })
}

const banPlayer = (reason, guid, length, rcon) => {
    return new Promise((resolve, reject) => {
        rcon.sendCommand(`addBan ${guid} ${length} ${reason}`, async(err) => {
            if (err) {
                reject(err)
            };
            await reloadServerBans(rcon);
            resolve(true)
        });
    })
}

module.exports = {
    disconnectRCON,
    getUserByGUID,
    rconConnection,
    reloadServerBans,
    getPlayers,
    kickPlayer,
    banPlayer
}