const BattleNode = require('battle-node');
const dotenv = require('dotenv');

dotenv.config();

const rCon = new BattleNode({
    ip: process.env.RCON_IP,
    port: parseInt(process.env.RCON_PORT),
    rconPassword: process.env.RCON_PASS,
});

rCon.login();

rCon.on('login', (err, success) => {
    if (err) {
        console.log('Unable to connect to the RCON server.');
    };
    if (success) {
        console.log('Logged into RCON successfully.');
    } else {
        console.log('Unsuccessful logon attempt to RCON, please check inputs.');
    };
});

rCon.on('message', function(message) {
  
  console.log(message);
  
});

module.exports = { rCon };