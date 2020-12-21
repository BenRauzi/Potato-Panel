export const getPlayers = async () => {
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/players`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const getBans = async () => {
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/bans`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const kickPlayer = async (guid, reason) => {
    if(!reason) return 404
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/kick`,  {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pid: guid,
            reason: reason
        })
    })

    const res = await response.status;

    return res 
}


export const banPlayerGuid = async (guid, reason, length) => {
    if(!reason) return 404
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/ban`,  {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            banID: guid,
            banLength: length,
            reason: reason,
        })
    })

    const res = await response.status;

    return res
}

export const banPlayerIP = async (ip, reason, length) => {
    if(!reason) return 404
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/ban`,  {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            banID: ip,
            banLength: length,
            reason: reason,
        })
    })

    const res = await response.status;

    return res
}

export const messagePlayer = async (playerId, message) => {
    if(!message) return 404
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/message`,  {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pid: playerId,
            message: message
        })
    })

    const res = await response.status;

    return res
}

export const messageAll = async (message) => {
    if(!message) return 404
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/message`,  {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pid: -1,
            message: message
        })
    })

    const res = await response.status;

    return res
}


export const removeBan = async (id, reason) => {
    if(!reason) return 404
    const response = await fetch(`${process.env.REACT_APP_RCON_URL || 'http://localhost:9000'}/rcon/unban`,  {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            banID: id,
            reason: reason
        })
    })

    const res = await response.status;

    return res
}

export default {
    getPlayers,
    kickPlayer,
    banPlayerGuid,
    banPlayerIP,
    messagePlayer,
    messageAll,
    getBans,
    removeBan
}