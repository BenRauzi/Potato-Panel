import React, {useContext, useEffect} from 'react';
import UserContext from '../services/UserContext';
import { getRole } from "../services/HelperService";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheelchair } from '@fortawesome/free-solid-svg-icons'
import { getUserSteam } from '../services/UserService';

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
                <FontAwesomeIcon icon={faWheelchair}/> ARMA STUDIOS
            </div>
            <div className="header-right">
                <div className="user-info">
                    <span className="user-name"><b>{user ? user.username : "Arma Studios"}</b></span>
                    <span className="role">{user ? getRole(user) : "Not signed in"}</span>
                </div>
                {profileUrl ? <img alt="avatar" className="avatar" src={profileUrl}/> : ''}
                
            </div>
        </header>
    )
}

export default Header;