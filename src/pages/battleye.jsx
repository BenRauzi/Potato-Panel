import { faBan, faEnvelope, faSearch, faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import ReactPaginate from "react-paginate";
import BanInputBox from "../components/banInput";
import Title from "../components/title";
import { getPlayers, kickPlayer, messagePlayer } from "../services/RconService";

const BattleyePage = () => {
    const [players, setPlayers] = React.useState([])
    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(0);

    useEffect(() => {
        const fetchPlayers = async () => {
            const players = await getPlayers();

            
            setPlayers(players)
        }   
        fetchPlayers() 
    }, [setPlayers])

    const [banUser, setBanUser] = React.useState();

    const sendKickPlayer = (id, reason) => {
        if(!reason) return
        kickPlayer(id, reason)
        setPlayers(players.filter(x => x.id !== id))
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
                    <div>Name</div>
                    <div>IP</div>
                    <div>Ping</div>
                    <div></div>
                </div>
                {
                    players.length > 0 ?
                    players.map(({id, name, ip, ping, guid}, idx) => {
                        if(idx >= (page + 1) * pageLength || (idx < ((page + 1) * pageLength) - pageLength)) return undefined;
                        return (
                            <div key={idx} className="table-row">
                                <div>{id}</div>
                                <div>{name}</div>
                                <div>{ip}</div>
                                <div>{ping}</div>
                                <div>
                                    <FontAwesomeIcon className="delete-btn large" onClick={() => {messagePlayer(id, window.prompt("Enter Message:", "Hello"))}} icon={faEnvelope}/>
                                    <FontAwesomeIcon className="delete-btn large" onClick={() => {sendKickPlayer(id,  window.prompt("Kick Reason:", "Admin Kick"))}} icon={faUserMinus}/>
                                    <FontAwesomeIcon className="delete-btn large" onClick={() => {setBanUser({name, guid, ip})}} icon={faBan}/>
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
                        pageCount={Math.ceil(players.length / pageLength)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={(e) => {setPage(e.selected)}}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    />
                </div>

                <BanInputBox controls={{banUser, setBanUser, players, setPlayers}} />
               
            </div>
        </>
    )
}

export default BattleyePage;