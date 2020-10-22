import React, { useContext, useEffect } from "react";
import Login from '../pages/login';
import NotFoundPage from '../pages/404';

import {Switch, Route} from 'react-router-dom';
import UserContext from "../services/UserContext";

const Main = () => {
    const [attemptedSignOn, setAttemptedSignOn] = React.useState(false);

    const { setUser} = useContext(UserContext);
    
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/auth/verifyToken`, {
                    method: "get", 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: "include"
                })
                if(response !== undefined) {
                    const data = await response.json();
                    setUser(data)
                }
            } catch {
                console.log("User details not detected")
            } finally {
                setAttemptedSignOn(true)
            }
        }

        checkLogin()
    }, [setUser, setAttemptedSignOn])

    if(attemptedSignOn === false) return <div></div>
    return (
        <div>
            <Switch> {/* The Switch decides which component to show based on the current URL.*/}
                <Route exact path='/login' component={Login}/>
                <Route path="*" component={NotFoundPage} />
            </Switch>
        </div>
    )
}

export default Main;