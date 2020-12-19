const dotenv = require('dotenv');
const fetch = require("node-fetch");

dotenv.config();

const getSteamInfo = async(pid) => {
    const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${pid}`, {
            method: "GET"
    })

    const steamDetails = await response.json()
    const { personaname, profileurl, avatarfull } = steamDetails.response.players[0]

    return {
        profileName: personaname,
        profileUrl: profileurl,
        avatarUrl: avatarfull
    }
} 

module.exports = {
    getSteamInfo
}