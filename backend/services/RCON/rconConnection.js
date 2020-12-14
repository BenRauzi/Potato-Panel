exports.rconConnection = () => {
    return new Promise((resolve, reject) => {
        console.log("Attempting to connect to rCon"); // DEBUG ONLY
        const BattleNode = require('battle-node');
        const dotenv = require('dotenv');

        dotenv.config();

        const RCON = new BattleNode({
            ip: process.env.RCON_IP,
            port: parseInt(process.env.RCON_PORT),
            rconPassword: process.env.RCON_PASS
        });

        RCON.login();

        RCON.on('login', (err, success) => {
            if (err) {
                console.log('Unable to connect to the rCon server (NEW).'),
                reject();
            };
            if (success) {
                console.log('Logged into rCon successfully (NEW).');
                resolve(RCON);
            } else {
                console.log('Unsuccessful logon attempt to rCon, please check inputs (NEW).');
                reject();
            };
        });
    }); 
};