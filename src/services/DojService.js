export const updateDoj = async (pid, level, dept) => {
    
    const whitelistResponse =  fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/doj/whitelist`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid, 
            level: level
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const departmentResponse = fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/doj/set-department`,  {
        method: "POST",
        body: JSON.stringify({
            pid: pid, 
            department: dept
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    await Promise.all([departmentResponse, whitelistResponse]);
    return true;
}

export default {
    updateDoj
}