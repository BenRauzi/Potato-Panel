import BattleNode from 'battle-node';
import dotenv from 'dotenv';

dotenv.config();


let rCon = new BattleNode({
    ip: process.env.RCON_IP,
    port: parseInt(process.env.RCON_PORT),
    rconPassword: process.env.RCON_PASS,
});

let isConnected = false;
rCon.login();

const onLogin = (err, success) => {
    if (err) return console.log('Unable to connect to the RCON server.');
    if (success) {
        isConnected = true; 
        console.log('Logged into RCON successfully.');
    } else {
        console.log('Unsuccessful logon attempt to RCON, please check inputs.');
    }
}
rCon.on('login', onLogin);

rCon.on('disconnected', async function() {
    isConnected = false;
    let reconnectCounter = 1;
    while(!isConnected) {
        console.log(`RCON Server disconnected. Attempting reconnect... Attempt ${reconnectCounter}`);

        rCon = new BattleNode({
            ip: process.env.RCON_IP,
            port: parseInt(process.env.RCON_PORT),
            rconPassword: process.env.RCON_PASS,
        });
        
        rCon.login();
        rCon.on('login', onLogin);


        reconnectCounter++;

        await new Promise(resolve => {
            setTimeout(resolve, 20000)
        })
    }
  });


export const getRcon = () => {
    return rCon
}

export default { getRcon };