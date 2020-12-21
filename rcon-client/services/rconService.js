import BattleNode from 'battle-node';
import dotenv from 'dotenv';

dotenv.config();

export let rCon = new BattleNode({
    ip: process.env.RCON_IP,
    port: parseInt(process.env.RCON_PORT),
    rconPassword: process.env.RCON_PASS,
});

rCon.login();

rCon.on('login', (err, success) => {
    if (err) {
        console.log('Unable to connect to the RCON server.');
        attemptRestart();
        return 
    }
    if (success) {
        console.log('Logged into RCON successfully.');
    } else {
        console.log('Unsuccessful logon attempt to RCON, please check inputs.');
    }
});

const attemptRestart = async() => {
    const { exec } = require("child_process");

    exec("rs", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
rCon.on('disconnected', async function() {
        console.log(`RCON Server disconnected. Attempting reconnect...`);    

        attemptRestart();
});

export default { rCon };