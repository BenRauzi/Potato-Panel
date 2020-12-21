import BattleNode from 'battle-node';
import dotenv from 'dotenv';

dotenv.config();

export const rCon = new BattleNode({
    ip: process.env.RCON_IP,
    port: parseInt(process.env.RCON_PORT),
    rconPassword: process.env.RCON_PASS,
});

rCon.login();

rCon.on('login', (err, success) => {
    if (err) return console.log('Unable to connect to the RCON server.');
    if (success) return console.log('Logged into RCON successfully.');
    console.log('Unsuccessful logon attempt to RCON, please check inputs.');
});

export default { rCon };