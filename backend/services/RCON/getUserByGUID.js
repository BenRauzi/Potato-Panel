exports.getUserByGUID = (guid, rCon) => {
    return new Promise((resolve) => {
        console.log("Fetching player ID for GUID: " + guid); // DEBUG ONLY
        rCon.sendCommand('players', (players) => {
            const playersStringArray = players.split("\n");
            playersStringArray.splice(0, 3);
            playersStringArray.pop();
            let playersID;
            for (const player of playersStringArray) {
                if (playersID) break;
                const splitArray = player.split(" ");
                const playerFiltered = splitArray.filter(e => e);
                const playersGUID = playerFiltered[3].split("(")[0];
                if (playersGUID === guid) {
                    playersID = playerFiltered[0];
                };
            };
            if (!playersID) {
                playersID = -1;
            };
            console.log(playersID);
            resolve(playersID);
        });
    }); 
};