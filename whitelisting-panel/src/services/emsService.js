export const getEms = async (page, count, minRank) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/medic/users?c=${count}}&p=${page}&mR=${minRank}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const searchEms = async (term, page, pageLength, minRank) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/medic/search?uname=${term}&p=${page}&c=${pageLength}&mR=${minRank}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export default {
    getEms,
    searchEms
};