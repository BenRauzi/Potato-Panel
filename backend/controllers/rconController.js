const rconController = (app, rCon) => {
    // Fetch All Players
    app.get('/rcon/players', (req, res) => {
        console.log(rCon);
        rCon.sendCommand('players', (players) => {
            // Split player list string (Remove first 3, and last line)
            const playersStringArray = players.split("\n");
            playersStringArray.splice(0, 3);
            playersStringArray.pop();

            // Filter through each individual players information, converting the string to an array
            let playersArray = [];
            playersStringArray.forEach(player => {
                // Filter ID, IP:PORT, Ping & GUID
                const splitArray = player.split(" ");
                const playerFiltered = splitArray.filter(e => e);
                const playersNameArray = playerFiltered.slice(4, playerFiltered.length);

                // Get players name, and join them to one string (if multiple words)
                playerFiltered.splice(4, playerFiltered.length);
                playerFiltered.push(playersNameArray.join(" "));
            
                // Push filtered players data to master array
                playersArray.push(playerFiltered);
            });
            res.send(playersArray);
        });
    });
};

module.exports = rconController;