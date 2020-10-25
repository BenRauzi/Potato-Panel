import React, {useContext} from 'react';

import { login } from '../services/AuthService';
import UserContext from '../services/UserContext';

const Login = () => {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const { user, setUser } = useContext(UserContext);

    let validateForm = () => {
        return username.length > 0 && password.length > 0;
    }

    const handleLogin = (event) => {
        event.preventDefault();

        login(username, password, setUser)
    }
    
    const logout = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/auth/logout`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include"
        })

        const data = await response.status;
        setUser(undefined)
        console.log(data)
    }

    return (
        <div className="login-form">
             <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" name="username" onChange={e => setUsername(e.target.value)} required/>
                <input type="password" placeholder="Password" name="password" onChange={e => setPassword(e.target.value)} required/>

                <button disabled={!validateForm()} type="submit">Login</button>
                {/* <label><input type="checkbox" checked="checked" name="remember"/>Remember me</label>  */}
            </form>

            {username}
            {password}

            <br/>Test: {JSON.stringify(user)}

            <button onClick={() => logout()}>Logout</button>
        </div>
    )
}


export default Login;