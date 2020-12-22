import React, { useContext } from 'react';

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowRestore, faCar, faUsers, faIdBadge, faUserNurse, faUserTie, faUserCog, faSlidersH, faSignOutAlt, faGavel, faEye, faClipboard } from '@fortawesome/free-solid-svg-icons'

import { faAccessibleIcon } from "@fortawesome/free-brands-svg-icons"

import { logout } from '../services/AuthService';
import UserContext from '../services/UserContext';

const MainNav = () => {
    const { user, setUser } = useContext(UserContext)

    const signOut = async (setUser) => {
        await logout();
        setUser(undefined)
    }

    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">

                        <div className="nav-icon">
                            <FontAwesomeIcon alt="Dashboard" icon={faWindowRestore} />
                        </div>

                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/users">

                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Users" icon={faUsers} />
                        </div>


                        <span>Users</span>
                    </Link>
                </li>
                <li>
                    <Link to="/police">

                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Police Roster" icon={faIdBadge} />
                        </div>


                        <span>Police Roster</span>
                    </Link>
                </li>
                <li>
                    <Link to="/medic">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Medic Roster" icon={faUserNurse} />
                        </div>

                        <span>Medic Roster</span>
                    </Link>
                </li>
                <li>
                    <Link to="/staff">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Staff Roster" icon={faUserTie} />
                        </div>

                        <span>Staff Roster</span>
                    </Link>
                </li>
                <li>
                    <Link to="/development-team">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Dev Roster" icon={faAccessibleIcon} />
                        </div>

                        <span>Development Roster</span>
                    </Link>
                </li>
                {
                    user.adminLevel > 1 ?
                        <li>
                            <Link to="/vehicles">
                                <div className="nav-icon">
                                    <FontAwesomeIcon className="nav-icon" alt="Vehicles" icon={faCar} />
                                </div>

                                <span>Vehicles</span>
                            </Link>
                        </li> : undefined
                }
                {
                    user.adminLevel > 0 ?
                        <li>
                            <Link to="/cases">
                                <div className="nav-icon">
                                    <FontAwesomeIcon className="nav-icon" alt="Support Cases" icon={faGavel} />
                                </div>

                                <span>Support Cases</span>
                            </Link>
                        </li> : undefined
                }
                {
                    user.adminLevel > 4 ?
                        <li>
                            <Link to="/battleye">
                                <div className="nav-icon">
                                    <FontAwesomeIcon className="nav-icon" alt="Battleye" icon={faEye} />
                                </div>

                                <span>Battleye</span>
                            </Link>
                        </li> : undefined
                }
                {
                    user.adminLevel >= 4 ?
                        <li>
                            <Link to="/logs">
                                <div className="nav-icon">
                                    <FontAwesomeIcon className="nav-icon" alt="Server Settings" icon={faClipboard} />
                                </div>

                                <span>Logs</span>
                            </Link>
                        </li> : undefined
                }


                <li>
                    <Link to="/settings">
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Settings" icon={faUserCog} />
                        </div>

                        <span>Settings</span>
                    </Link>

                </li>
                {
                    user.adminLevel >= 8 ?
                        <li>
                            <Link to="/server-settings">
                                <div className="nav-icon">
                                    <FontAwesomeIcon className="nav-icon" alt="Server Settings" icon={faSlidersH} />
                                </div>

                                <span>Server Settings</span>
                            </Link>
                        </li> : undefined
                }
                 
                <li>
                    <Link to="/login" onClick={() => signOut(setUser)}>
                        <div className="nav-icon">
                            <FontAwesomeIcon className="nav-icon" alt="Server Settings" icon={faSignOutAlt} />
                        </div>

                        <span>Logout</span>
                    </Link>

                </li>
            </ul>
        </nav>
    )
}

export default MainNav;