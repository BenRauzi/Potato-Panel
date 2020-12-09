export const getStaff = async (page, count, minRank) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/staff/users?c=${count}}&p=${page}&mR=${minRank}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const searchStaff = async (term, page, pageLength, minRank) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/staff/search?uname=${term}&p=${page}&c=${pageLength}&mR=${minRank}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export const getCases = async (page, count) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/cases?c=${count}}&p=${page}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const getFilteredCases = async (page, count, caseType) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/cases/filter?c=${count}}&p=${page}&type=${caseType}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const getCase = async (caseId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/case?id=${caseId}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export default {
    getStaff,
    searchStaff,
    getCases,
    getFilteredCases,
    getCase,
};