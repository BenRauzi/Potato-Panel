export const getPolice = async (page, count, minRank) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/police/users?c=${count}}&p=${page}&mR=${minRank}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const searchPolice = async (term, page, pageLength, minRank) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/police/search?uname=${term}&p=${page}&c=${pageLength}&mR=${minRank}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

module.exports = {
    getPolice,
    searchPolice
};