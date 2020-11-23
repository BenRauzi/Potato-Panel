import { faEdit, faLevelUpAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import UserContext from '../services/UserContext';
import { updateExperience } from '../services/UserService';

export const MoreInfo = ({currentUserInfo}) => {
    const { user } = React.useContext(UserContext);

    const { currentUser, setUser } = currentUserInfo;

    const [editState, setEditState] = React.useState({
        xp: false,
        perks: false
    })

    const setExpLevel= (level) => {
        if(level > 1000000) return;
        setUser({...currentUser, exp_level: parseInt(level)})
    };

    const setPerkPoints = (points) => {
        if(points > 1000000) return;
        setUser({...currentUser, exp_perkPoints: parseInt(points)})
    };

    

    if(!currentUser) return <></>
    console.log(currentUser)
    return (
        <div className="page-row">
                    <div className="user-tile tile-large">
                    <FontAwesomeIcon className="tile-icon" icon={faLevelUpAlt}/>
                    
                {
                    editState.xp === false ?  
                    <div className="tile-info">
                        <span><b>XP LEVEL</b></span>
                        <span>{(currentUser.exp_level)}</span>
                        <span><b>PERK POINTS</b></span>
                        <span>{(currentUser.exp_perkPoints)}</span>
                    </div> :
                    <div className="tile-edit">
                    <span><b>XP LEVEL</b></span>
                    <span><input type="number" value={currentUser.exp_level} onChange={e => setExpLevel(e.target.value)}></input></span>
                    <span><b>PERK POINTS</b></span>
                    <span><input type="number" value={currentUser.exp_perkPoints} onChange={e => setPerkPoints(e.target.value)}></input></span>
                    </div>
                }   
                    
                {
                    user.adminLevel > 3 ? 
                    <>
                            <input type="checkbox" className="tile-check-box" value={editState.xp} onChange={async () => { 
                            if (!editState.xp) return setEditState({...editState, xp: !editState.xp})

                            
                                await updateExperience(currentUser.pid, currentUser.exp_level, currentUser.exp_perkPoints);

                                setEditState({...editState, xp: !editState.xp})
                            
                            }}></input>
                            <FontAwesomeIcon className="icon-no-edit" icon={faEdit}/>
                            <FontAwesomeIcon className="icon-edit" icon={faSave}/>
                    </> : <></>
                }
                
                </div>
                
                
        </div>
    )
}

export default MoreInfo;