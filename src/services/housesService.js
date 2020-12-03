export const getHousesByID = async (pid) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/houses?pid=${pid}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export const removeHouse = async (houseId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/house/remove`,  {
        method: "POST",
        body: JSON.stringify({id: houseId}),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const code = await response.status;

    if(code !== 200) return alert(`An error occured during deletion, error code: ${code}`)
}

export const getContainersByID = async (pid) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/user/containers?pid=${pid}`,  {
        method: "GET",
        credentials: "include"
    })

    const res = await response.json();

    return res
}

export const removeContainer = async (containerId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/container/remove`,  {
        method: "POST",
        body: JSON.stringify({id: containerId}),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const code = await response.status;

    if(code !== 200) return alert(`An error occured during deletion, error code: ${code}`)
}
export default {
    getHousesByID,
    removeHouse,
    getContainersByID,
    removeContainer,
}