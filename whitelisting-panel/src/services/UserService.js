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
    console.log(cash, bank, pid)
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

export const saveDev = async (level, devdept, pid) => {
    const levelResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/dev/setLevel/`,  {
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

    const deptResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/dev/setDepartment/`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid,
            level: devdept,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const res2 = await deptResponse.status;

    return [res, res2]
}
export default {
    getUsers,
    searchUsers,
    getUserById,
    getUserSteam,
    saveMoney,
    saveCop,
    saveEms,
    saveDev,
};