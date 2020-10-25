import React, { useContext } from 'react';

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowRestore, faUsers, faIdBadge, faUserNurse, faUserTie, faUserCog, faSlidersH, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import { faAccessibleIcon } from "@fortawesome/free-brands-svg-icons"

import { logout } from '../services/AuthService';
import UserContext from '../services/UserContext';

const MainNav = () => {
    const { setUser } = useContext(UserContext)
    return (
        <nav>
            <ul>
                <li>
                   
                    <Link to="/dashboard">

                        <div className="nav-icon">
                            <FontAwesomeIcon  alt="Dashboard" icon={faWindowRestore}/>
                        </div>
                        
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/users">

                        <div className="nav-icon">
                        <FontAwesomeIcon className="nav-icon" alt="Users" icon={faUsers}/>
                        </div>

                       
                        <span>Users</span>
                    </Link>   
                </li>
                <li>
                    <Link to="/police">

                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon"alt="Police Roster" icon={faIdBadge}/>
                        </div>

                        
                        <span>Police Roster</span>
                    </Link>
                </li>
                <li>
                    <Link to="/ems">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon"alt="EMS Roster" icon={faUserNurse}/>
                        </div>
                        
                        <span>EMS Roster</span>
                    </Link>
                </li>
                <li>
                    <Link to="/staff">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Staff Roster" icon={faUserTie}/>
                        </div>
                        
                        <span>Staff Roster</span>
                    </Link>
                </li>
                <li>
                    <Link to="/dev">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Dev Roster" icon={faAccessibleIcon}/>
                        </div>
                        
                        <span>Dev Roster</span>
                    </Link>                        
                </li>
                <li>
                    <Link to="/settings">
                         <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Settings" icon={faUserCog}/>
                        </div>
                        
                        <span>Settings</span>
                    </Link>
                      
                </li>
                <li>
                    <Link to="">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Server Settings" icon={faSlidersH}/>
                        </div>
                        
                        <span>Server Settings</span>
                    </Link>
                </li>
                <li>
                    <Link to="/login" onClick={() => logout(setUser)}>
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Server Settings" icon={faSignOutAlt}/>
                        </div>
                        
                        <span>Logout</span>
                    </Link>
                        
                </li>
            </ul>
        </nav>
    )
}

export default MainNav;