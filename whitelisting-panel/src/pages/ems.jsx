import React, {useEffect} from 'react';
import { Link } from "react-router-dom"
import ReactPaginate from 'react-paginate';
import { debounce } from "lodash";

import { getEms, searchEms } from "../services/emsService";
import { getEmsRank, getEmsDept } from '../services/HelperService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import Title from "../components/title";

import { emsRanks } from "../config/config";

const Ems = () => {
    const [ems, setEms] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    
    const [minRank, setMinRank] = React.useState(0);

    useEffect(() => {
        if(query !== "") return
        const fetchEms = async () => {
            const police = await getEms(page, pageLength, minRank);

            setEms(police)
        }
        fetchEms()
    }, [page, pageLength, query, minRank]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchEms(query, page, pageLength, minRank);
            if(result === []) return setEms({
                count: 0,
                result: []
            })
            
            setEms(result)
        }
        search(query)
    }, [query, page, pageLength, minRank]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Medic Roster"/>
            <h1>Medic</h1>
            Search for Medics

            

            <div className="filters">
                <div className="filter">
                    Minimum Rank: 
                    <select value={minRank} onChange={(e) => setMinRank(parseInt(e.target.value))}>
                        {
                            Object.entries(emsRanks).slice(1).map((values, idx) => (
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
                    <div>Medic Rank</div>
                    <div>Department</div>
                </div>
                {
                    ems.result.length > 0 ?
                    ems.result.map(({uid, name, pid, mediclevel, medicdept}, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{uid}</div>
                            <div>{name}</div>
                            <div>{getEmsRank(mediclevel)}</div>
                            <div>{getEmsDept(medicdept) || "No Department"}</div>
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
                        pageCount={Math.ceil(ems.count / pageLength)}
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

export default Ems;
