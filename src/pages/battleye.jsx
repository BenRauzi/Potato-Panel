import { faBan, faEnvelope, faSearch, faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import BanInputBox from "../components/banInput";
import Title from "../components/title";
import { getPlayers, kickPlayer, messagePlayer } from "../services/RconService";

import UserContext from "../services/UserContext";

const BattleyePage = () => {
    const [players, setPlayers] = React.useState([]);
    const [filteredPlayers, setFiilteredPlayers] = React.useState([]);
    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(0);

    const [ searchTerm, setSearchTerm ] = React.useState("");

    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchPlayers = async () => {
            const players = await getPlayers();

            
            setPlayers(players)
        }   
        fetchPlayers() 
    }, [setPlayers])


    useEffect(() => {
        if(players.length === 0) return

        setFiilteredPlayers(players.filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase())))
    }, [players, searchTerm, setFiilteredPlayers])

    useEffect(() => {
        setPage(0)
    }, [filteredPlayers, setPage])

    const [banUser, setBanUser] = React.useState();

    const sendKickPlayer = (id, reason) => {
        if(!reason) return
        kickPlayer(id, reason)
        setPlayers(players.filter(x => x.id !== id))
    }

    // const showIP = (rank) => rank >= 5 ? true : false;

    return (
        <>
            <Title title="Battleye"/>
            <h1>Active Players List</h1>

            <div className="filters">
               <div></div>

                <div className="filters">
                    <div onClick={() => messagePlayer(-1, window.prompt("Enter Global Message:", "Hello"))} className="table-heading-button">
                        <FontAwesomeIcon icon={faEnvelope}/>
                        <span>Message</span>
                    </div>
                    <Link to="/bans" className="table-heading-button">
                        <FontAwesomeIcon icon={faBan}/>
                        <span>Bans</span>
                    </Link>
                    <div className="search-box">
                    <input type="text" placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)}/>
                    <button>
                        <FontAwesomeIcon icon={faSearch}/>
                    </button>
                </div>
                </div>
                
                
            </div>
            
            <div className="table">
                <div className="table-head">
                    <div>ID</div>
                    <div>Name</div>
                    { false ? <div>IP</div> : undefined }
                    <div>Ping</div>
                    <div></div>
                </div>
                {
                    filteredPlayers.length > 0 ?
                    filteredPlayers.map(({id, name, ip, ping, guid}, idx) => {
                        if(idx >= (page + 1) * pageLength || (idx < ((page + 1) * pageLength) - pageLength)) return undefined;
                        return (
                            <div key={idx} className="table-row">
                                <div>{id}</div>
                                <div>{name}</div>
                                { ip ? <div>{ip}</div> : undefined }
                                <div>{ping}</div>
                                <div>
                                    { user.adminLevel > 1 ? <FontAwesomeIcon className="delete-btn large" onClick={() => {messagePlayer(guid, window.prompt("Enter Message:", "Hello"))}} icon={faEnvelope}/> : undefined}
                                    { user.adminLevel > 2 ? <FontAwesomeIcon className="delete-btn large" onClick={() => {sendKickPlayer(guid,  window.prompt("Kick Reason:", "Admin Kick"))}} icon={faUserMinus}/> : undefined}
                                    { user.adminLevel > 3 ? <FontAwesomeIcon className="delete-btn large" onClick={() => {setBanUser({name, guid, ip})}} icon={faBan}/> : undefined}
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
                        pageCount={Math.ceil(filteredPlayers.length / pageLength)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        forcePage={page}
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