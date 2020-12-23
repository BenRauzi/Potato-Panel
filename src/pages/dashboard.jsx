import React, { useContext } from 'react';
import TitleComponent from '../components/title';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faServer, faUsers, faIdBadge, faUserNurse, faCar, faUniversity, faHome, faTruckLoading, faGavel } from '@fortawesome/free-solid-svg-icons'
import { formatNumber, formatMoney } from '../services/HelperService';
import UserContext from '../services/UserContext';

const Dashboard = () => {

    const { user } = useContext(UserContext);

    const [mainServerName, mainSetServerName] = React.useState("Main");
    const [mainServerOnline, mainSetServerOnline] = React.useState(false);
    const [mainServerPlayerCount, mainSetServerPlayerCount] = React.useState(0);

    const [devServerName, devSetServerName] = React.useState("Dev.");
    const [devServerOnline, devSetServerOnline] = React.useState(true);
    const [devServerPlayerCount, devSetServerPlayerCount] = React.useState(5);

    return (
        <>
            <TitleComponent title="Panel Dashboard" />
            <div className="page-header">
                <div>
                    <h1>Panel Dashboard</h1>
                    <p>Statistics update every 30 minutes</p>
                </div>

                <div className="page-header">
                    <div className="serverTile">
                        <FontAwesomeIcon className="serverTile-icon" icon={faServer} />
                        <div>
                            ArmA 3 Server Status ({mainServerName})
                            <br />
                            <span>
                                {mainServerOnline ? <span style={{ color: "#246326" }}>Online</span> : <span className="serverStatus" style={{ color: "#b51a1a" }}>Offline</span>} ({mainServerPlayerCount} Players)
                            </span>
                        </div>
                    </div>

                    {
                        devServerOnline && user.adminLevel >= 6 ?
                            <div className="serverTile">
                                <FontAwesomeIcon className="serverTile-icon" icon={faServer} />
                                <div>
                                    ArmA 3 Server Status ({devServerName})
                                <br />
                                    <span>
                                        <span style={{ color: "#246326" }}>Online</span> ({devServerPlayerCount} Players)
                                </span>
                                </div>
                            </div>
                            : undefined
                    }

                </div>
            </div>

            <div className="page-row">
                {/* Total Players */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUsers} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(619)}</span>
                        <span><b>TOTAL PLAYERS</b></span>
                    </div>
                </div>
                {/* Total Cops */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faIdBadge} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(143)}</span>
                        <span><b>SWORN DEPUTIES</b></span>
                    </div>
                </div>
                {/* Total Medics */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUserNurse} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(53)}</span>
                        <span><b>REGISTERED MEDICS</b></span>
                    </div>
                </div>
                {/* Total Vehicles */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faCar} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(284)}</span>
                        <span><b>OWNED VEHICLES</b></span>
                    </div>
                </div>
            </div>

            <div className="page-row">
                {/* Total Economy */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUniversity} />
                    <div className="tile-info">
                        <span className="tile-value">{formatMoney(123456)}</span>
                        <span><b>SERVER ECONOMY</b></span>
                    </div>
                </div>
                {/* Total Cops */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faHome} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(27)}</span>
                        <span><b>OCCUPIED PROPERTIES</b></span>
                    </div>
                </div>
                {/* Total Medics */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faTruckLoading} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(17)}</span>
                        <span><b>OWNED CONTAINERS</b></span>
                    </div>
                </div>
                {/* Total Vehicles */}
                <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faGavel} />
                    <div className="tile-info">
                        <span className="tile-value">{formatNumber(176)}</span>
                        <span><b>SUPPORT CASES</b></span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;