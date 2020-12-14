import { faSearch, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import ReactPaginate from "react-paginate";
import Title from "../components/title";
import { getTimeSince } from "../services/HelperService";

import { getBans, removeBan } from "../services/RconService";

const BansPage = () => {
    const [banList, setBanList] = React.useState([])
    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(0);

    useEffect(() => {
        const fetchBanList = async () => {
            const banList = await getBans();

            
            setBanList(banList)
            console.log(banList)
        }   
        fetchBanList() 
    }, [setBanList])

    const sendRemoveBan = async (id, reason) => {
        if(!reason) return
        setBanList(banList.filter(x => x.id !== id))

        removeBan(id, reason)
    }
    
    return (
        <>
            <Title title="Battleye"/>
            <h1>Active Players List</h1>

            <div className="filters">
               <div></div>

                <div className="search-box">
                    <input type="text" placeholder="Search" onChange={(e) => {}}/>
                    <button>
                        <FontAwesomeIcon icon={faSearch}/>
                    </button>
                </div>
            </div>
            
            <div className="table">
                <div className="table-head">
                    <div>ID</div>
                    <div>Staff Name</div>
                    <div>User</div>
                    <div>Reason</div>
                    <div>Remaining Time</div>
                    <div></div>
                </div>
                {
                    banList.length > 0 ?
                    banList.map(({id, name, user, reason, time_expire}, idx) => {
                        if(idx >= (page + 1) * pageLength || (idx < ((page + 1) * pageLength) - pageLength)) return undefined;
                        return (
                            <div key={idx} className="table-row">
                                <div>{id}</div>
                                <div>{name}</div>
                                <div>{user}</div>
                                <div>{reason}</div>
                                <div>{time_expire ? getTimeSince(new Date(time_expire), new Date()) : "Permanent"}</div>
                                <div>
                                    <FontAwesomeIcon className="delete-btn large" onClick={() => {sendRemoveBan(id, window.prompt("Reason for ban removal", "Because I can"))}} icon={faTrashAlt}/>
                                </div>
                            </div>
                        )
                    }) :
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
                        pageCount={Math.ceil(banList.length / pageLength)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={(e) => {setPage(e.selected)}}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    />
                </div>               
            </div>
        </>
    )
}

export default BansPage;