import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getUsers } from "../services/UserService";

import { formatMoney } from "../services/HelperService";

import ReactPaginate from 'react-paginate';

const Users = () => {

    const [users, setUsers] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getUsers(page, pageLength);

            setUsers(users)
        }
       
        fetchUsers()
    }, [setUsers, page, pageLength])
    
    return (
        <>
            <h1>Users</h1>
            Search for Users

            <div className="page-count">
                Page Length: 
                <select value={pageLength} onChange={(e) => setPageLength(parseInt(e.target.value))}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                </select>
            </div>

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
                    users.result.map(({uid, name, pid, exp_level, coplevel, mediclevel, cash, bankacc, }, idx) => (
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
                

                <ReactPaginate
                    previousLabel={'Previous'}
                    nextLabel={'Next'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={Math.ceil(users.count / pageLength)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={(e) => {setPage(e.selected + 1)}}
                    containerClassName={'pagination'}
                    subContainerClassName={'pages pagination'}
                    activeClassName={'active'}
                />
            </div>
        </>
    )
}

export default Users;