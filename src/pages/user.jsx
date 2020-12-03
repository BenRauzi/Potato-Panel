import React, { useEffect } from 'react';
import TitleComponent from '../components/title';
import { getUserById, getUserSteam, saveCop, saveEms, saveMoney, saveStaff } from '../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faIdBadge, faSave, faUniversity, faUserNurse, faUserTie } from '@fortawesome/free-solid-svg-icons'

import { formatMoney, getCopDept, getCopRank, getDevRank, getEmsDept, getEmsRank, getStaffRank } from '../services/HelperService';
import { copDepartments, copRanks, developerRanks, emsDepartments, emsRanks, staffRanks } from '../config/config';
import UserContext from '../services/UserContext';
import Licenses from '../components/licenses';
import VehiclesList from '../components/vehicles';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Houses from '../components/houses';
import Containers from '../components/containers';
import { MoreInfo } from '../components/moreInfo';


const UserPage = ({match}) => {
    const userId = match.params.id;

    const { user } = React.useContext(UserContext);

    const [currentUser, setUser] = React.useState()
    const [steamDetails, setSteamDetails] = React.useState({
        "profileName": "None",
        "profileUrl": "#",
        "avatarUrl": ""
    });
    useEffect(() => {
        const getUser = async () => {
            const currentUser = await getUserById(userId);
            
            setUser({...currentUser, pid: userId})
        }
        const getSteam = async () => {
            const currentUser = await getUserSteam(userId);
            
            setSteamDetails(currentUser)
        }
        getUser()
        getSteam()
    }, [userId, setUser, setSteamDetails])  

    const [editState, setEditState] = React.useState({
        bank: false,
        cop: false,
        ems: false,
        dev: false,

    })

    const setCash = (amount) => {
        if(amount > 100000000 || amount < 0) return
        setUser({...currentUser, cash: parseInt(amount)})
    }

    const setBank = (amount) => {
        if(amount > 100000000 || amount < 0) return
        setUser({...currentUser, bankacc: parseInt(amount)})
    }

    const setCopRank = (rank) => {
        setUser({...currentUser, copWhitelisting: parseInt(rank)})
    }

    const setCopDept = (dept) => {
        setUser({...currentUser, copdept: parseInt(dept)})
    }

    const setEmsRank = (rank) => {
        setUser({...currentUser, medicWhitelisting: parseInt(rank)})
    }

    const setEmsDept = (dept) => {
        setUser({...currentUser, medicdept: parseInt(dept)})
    }

    const setDevRank = (rank) => {
        setUser({...currentUser, developerlevel: parseInt(rank)})
    }

    const setStaffRank = (level) => {
        setUser({...currentUser, adminlevel: parseInt(level)})
    }
    
    if(!currentUser) return <></>
    return (
        <>  
            <TitleComponent title={currentUser.name}/>
            <div className="page-header">
                <div>
                    <h1>{currentUser.name}</h1>
                    Aliases: {currentUser.aliases.replace(/([^a-z0-9_ ,]+)/gi, '')}
                </div>
                <a target="_blank" rel="noopener noreferrer" href={steamDetails.profileUrl} className="steam-profile">
                        <img alt="User Profile" src={steamDetails.avatarUrl}></img>
                        <div className="steam-details">
                            <span>{steamDetails.profileName}</span>
                            <span className="userid">{userId}</span>
                    </div>
                   
                </a>
                    
            </div>



            <div className="page-row">
                {
                    currentUser.bankacc !== undefined ? 
                    
                    <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUniversity}/>
                    {
                        editState.bank === false ?  
                        <div className="tile-info">
                            <span><b>BANK ACCOUNT</b></span>
                            <span>{formatMoney(currentUser.bankacc)}</span>
                            <span><b>CASH AMOUNT</b></span>
                            <span>{formatMoney(currentUser.cash)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>BANK ACCOUNT</b></span>
                        <span><input type="number" value={currentUser.bankacc} onChange={e => setBank(e.target.value)}></input></span>
                        <span><b>CASH AMOUNT</b></span>
                        <span><input type="number" value={currentUser.cash} onChange={e => setCash(e.target.value)}></input></span>
                        </div>
                    }     
                    
                {
                    user.adminLevel > 3 ? 
                    <>
                            <input type="checkbox" className="tile-check-box" value={editState.bank} onChange={async () => { 
                            if (!editState.bank) return setEditState({...editState, bank: !editState.bank})

                            
                                await saveMoney(currentUser.cash, currentUser.bankacc, userId);

                                setEditState({...editState, bank: !editState.bank})
                            
                            }}></input>
                            <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                            <FontAwesomeIcon className="icon-edit" icon={faSave}/>
                    </> : <></>
                }
                
                </div> :<></>
                }
                

              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faIdBadge}/>
                    
                    {
                        editState.cop === false ?  
                        <div className="tile-info">
                            <span><b>POLICE RANK</b></span>
                            <span>{getCopRank(currentUser.copWhitelisting)}</span>
                            <span><b>POLICE DEPARTMENT</b></span>
                            <span>{getCopDept(currentUser.copdept)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>POLICE RANK</b></span>
                        <span>
                            <select value={currentUser.copWhitelisting} onChange={(e) => setCopRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(copRanks).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select></span>
                        <span><b>POLICE DEPARTMENT</b></span>
                        <span> 
                            <select value={currentUser.copdept} onChange={(e) => setCopDept(parseInt(e.target.value))}>
                                {
                                    Object.entries(copDepartments).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select>
                        </span>
                        </div>
                    }     
                    
                    {
                        user.copLevel > 0 || user.adminLevel > 1 ?
                        <>
                            <input type="checkbox" className="tile-check-box" value={editState.cop} onChange={async () => { 
                            if (!editState.cop) return setEditState({...editState, cop: !editState.cop})

                            
                            await saveCop(currentUser.copWhitelisting, currentUser.copdept, userId);

                            setEditState({...editState, cop: !editState.cop})
                            
                            }}></input>
                            <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                            <FontAwesomeIcon className="icon-edit" icon={faSave}/>
                        </> : <></>
                    }
                   
              </div>

              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUserNurse}/>
                    {
                        editState.ems === false ?  
                        <div className="tile-info">
                            <span><b>MEDIC RANK</b></span>
                            <span>{getEmsRank(currentUser.medicWhitelisting)}</span>
                            <span><b>MEDIC DEPARTMENT</b></span>
                            <span>{getEmsDept(currentUser.medicdept)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>MEDIC RANK</b></span>
                        <span>
                            <select value={currentUser.medicWhitelisting} onChange={(e) => setEmsRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(emsRanks).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select></span>
                        <span><b>MEDIC DEPARTMENT</b></span>
                        <span> 
                            <select value={currentUser.medicdept} onChange={(e) => setEmsDept(parseInt(e.target.value))}>
                                {
                                    Object.entries(emsDepartments).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select>
                        </span>
                        </div>
                    }     
                    
                    {
                        user.emsLevel > 0 || user.staffLevel > 1 ?
                        <>
                         <input type="checkbox" className="tile-check-box" value={editState.ems} onChange={async () => { 
                            if (!editState.ems) return setEditState({...editState, ems: !editState.ems})
     
                            await saveEms(currentUser.medicWhitelisting, currentUser.medicdept, userId);
     
                            setEditState({...editState, ems: !editState.ems})
                            
                         }}></input>
                         <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                         <FontAwesomeIcon className="icon-edit" icon={faSave}/>
                        </>
                         : <></>
                    }
                   
              </div>
              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUserTie}/>
                    {
                        editState.dev === false ?  
                        <div className="tile-info">
                            <span><b>STAFF RANK</b></span>
                            <span>{getStaffRank(currentUser.adminlevel || 0)}</span>
                            <span><b>DEVELOPER RANK</b></span>
                            <span>{getDevRank(currentUser.developerlevel)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>STAFF RANK</b></span>
                        <span>
                            <select value={currentUser.adminlevel || 0} onChange={(e) => setStaffRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(staffRanks).filter(values => {
                                        if((values[1] < user.adminLevel && user.adminLevel > 4) || user.adminLevel > 6) return true
                                        return false
                                    }).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select></span>
                        <span><b>DEVELOPER RANK</b></span>
                        <span> 
                            <select value={currentUser.developerlevel} onChange={(e) => setDevRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(developerRanks ).filter((values) => {
                                        if(values[1] <= user.developerlevel || user.adminLevel > 4) return true
                                        return false
                                    }).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select>
                        </span>
                        </div>
                    }     
                    {
                        user.adminLevel > 4 && userId !== user.pid && (currentUser.adminlevel || 0) <= user.adminLevel ?
                        <>
                            <input type="checkbox" className="tile-check-box" value={editState.dev} onChange={async () => { 
                                if (!editState.dev) return setEditState({...editState, dev: !editState.dev})
        
                                setEditState({...editState, dev: !editState.dev})
                                await saveStaff(currentUser.adminlevel || 0, currentUser.developerlevel || 0, currentUser.name, userId);
                                
                                
                                
                                
                            }}></input>
                            <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                            <FontAwesomeIcon className="icon-edit" icon={faSave}/>
                        </>
                        :
                         <></>
                    }
                   
              </div>

            
            </div>

            <div className="page-row">
                <div className="user-info-tab">
                    <Tabs>
                        <TabList>
                            <Tab>Licenses</Tab>
                            <Tab>Houses</Tab>
                            <Tab>Containers</Tab>
                            <Tab>More Info</Tab>
                            <Tab>Support Cases</Tab>
                        </TabList>

                        <TabPanel>
                            <Licenses pid={userId}/>
                        </TabPanel>
                        <TabPanel>
                            <Houses pid={userId}/>
                        </TabPanel>
                        <TabPanel>
                            <Containers pid={userId}/>
                        </TabPanel>
                        <TabPanel>
                            <MoreInfo currentUserInfo={{currentUser: currentUser, setUser: setUser}}/>
                        </TabPanel>
                        <TabPanel>
                            <h2>Support Cases</h2>
                        </TabPanel>
                    </Tabs>
                </div>
                <div className="user-info-tab">
                    <Tabs>
                        <TabList>
                            
                            <Tab>Civilian Vehicles</Tab>
                            <Tab>Police Vehicles</Tab>
                            <Tab>Medic Vehicles</Tab>
                        </TabList>

                        <TabPanel>
                            <VehiclesList pid={userId} side="civ"/>
                        </TabPanel>
                        
                        <TabPanel>
                            <VehiclesList pid={userId} side="cop"/>
                        </TabPanel>
                        <TabPanel>
                            <VehiclesList pid={userId} side="med"/>
                        </TabPanel>
                    </Tabs>
                    
                </div>
            </div>
        </>

    )
}

export default UserPage;