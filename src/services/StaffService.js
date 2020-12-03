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

export default {
    getStaff,
    searchStaff
};