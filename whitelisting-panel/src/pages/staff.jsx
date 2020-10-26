import React, {useEffect} from 'react';
import { Link } from "react-router-dom"
import ReactPaginate from 'react-paginate';
import { debounce } from "lodash";

import { getStaff, searchStaff } from "../services/StaffService";
import Title from "../components/title";

const Staff = () => {
    const [staff, setStaff] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    
    useEffect(() => {
        if(query !== "") return
        const fetchStaff = async () => {
            const staff = await getStaff(page, pageLength);

            setStaff(staff)
        }
        fetchStaff()
    }, [page, pageLength, query]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchStaff(query, page, pageLength);
            if(result === []) return setStaff({
                count: 0,
                result: []
            })
            
            setStaff(result)
        }
        search(query)
    }, [query, page, pageLength]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 1000); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Staff Roster"/>
            <h1>Staff</h1>
            Search for Staff

            <div className="page-count">
                Page Length: 
                <select value={pageLength} onChange={(e) => setPageLength(parseInt(e.target.value))}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                </select>
            </div>

            <div className="search-input">
                <input type="text" placeholder="Search by Name" onChange={(e) => debouncedSearch(e.target.value)}/>
            </div>

            <div className="table">
                <div className="table-head">
                    <div>UID</div>
                    <div>Name</div>
                    <div>Cop Level</div>
                    <div>Medic Level</div>
                    <div>Admin Level</div>
                </div>
                {
                    staff.result.length > 0 ?
                    staff.result.map(({uid, username, pid, copLevel, emsLevel, adminLevel}, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{username}</div>
                            <div>{copLevel}</div>
                            <div>{emsLevel}</div>
                            <div>{adminLevel}</div>
                        </Link>
                    )) :
                    <div className="table-row">
                        <div>No results found</div>
                    </div>
                }

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
        </>
    )
}

export default Staff;
