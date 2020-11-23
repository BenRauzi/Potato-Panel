import React, {useEffect} from 'react';
import { Link } from "react-router-dom"
import ReactPaginate from 'react-paginate';
import { debounce } from "lodash";

import Title from "../components/title";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { GameSides, VehicleTypes } from "../config/config";
import { getVehicles, searchVehicles } from '../services/VehicleService';

const Vehicles = () => {
    const [vehicles, setVehicles] = React.useState({
        count: 0,
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [query, setQuery] = React.useState("");
    
    const [side, setSide] = React.useState(0);
    const [type, setType] = React.useState(0);
    
    useEffect(() => {
        if(query !== "") return
        const fetchVehicles = async () => {
            const vehicles = await getVehicles(page, pageLength, GameSides[side], VehicleTypes[type]);

            setVehicles(vehicles)
        }
        fetchVehicles()
    }, [page, pageLength, query, side, type]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(!query) return
        const search = async (query) => {
            setPage(1)
            const result = await searchVehicles(query, page, pageLength, GameSides[side], VehicleTypes[type]);
            if(result === []) return setVehicles({
                count: 0,
                result: []
            })
            
            setVehicles(result)
        }
        search(query)
    }, [query, page, pageLength, side, type]) //Will Run the code inside any time 'query' changes
    
    const debouncedSearch = debounce((searchTerm) => {
        setQuery(searchTerm);
    }, 500); //Only search after 1s of no typing in search box

    return (
        <>
            <Title title="Staff Roster"/>
            <h1>Vehicles</h1>
            Search for Vehicles

            <div className="filters">
                <div>
                    <div className="filter">
                        Side: 
                        <select value={side} onChange={(e) => setSide(parseInt(e.target.value))}>
                            {
                                Object.entries(GameSides).map((value, idx) => (
                                    <option key={idx} value={value[0]}>{value[1]}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="filter">
                        Type: 
                        <select value={type} onChange={(e) => setType(parseInt(e.target.value))}>
                            {
                                Object.entries(VehicleTypes).map((value, idx) => (
                                    
                                    <option key={idx} value={value[0]}>{value[1]}</option>
                                ))
                            }
                        </select>
                    </div>
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
                    <div>Owner</div>
                    <div>Classname</div>
                    <div>Side</div>
                    <div>Type</div>
                    <div>Active</div>
                </div>
                {
                    vehicles.result.length > 0 ?
                    vehicles.result.map(({id, name, pid, classname, side, type, active}, idx) => (
                        <Link to={`/user/${pid}`} key={idx} className="table-row">
                            <div>{id}</div>
                            <div>{name}</div>
                            <div>{classname}</div>
                            <div>{side}</div>
                            <div>{type}</div>
                            <div>{active ? "True" : "False"}</div>
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
                        pageCount={Math.ceil(vehicles.count / pageLength)}
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

export default Vehicles;
