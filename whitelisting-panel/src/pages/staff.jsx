import React, {useEffect} from 'react';
import { Link } from "react-router-dom"
import ReactPaginate from 'react-paginate';
import { debounce } from "lodash";

import { getStaff, searchStaff } from "../services/StaffService";
import Title from "../components/title";
import { getStaffRank, getPerms, getStaffPerms } from '../services/HelperService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { staffRanks } from "../config/config";

const Staff = () => {
    const [staff, setStaff] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    
    const [minRank, setMinRank] = React.useState(0);
    
    useEffect(() => {
        if(query !== "") return
        const fetchStaff = async () => {
            const staff = await getStaff(page, pageLength, minRank);

            setStaff(staff)
        }
        fetchStaff()
    }, [page, pageLength, query, minRank]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchStaff(query, page, pageLength, minRank);
            if(result === []) return setStaff({
                count: 0,
                result: []
            })
            
            setStaff(result)
        }
        search(query)
    }, [query, page, pageLength, minRank]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Staff Roster"/>
            <h1>Staff</h1>
            Search for Staff

            

            <div className="filters">
                <div className="min-rank">
                    Minimum Rank: 
                    <select value={minRank} onChange={(e) => setMinRank(parseInt(e.target.value))}>
                        {
                            Object.entries(staffRanks).map((values, idx) => (
                                <option key={idx} value={values[1]}>{values[0]}</option>
                            ))
                        }
                    </select>
                </div>

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
                    <div>Staff Rank</div>
                    <div>Cop Whitelisting</div>
                    <div>EMS Whitelisting</div>
                    <div>Staff Whitelisting</div>
                   
                </div>
                {
                    staff.result.length > 0 ?
                    staff.result.map(({uid, username, pid, copLevel, emsLevel, adminLevel}, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{username}</div>
                            <div>{getStaffRank(adminLevel)}</div>
                            <div>{getPerms(copLevel, adminLevel) }</div>
                            <div>{getPerms(emsLevel, adminLevel)}</div>
                            <div>{getStaffPerms(adminLevel)}</div>
                        </Link>
                    )) :
                    <div className="table-row">
                        <div>No results found</div>
                    </div>
                }

                <div className="filters spaced">
                    <div className="page-count">
                        Show: 
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
                        pageCount={Math.ceil(staff.count / pageLength)}
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

export default Staff;
