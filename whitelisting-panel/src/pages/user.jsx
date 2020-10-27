import React, { useEffect } from 'react';
import { getUserById, getUserSteam } from '../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

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

    if(!user) return <></>
    return (
        <>  
            <div className="page-header">
                <div>
                    <h1>{user.name}</h1>
                    Aliases: {user.aliases.replace(/([^a-z0-9_ ,]+)/gi, '')}
                </div>
                <a href={steamDetails.profileUrl} className="steam-profile">
                        <img alt="User Profile" src={steamDetails.avatarUrl}></img>
                        <div className="steam-details">
                            <span>{steamDetails.profileName}</span>
                            <span className="userid">{userId}</span>
                    </div>
                   
                </a>
                    
            </div>

           

            <div className="page-row">
              
            </div>
        </>

    )
}

export default UserPage;