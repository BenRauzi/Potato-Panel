export const getLogs = async (page, count, type) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/logs?c=${count}}&p=${page}&type=${type ? type : ''}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export default {
    getLogs
}