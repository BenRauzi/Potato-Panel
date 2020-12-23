import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce } from "lodash";
import React, { useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import Title from "../components/title";
import { logTypes } from "../config/config";
import { getLogType } from "../services/HelperService";
import { getLogs, searchLogs } from "../services/LogService";

const LogPage = () => {
    const [page, setPage] = React.useState(1);
    const [pageLength, setPageLength] = React.useState(10);

    const [query, setQuery] = React.useState("");
    const [logType, setLogType] = React.useState(0);

    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    const [logs, setLogs] = React.useState({
        count: 0,
        result: []
    })

    useEffect(() => {
        if(query !== "") return
        const fetchLogs = async () => {
            const result = await getLogs(page, pageLength, logType);
            setLogs(result)
        }
        fetchLogs()
    }, [page, pageLength, logType, query])

    useEffect(() => {
        if(query === "") return 

        const fetchLogs = async () => {
            const result = await searchLogs(page, pageLength, logType, query);
            setLogs(result)
        }
        fetchLogs()
    }, [page, pageLength, logType, query])

    useEffect(() => {
        if(query === "") return 
        setPage(1)
    }, [query, setPage])

    return (
        <>
            <Title title="Administration Logs"/>
            <h1>Admin Logs</h1>
            Admin Panel & Authentication Logs
            
            <div className="filters">
                <div className="filter">
                   Log Type: 
                    <select value={logType} onChange={(e) => setLogType(parseInt(e.target.value))}>
                        {
                            Object.entries(logTypes).map((values, idx) => (
                                <option key={idx} value={values[1]}>{values[0]}</option>
                            ))
                        }
                    </select>
                </div>
                    
                <div className="search-box">
                    <input type="text" placeholder="Search"  onChange={(e) => debouncedSearch(e.target.value)}/>
                    <button>
                        <FontAwesomeIcon icon={faSearch}/>
                    </button>
                </div>
            </div>

            <div className="table">
                <div className="table-head">
                    <div>Staff Member</div>
                    <div>Member Affected</div>
                    <div>Type</div>
                    <div>Description</div>
                   
                </div>
                {
                    logs.count > 0 ?
                    logs.result.map(({staff_member, staff_member_name, member_name, type, log}, idx) => (
                        <Link to={`/user/${staff_member}`} key={idx} className="table-row">
                            <div>{staff_member_name}</div>
                            <div>{member_name ? member_name : "None"}</div>
                            <div>{getLogType(type)}</div>
                            <div>{log}</div>
                        </Link>
                    )) :
                    <div className="table-row">
                        <div>No results found</div>
                    </div>
                }
                <div className="filters">
                    <div className="page-count spaced">
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
                        pageCount={Math.ceil(logs.count / pageLength)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        forcePage={page - 1}
                        onPageChange={(e) => {console.log(e.selected); setPage(e.selected + 1)}}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    />
                </div>
               
            </div>
        </>
    )
}

export default LogPage;