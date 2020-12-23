import React, {useContext, useEffect} from 'react';
import UserContext from '../services/UserContext';
import { getRole } from "../services/HelperService";

import { getUserSteam } from '../services/UserService';
import {ReactComponent as ASLogo} from "../assets/logo-white.svg";

const Header = () => {
    const { user } = useContext(UserContext);
    const [profileUrl, setProfileUrl] = React.useState()

    useEffect(() => {
        if(!user) return
        const getSteamDetails = async () => {
            const steamDetails = await getUserSteam(user.pid);

            setProfileUrl(steamDetails.avatarUrl)
        }
        getSteamDetails()
        
    }, [user, setProfileUrl])
    return (
        <header>
            <div className="header-left">
                <ASLogo className="header-logo"/> ARMA STUDIOS
            </div>
            <div className="header-right">
                <div className="user-info">
                    <span className="user-name"><b>{user ? user.name : "Arma Studios"}</b></span>
                    <span className="role">{user ? getRole(user) : "Not signed in"}</span>
                </div>
                {profileUrl ? <img alt="avatar" className="avatar" src={profileUrl}/> : ''}
                
            </div>
        </header>
    )
}

export default Header;