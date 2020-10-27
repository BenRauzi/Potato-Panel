import React, { useEffect } from 'react';
import TitleComponent from '../components/title';
import { getUserById, getUserSteam, saveMoney } from '../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faSave, faUniversity } from '@fortawesome/free-solid-svg-icons'

import { formatMoney } from '../services/HelperService';

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
        bank: false
    })

    const setCash = (amount) => {
        setUser({...user, cash: parseInt(amount)})
    }

    const setBank = (amount) => {
        setUser({...user, bankacc: parseInt(amount)})
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
                          <span><input type="text" value={user.bankacc} onChange={e => setBank(e.target.value)}></input></span>
                          <span><b>CASH AMOUNT</b></span>
                          <span><input type="text" value={user.cash} onChange={e => setCash(e.target.value)}></input></span>
                        </div>
                    }
                    
                    
                   <input type="checkbox" className="tile-check-box" value={editState.bank} onChange={async () => { 
                       if (!editState.bank) return setEditState({...editState, bank: !editState.bank})
                       
                       const res = await saveMoney(user.cash, user.bankacc, user.pid);

                       
                       setEditState({...editState, bank: !editState.bank})
                       
                    }}></input>
                    <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                    <FontAwesomeIcon className="icon-edit" icon={faSave}/>
              </div>
            </div>
        </>

    )
}

export default UserPage;