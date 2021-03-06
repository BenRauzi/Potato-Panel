export const login = async (username, password, setUser) => {
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/auth/login`,  {
        method: "POST",
        body: JSON.stringify({username: username, password: password}),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const code = await response.status;
    
    if (code === 401) return 401;
    if (code === 429) return 429
    const data = await response.json();
    setUser(data)
    return 200;
}

export const logout = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/auth/logout`,  {
        method: "POST",
        body: '',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })

    const code = await response.status;
    
    if (code === 401) return false;
    return true;
}

export default {
    login,
    logout
}

