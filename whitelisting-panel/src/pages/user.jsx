import React, { useEffect } from 'react';
import TitleComponent from '../components/title';
import { getUserById, getUserSteam, saveCop, saveDev, saveEms, saveMoney } from '../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faIdBadge, faSave, faUniversity, faUserNurse } from '@fortawesome/free-solid-svg-icons'

import { formatMoney, getCopDept, getCopRank, getDevDept, getDevRank, getEmsDept, getEmsRank } from '../services/HelperService';
import { copDepartments, copRanks, developerDepartments, developerRanks, emsDepartments, emsRanks } from '../config/config';

const UserPage = ({match}) => {
    const userId = match.params.id;

    const [user, setUser] = React.useState()
    const [steamDetails, setSteamDetails] = React.useState({
        "profileName": "None",
        "profileUrl": "#",
        "avatarUrl": ""
    });
    useEffect(() => {
        const getUser = async () => {
            const user = await getUserById(userId);

            console.log(user)
            
            setUser(user)
        }
        const getSteam = async () => {
            const user = await getUserSteam(userId);
            
            setSteamDetails(user)
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
        setUser({...user, cash: parseInt(amount)})
    }

    const setBank = (amount) => {
        if(amount > 100000000 || amount < 0) return
        setUser({...user, bankacc: parseInt(amount)})
    }

    const setCopRank = (rank) => {
        setUser({...user, copWhitelisting: parseInt(rank)})
    }

    const setCopDept = (dept) => {
        setUser({...user, copdept: parseInt(dept)})
    }

    const setEmsRank = (rank) => {
        setUser({...user, medicWhitelisting: parseInt(rank)})
    }

    const setEmsDept = (dept) => {
        setUser({...user, medicdept: parseInt(dept)})
    }

    const setDevRank = (rank) => {
        setUser({...user, developerlevel: parseInt(rank)})
    }

    const setDevDept = (dept) => {
        setUser({...user, developerdept: parseInt(dept)})
    }

    if(!user) return <></>
    return (
        <>  
            <TitleComponent title={user.name}/>
            <div className="page-header">
                <div>
                    <h1>{user.name}</h1>
                    Aliases: {user.aliases.replace(/([^a-z0-9_ ,]+)/gi, '')}
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
              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUniversity}/>
                    
                    {
                        editState.bank === false ?  
                        <div className="tile-info">
                            <span><b>BANK ACCOUNT</b></span>
                            <span>{formatMoney(user.bankacc)}</span>
                            <span><b>CASH AMOUNT</b></span>
                            <span>{formatMoney(user.cash)}</span>
                        </div> :
                        <div className="tile-edit">
                          <span><b>BANK ACCOUNT</b></span>
                          <span><input type="number" value={user.bankacc} onChange={e => setBank(e.target.value)}></input></span>
                          <span><b>CASH AMOUNT</b></span>
                          <span><input type="number" value={user.cash} onChange={e => setCash(e.target.value)}></input></span>
                        </div>
                    }     
                    
                   <input type="checkbox" className="tile-check-box" value={editState.bank} onChange={async () => { 
                       if (!editState.bank) return setEditState({...editState, bank: !editState.bank})

                       
                        await saveMoney(user.cash, user.bankacc, userId);

                        setEditState({...editState, bank: !editState.bank})
                       
                    }}></input>
                    <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                    <FontAwesomeIcon className="icon-edit" icon={faSave}/>
              </div>

              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faIdBadge}/>
                    
                    {
                        editState.cop === false ?  
                        <div className="tile-info">
                            <span><b>POLICE RANK</b></span>
                            <span>{getCopRank(user.copWhitelisting)}</span>
                            <span><b>POLICE DEPARTMENT</b></span>
                            <span>{getCopDept(user.copdept)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>POLICE RANK</b></span>
                        <span>
                            <select value={user.copWhitelisting} onChange={(e) => setCopRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(copRanks).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select></span>
                        <span><b>POLICE DEPARTMENT</b></span>
                        <span> 
                            <select value={user.copdept} onChange={(e) => setCopDept(parseInt(e.target.value))}>
                                {
                                    Object.entries(copDepartments).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select>
                        </span>
                        </div>
                    }     
                    
                   <input type="checkbox" className="tile-check-box" value={editState.cop} onChange={async () => { 
                       if (!editState.cop) return setEditState({...editState, cop: !editState.cop})

                       
                       await saveCop(user.copWhitelisting, user.copdept, userId);

                       setEditState({...editState, cop: !editState.cop})
                       
                    }}></input>
                    <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                    <FontAwesomeIcon className="icon-edit" icon={faSave}/>
              </div>

              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUserNurse}/>
                    {
                        editState.ems === false ?  
                        <div className="tile-info">
                            <span><b>MEDIC RANK</b></span>
                            <span>{getEmsRank(user.medicWhitelisting)}</span>
                            <span><b>MEDIC DEPARTMENT</b></span>
                            <span>{getEmsDept(user.medicdept)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>MEDIC RANK</b></span>
                        <span>
                            <select value={user.medicWhitelisting} onChange={(e) => setEmsRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(emsRanks).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select></span>
                        <span><b>MEDIC DEPARTMENT</b></span>
                        <span> 
                            <select value={user.medicdept} onChange={(e) => setEmsDept(parseInt(e.target.value))}>
                                {
                                    Object.entries(emsDepartments).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select>
                        </span>
                        </div>
                    }     
                    
                   <input type="checkbox" className="tile-check-box" value={editState.ems} onChange={async () => { 
                       if (!editState.ems) return setEditState({...editState, ems: !editState.ems})

                       await saveEms(user.medicWhitelisting, user.medicdept, userId);

                       setEditState({...editState, ems: !editState.ems})
                       
                    }}></input>
                    <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                    <FontAwesomeIcon className="icon-edit" icon={faSave}/>
              </div>

              <div className="user-tile">
                    <FontAwesomeIcon className="tile-icon" icon={faUserNurse}/>
                    {console.log(user)}
                    {
                        editState.ems === false ?  
                        <div className="tile-info">
                            <span><b>DEVELOPER RANK</b></span>
                            <span>{getDevRank(user.developerlevel)}</span>
                            <span><b>DEVELOPER DEPARTMENT</b></span>
                            <span>{getDevDept(user.developerdept)}</span>
                        </div> :
                        <div className="tile-edit">
                        <span><b>DEVELOPER RANK</b></span>
                        <span>
                            <select value={user.developerlevel} onChange={(e) => setDevRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(developerRanks).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select></span>
                        <span><b>DEVELOPER DEPARTMENT</b></span>
                        <span> 
                            <select value={user.developerdept} onChange={(e) => setDevDept(parseInt(e.target.value))}>
                                {
                                    Object.entries(developerDepartments).map((values, idx) => (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    ))
                                }
                            </select>
                        </span>
                        </div>
                    }     
                    
                   <input type="checkbox" className="tile-check-box" value={editState.dev} onChange={async () => { 
                       if (!editState.dev) return setEditState({...editState, dev: !editState.dev})

                       await saveDev(user.developerlevel, user.developerdept, userId);

                       setEditState({...editState, dev: !editState.dev})
                       
                    }}></input>
                    <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                    <FontAwesomeIcon className="icon-edit" icon={faSave}/>
              </div>

            
            </div>
        </>

    )
}

export default UserPage;