exports.disconnectRCON = (RCON) => {
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