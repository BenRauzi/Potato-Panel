import React, {useEffect} from 'react';
import { Link } from "react-router-dom"
import ReactPaginate from 'react-paginate';
import { debounce } from "lodash";

import { getDevs, searchDevs } from "../services/devService";
import Title from "../components/title";
import { getCopRank, getDevDept, getDevRank, getEmsRank } from '../services/HelperService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { developerRanks } from "../config/config";
const Development = () => {
    const [devs, setDevs] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    const [minRank, setMinRank] = React.useState(0);

    useEffect(() => {
        if(query !== "") return
        const fetchDevs = async () => {
            const devs = await getDevs(page, pageLength, minRank);

            setDevs(devs)
        }
        fetchDevs()
    }, [page, pageLength, query, minRank]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchDevs(query, page, pageLength, minRank);
            if(result === []) return setDevs({
                count: 0,
                result: []
            })
            
            setDevs(result)
        }
        search(query)
    }, [query, page, pageLength, minRank]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Development Roster"/>
            <h1>Development Team</h1>
            Search for Developers

          

            <div className="filters">
                <div className="filter">
                    Minimum Rank: 
                    <select value={minRank} onChange={(e) => setMinRank(parseInt(e.target.value))}>
                        {
                            Object.entries(developerRanks).slice(1).map((values, idx) => (
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
                    <div>Development Rank</div>
                    <div>Primary Department</div>
                    <div>Cop Rank</div>
                    <div>EMS Rank</div>
                   
                </div>
                {
                    devs.result.length > 0 ?
                    devs.result.map(({uid, name, pid, developerlevel, coplevel, mediclevel, developerdept}, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{name}</div>
                            <div>{getDevRank(developerlevel)}</div>
                            <div>{getDevDept(developerdept)}</div>
                            <div>{getCopRank(coplevel)}</div>
                            <div>{getEmsRank(mediclevel)}</div>
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
                        pageCount={Math.ceil(devs.count / pageLength)}
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

export default Development;
