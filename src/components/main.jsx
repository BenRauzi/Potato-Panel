import React, { useContext, useEffect } from "react";
import Login from '../pages/login';
import NotFoundPage from '../pages/404';

import {Switch, Route, Redirect} from 'react-router-dom';
import UserContext from "../services/UserContext";
import Users from "../pages/users";
import Staff from "../pages/staff";
import Ems from "../pages/ems";
import Development from "../pages/development-team";
import Police from "../pages/police";
import Dashboard from "../pages/dashboard";
import ServerSettingsPage from "../pages/server-settings";
import SettingsPage from "../pages/settings";
import UserPage from "../pages/user";
import Vehicles from "../pages/vehicles";
import CasesPage from "../pages/cases";
import SingleCasePage from "../pages/single-case";
import NewCasePage from "../pages/new-case";
import BattleyePage from "../pages/battleye";
import BansPage from "../pages/bans";

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
                {/* General */}
                <ProtectedRoute exact path='/dashboard' component={NotFoundPage}/>
                
                <ProtectedRoute exact path="/user/:id" component={UserPage} />
                <ProtectedRoute exact path='/settings' component={SettingsPage}/>


                {/* Rosters */}
                <ProtectedRoute exact path='/police' component={Police}/>
                <ProtectedRoute exact path='/medic' component={Ems}/>
                <ProtectedRoute exact path='/development-team' component={Development}/>
                <ProtectedRoute exact path='/staff' component={Staff}/>
                
                <GuardedRoute exact path='/vehicles' roles={{adminLevel: 1}} component={Vehicles}/>

                {/* Support */}
                <GuardedRoute exact path='/cases' roles={{adminLevel: 2}} component={CasesPage}/>
                <GuardedRoute exact path='/case/new' roles={{adminLevel: 2}} component={NewCasePage}/>
                <GuardedRoute exact path='/case/:id' roles={{adminLevel: 2}} component={SingleCasePage}/>
                
                {/* RCON / Administration */}
                <ProtectedRoute exact path='/users' component={Users}/>
                {/* <GuardedRoute exact path='/users' roles={{adminLevel: 1}} component={Users}/> */}

                <GuardedRoute exact path='/battleye' roles={{adminLevel: 3}} component={BattleyePage}/>
                <GuardedRoute exact path='/bans' roles={{adminLevel: 4}} component={BansPage}/>
                <GuardedRoute exact path='/server-settings' roles={{adminLevel: 7}} component={ServerSettingsPage}/>
               
                <Route exact path='/login' component={Login}/>

                {/* Guards */}
                <ProtectedRoute exact path="/" component={Dashboard} />
                <Route path="*" component={NotFoundPage} />
            </Switch>            
        </>
    )
}

export default Main;