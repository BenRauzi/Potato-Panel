export const getUsers = async (page, count) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/users?c=${count}}&p=${page}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const searchUsers = async (term, page, pageLength) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/search?uname=${term}&p=${page}&c=${pageLength}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export const getUserById = async (id) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/?pid=${id}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export const getUserSteam = async (id) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/steam/?pid=${id}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export const saveMoney = async (cash, bank, pid) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/setFinance/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            cash: cash,
            bank: bank
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const res = await response.status;

    return res
}

export const saveCop = async (level, copdept, pid) => {
    const levelResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/police/setLevel/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: level,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const res = await levelResponse.status;

    const deptResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/police/setDepartment/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: copdept,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const res2 = await deptResponse.status;

    return [res, res2]
}

export const saveEms = async (level, emsdept, pid) => {
    const levelResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/medic/setLevel/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: level,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const res = await levelResponse.status;

    const deptResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/medic/setDepartment/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: emsdept,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const res2 = await deptResponse.status;

    return [res, res2]
}

export const saveStaff = async (staffLevel, devLevel, name, pid) => {
    const staffResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/admin/setLevelP/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: staffLevel,
            username: name,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    

    const devResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/dev/setLevel/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: devLevel,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    await devResponse.status;

    const code = staffResponse.status
    if(code !== 200) return false
    const response = await staffResponse.json();

    if(response.pass)alert(`New Account - Password: ${response.pass}`)
    if(response.pass) return response.pass;
    return false
}

export const getLicenses = async (pid) => {
    const devResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/licenses?pid=${pid}`,  {
        method: "GET",
        
        credentials: "include"
    })

    const res = devResponse.json();

    return res
}

export const setLicense = async (pid, license, level) => {
    const devResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/setLicense`,  {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pid: pid,
            license: license,
            value: level
        }),
        credentials: "include"
    })

    const res = devResponse.status;

    return res
}

export const getUserVehicles = async (pid, side) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/vehicles/user?pid=${pid}&side=${side}`,  {
        method: "GET",
        
        credentials: "include"
    })

    const res = response.json();

    return res
}

export default {
    getUsers,
    searchUsers,
    getUserById,
    getUserSteam,
    saveMoney,
    saveCop,
    saveEms,
    saveStaff,
    getLicenses,
    setLicense,
    getUserVehicles,
};