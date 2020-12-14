exports.reloadServerBans = (rCon) => {
    return new Promise((resolve) => {
        console.log("Now reloading the bans on the server"); // DEBUG ONLY
        rCon.sendCommand('writeBans', async(err) => {
            if (err) {
                console.log(err);
                return res.sendStatus(503);
            };
            rCon.sendCommand('loadBans', async(err) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(503);
                };
            });
        });
        resolve();
    }); 
};