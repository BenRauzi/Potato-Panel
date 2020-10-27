import React, { useEffect } from 'react';
import { getUserById } from '../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';

const UserPage = ({match}) => {
    const userId = match.params.id;

    const [user, setUser] = React.useState()
    useEffect(() => {
        const getUser = async () => {
            const user = await getUserById(userId);

            console.log(user)
            
            setUser(user)
        }
        getUser()
    }, [userId, setUser])  

    

    if(!user) return <></>
    return (
        <>  
            <div className="page-header">
                <div>
                    <h1>{user.name}</h1>
                    <p>Aliases: {user.aliases.replace(/([^a-z0-9_ ,]+)/gi, '')}</p>
                </div>
                <div className="steam-profile">
                    {userId}<br/>
                    {/* <a href={`https://steamcommunity.com/profiles/${userId}`}>Steam Profile</a> */}
                </div>
            </div>

           

            <div className="page-row">
                <div className="container">
                    <div className="container-head">
                        <div>User Info</div>
                        <div><FontAwesomeIcon icon={faEdit}/></div>
                    </div>
                </div>
                <div className="container">
                    <div className="container-head">
                        <div>User Info</div>
                        <div><FontAwesomeIcon icon={faEdit}/></div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default UserPage;