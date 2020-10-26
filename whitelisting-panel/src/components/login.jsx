import React, {useContext} from 'react';
import { Redirect } from 'react-router-dom';

import { login, logout } from '../services/AuthService';
import UserContext from '../services/UserContext';

const Login = () => {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const { user, setUser } = useContext(UserContext);

    if(user) return <Redirect to="/"/>

    let validateForm = () => {
        return username.length > 0 && password.length > 0;
    }

    const handleLogin = (event) => {
        event.preventDefault();

        login(username, password, setUser);
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

            <button onClick={() => logout(setUser)}>Logout</button>
        </div>
    )
}


export default Login;