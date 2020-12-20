import { faEdit, faGavel, faLevelUpAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { dojDepartments, dojRanks } from '../config/config';
import { updateDoj } from '../services/DojService';
import { getDojDept, getDojLevel } from '../services/HelperService';
import UserContext from '../services/UserContext';
import { updateExperience } from '../services/UserService';

export const MoreInfo = ({currentUserInfo}) => {
    const { user } = React.useContext(UserContext);

    const { currentUser, setUser } = currentUserInfo;

    const [editState, setEditState] = React.useState({
        xp: false,
        doj: false
    })

    const setExpLevel= (level) => {
        if(level > 1000000) return;
        setUser({...currentUser, exp_level: parseInt(level)})
    };

    const setPerkPoints = (points) => {
        if(points > 1000000) return;
        setUser({...currentUser, exp_perkPoints: parseInt(points)})
    };

    const setDojRank = (level) => {
        setUser({...currentUser, dojlevel: parseInt(level)})
    }

    const setDojDept = (level) => {
        setUser({...currentUser, dojdept: parseInt(level)})
    }

    if(!currentUser) return <></>
    return (
        <div className="page-row">
                <div className="user-tile tile-large">
                    <FontAwesomeIcon className="tile-icon" icon={faLevelUpAlt}/>
                    <div className="tile-info">
                        <span><b>XP Level</b></span>
                        <span>{editState.xp === false ? currentUser.exp_level : <input type="number" value={currentUser.exp_level} onChange={e => setExpLevel(e.target.value)}></input>}</span>
                        <span><b>PERK POINTS</b></span>
                        <span>{editState.xp === false ? currentUser.exp_perkPoints : <input type="number" value={currentUser.exp_perkPoints} onChange={e => setPerkPoints(e.target.value)}></input>}</span>
                    </div>
                        
                    {
                        user.adminLevel > 2 ? 
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
                <div className="user-tile tile-large">
                    <FontAwesomeIcon className="tile-icon" icon={faGavel}/>
                    <div className="tile-info">
                        <span><b>DOJ Rank</b></span>
                        <span>
                        {
                            editState.doj === false ? getDojLevel(currentUser.dojlevel) : 
                            <select value={currentUser.dojlevel} onChange={(e) => setDojRank(parseInt(e.target.value))}>
                                {
                                    Object.entries(dojRanks).map((values, idx) => {
                                        return (
                                            <option key={idx} value={values[1]}>{values[0]}</option>
                                        )
                                    })
                                }
                            </select>
                        }
                        </span>
                        <span><b>DOJ Department</b></span>
                        <span>
                        {
                            editState.doj === false ? getDojDept(currentUser.dojdept) : 
                            <select value={currentUser.dojdept} onChange={(e) => setDojDept(parseInt(e.target.value))}>
                            {
                                Object.entries(dojDepartments).map((values, idx) => {
                                    return (
                                        <option key={idx} value={values[1]}>{values[0]}</option>
                                    )
                                })
                            }
                        </select>
                        }
                        </span>
                    </div>
                        
                    {
                        user.adminLevel > 1 ? 
                        <>
                                <input type="checkbox" className="tile-check-box" value={editState.doj} onChange={async () => { 
                                if (!editState.doj) return setEditState({...editState, doj: !editState.doj})

                                    await updateDoj(currentUser.pid, currentUser.dojlevel, currentUser.dojdept);

                                    setEditState({...editState, doj: !editState.doj})
                                
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