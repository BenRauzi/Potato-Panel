import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getUsers } from "../services/UserService";

import { formatMoney } from "../services/HelperService";
const Users = () => {

    const [users, setUsers] = React.useState([])

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getUsers(1, 10);

            setUsers(users)
        }
       
        fetchUsers()
    }, [setUsers])
    
    return (
        <>
            <h1>Users</h1>
            Search for Users

            <div className="table">
                <div className="table-head">
                    <div>UID</div>
                    <div>Name</div>
                    <div>XP Level</div>
                    <div>Cop Level</div>
                    <div>Medic Level</div>
                    <div>Cash</div>
                    <div>Bank Account</div>
                </div>
                {
                    users.map(({uid, name, pid, exp_level, coplevel, mediclevel, cash, bankacc, }, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{name}</div>
                            <div>{exp_level}</div>
                            <div>{coplevel}</div>
                            <div>{mediclevel}</div>
                            <div>{formatMoney(cash)}</div>
                            <div>{formatMoney(bankacc)}</div>
                        </Link>
                    ))
                }
            </div>
        </>
    )
}

export default Users;