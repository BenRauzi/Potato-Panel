import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getUsers, searchUsers } from "../services/UserService";

import { formatMoney, getCopRank, getEmsRank } from "../services/HelperService";

import ReactPaginate from 'react-paginate';

import { debounce } from "lodash";

import Title from "../components/title";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';


const Users = () => {

    const [users, setUsers] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    
    useEffect(() => {
        if(query !== "") return
        const fetchUsers = async () => {
            const users = await getUsers(page, pageLength);

            setUsers(users)
        }
        fetchUsers()
    }, [page, pageLength, query]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchUsers(query, page, pageLength);
            if(result === []) return setUsers({
                count: 0,
                result: []
            })
            
            setUsers(result)
        }
        search(query)
    }, [query, page, pageLength]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Users"/>
            <h1>Users</h1>
            Search for Users

            <div className="filters">
               <div></div>

                <div className="search-box">
                    <input type="text" placeholder="Search" onChange={(e) => debouncedSearch(e.target.value)}/>
                    <button>
                        <FontAwesomeIcon icon={faSearch}/>
                    </button>
                </div>
            </div>
           
            

            <div className="table">
                <div className="table-head">
                    <div>UID</div>
                    <div>Name</div>
                    <div>XP Level</div>
                    <div>Cop Rank</div>
                    <div>Medic Rank</div>
                    <div>Cash</div>
                    <div>Bank Account</div>
                </div>
                {
                    users.result.length > 0 ?
                    users.result.map(({uid, name, pid, exp_level, coplevel, mediclevel, cash, bankacc, }, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{name}</div>
                            <div>{exp_level}</div>
                            <div>{getCopRank(coplevel) || "None"}</div>
                            <div>{getEmsRank(mediclevel) || "None"}</div>
                            <div>{formatMoney(cash)}</div>
                            <div>{formatMoney(bankacc)}</div>
                        </Link>
                    )) :
                    <div className="table-row">
                        <div>No results found</div>
                    </div>
                }
                
                <div className="filters">
                    <div className="page-count">
                        Page Length: 
                        <select value={pageLength} onChange={(e) => setPageLength(parseInt(e.target.value))}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>
                    </div>
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
               
            </div>
        </>
    )
}

export default Users;