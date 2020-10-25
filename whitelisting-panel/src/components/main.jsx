import React, { useContext, useEffect } from "react";
import Login from '../pages/login';
import NotFoundPage from '../pages/404';

import {Switch, Route, Redirect} from 'react-router-dom';
import UserContext from "../services/UserContext";
import Users from "../pages/users";

//Protected Routes Are Pages that can only be accessed when signed in
const ProtectedRoute = ({ component: Component, ...rest }) => {
    const {user} = useContext(UserContext);
    return (
      <Route {...rest} render={(props) => (
        user !== undefined
          ? <Component {...props} />
          : <Redirect to='/login' />
      )} />
    ) 
  }
  
  // Guarded Routes are routes that require specific role permissions to access
  const GuardedRoute = ({roles, component: Component, ...rest }) => {
    const {user} = useContext(UserContext);
    return (
      <Route {...rest} render={(props) => (
        (
            (user.adminLevel || 0) >= (roles.adminLevel || 99) ||
            (user.copLevel || 0) >= (roles.copLevel || 99) ||
            (user.emsLevel || 0) >= (roles.emsLevel || 99)
        )
          ? <Component {...props} />
          : <Redirect to='/login' />
      )} />
    ) 
  }

const Main = () => {
    const [attemptedSignOn, setAttemptedSignOn] = React.useState(false);

    const { setUser } = useContext(UserContext);
    
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
        <>
            <Switch> {/* The Switch decides which component to show based on the current URL.*/}
                <ProtectedRoute exact path='/dashboard' component={NotFoundPage}/>
                <ProtectedRoute exact path='/users' component={Users}/>
                <GuardedRoute exact path='/dashboard2' roles={{adminLevel: 0, copLevel: 2}} component={NotFoundPage}/>
                <Route exact path='/login' component={Login}/>
                <Route path="*" component={NotFoundPage} />
            </Switch>            
        </>
    )
}

export default Main;