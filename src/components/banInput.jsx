import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react"
import { banPlayerGuid, banPlayerIP } from "../services/RconService";

const BanInputBox = ({controls}) => {
    const { banUser, setBanUser, players, setPlayers } = controls

    const [ reason, setReason ] = React.useState();

    const [ banLength, setBanLength ] = React.useState("");

    const [ banType, setBanType ] = React.useState(0);

    const [ submitDisabled, setSubmitDisabled ] = React.useState(false)

    useEffect(() => {
        if(!banUser) return

        const escFunction = (event) => {
            if(event.keyCode === 27) { 
            }
        }

        document.addEventListener("keydown", escFunction, false);

        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [banUser, setBanUser]);

    if(!banUser) return null

    const { name, guid, ip } = banUser

    const setBanTime = (length) => {
        if(length < 0) return
        setBanLength(parseFloat(length))
    }

    const calcBanLength = (hours) => {
        return parseInt(hours * 60)
    }

    const banPlayer = async (e) => {
        e.preventDefault();
        setSubmitDisabled(true)

        if(banType === 0) {
            await banPlayerGuid(guid, reason, calcBanLength(banLength))
        } else {
            await banPlayerIP(ip, reason, calcBanLength(banLength))
        }

        setPlayers(players.filter(x => x.guid !== guid))

        setBanUser(undefined)
        setSubmitDisabled(false)
    }
    
   
    

    return (
        <div className="ban-overlay">
            <form onSubmit={banPlayer} className="ban-input">
                <div className="ban-header">
                    <div className="header-inner">
                        <div>
                            Ban Player
                        </div>
                        <button onClick={e => {
                                e.preventDefault();
                                setBanUser(undefined)
                            }}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </button>
                        
                    </div>
                </div>
                <input value={name} placeholder="Name" readOnly={true}/>
                <input value={guid} placeholder="guid" readOnly={true}/>

                <input type="number" value={banLength} onChange={(e) => setBanTime(e.target.value)} placeholder="Ban Length (Hours) - 0 = Perm"/>
                
                <select value={banType} onChange={(e) => setBanType(parseInt(e.target.value))}>
                    <option value="0">Steam Ban</option>
                    <option value="1">IP Ban</option>
                </select>

                <textarea value={reason} placeholder="Ban Reason" onChange={e => setReason(e.target.value)}/>

                <button disabled={submitDisabled}>Ban User</button>
            </form> 
        </div>
         
    )
}

export default BanInputBox