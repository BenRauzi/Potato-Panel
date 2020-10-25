import React, {useContext} from 'react';
import UserContext from '../services/UserContext';

const Header = () => {
    const { user } = useContext(UserContext);

    return (
        <header>
            <div className="header-left">
                ArmA-Studios
            </div>
            <div className="header-right">
                <div className="user-info">
                    <span className="user-name"><b>{user ? user.username : "Arma Studios"}</b></span>
                    <span className="role">{user ? "Administrator" : "Not signed in"}</span>
                </div>
                <img alt="avatar" className="avatar" src="assets/icon.png"/>
            </div>
        </header>
    )
}

export default Header;