export const getVehicles = async (page, count, side, type) => {
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/vehicles?c=${count}&p=${page}${side !== "Any" && side !== undefined ? `&side=${side}` : ''}${type !== "Any" && type !== undefined ? `&type=${type}` : ''}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
};

export const searchVehicles = async (term, page, pageLength, side, type) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/vehicles/search?uname=${term}&p=${page}&c=${pageLength}${side !== "Any" && side !== undefined ? `&side=${side}` : ''}${type !== "Any" && type !== undefined ? `&type=${type}` : ''}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export default {
    getVehicles,
    searchVehicles
};