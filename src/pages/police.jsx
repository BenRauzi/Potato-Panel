import React, {useEffect} from 'react';
import ReactPaginate from 'react-paginate';
import Title from "../components/title";

import { debounce } from "lodash";
import { Link } from "react-router-dom"
import { getPolice, searchPolice } from "../services/PoliceService";
import { getCopRank, getCopDept } from '../services/HelperService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { copRanks } from "../config/config";

const Police = () => {
    const [police, setPolice] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    
    const [minRank, setMinRank] = React.useState(0);

    useEffect(() => {
        if(query !== "") return
        const fetchPolice = async () => {
            const police = await getPolice(page, pageLength, minRank);

            setPolice(police)
        }
        fetchPolice()
    }, [page, pageLength, query, minRank]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchPolice(query, page, pageLength, minRank);
            if(result === []) return setPolice({
                count: 0,
                result: []
            })
            
            setPolice(result)
        }
        search(query)
    }, [query, page, pageLength, minRank]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Police Roster"/>
            <h1>Police</h1>
            Search for Police

            <div className="filters">
               <div className="filter">
                   Minimum Rank: 
                    <select value={minRank} onChange={(e) => setMinRank(parseInt(e.target.value))}>
                        {
                            Object.entries(copRanks).slice(1).map((values, idx) => (
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
                    <div>Cop Rank</div>
                    <div>Department</div>
                </div>
                {
                    police.result.length > 0 ?
                    police.result.map(({uid, name, pid, coplevel, copdept}, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{name}</div>
                            <div>{getCopRank(coplevel)}</div>
                            <div>{getCopDept(copdept) || "No Department"}</div>
                        </Link>
                    )) :
                    <div className="table-row">
                        <div>No results found</div>
                    </div>
                }

                <div className="filters spaced">
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
                        pageCount={Math.ceil(police.count / pageLength)}
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

export default Police;
