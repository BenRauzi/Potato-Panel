import React, { useContext, useEffect } from 'react';
import { getUserVehicles } from '../services/UserService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { removeVehicle } from '../services/VehicleService';
import UserContext from '../services/UserContext';

const VehiclesList = ({pid, side}) => {

    const [vehicles, setVehicles] = React.useState([])

    const { user } = useContext(UserContext);

    useEffect(() => {
        const getVehicles = async () => {
            const res = await getUserVehicles(pid, side)
            setVehicles(res)
        }
        getVehicles()
    }, [setVehicles, pid, side])

    const deleteVehicle = (uid) => {
        removeVehicle(uid)

        setVehicles(vehicles.filter(x => x.id !== uid))
    }
    return (
        <>
            <div className="table">
                <div className="table-head padded-table-head">
                    <div>Classname</div>
                    <div>Type</div>
                    <div>Active</div>
                    <div></div>
                </div>
                {
                    vehicles.length === 0 ?
                    <div className="table-row">
                    <div>No Vehicles Found</div>
                    </div> :
                    <>
                        {
                            vehicles.map(({id, classname, type, active, insured}, idx) => (
                                <div key={idx} className="table-row">
                                    <div>{classname}</div>
                                    <div>{type}</div>
                                    <div>{active === 1 ? "True" : "False"}</div>
                                    { user.adminLevel > 2 || (side === "med" && user.emsWhitelisting > 7) || (side === "cop" && user.copWhitelisting > 7) ? <div><FontAwesomeIcon className="delete-btn" onClick={() => deleteVehicle(id)} icon={faTrashAlt}/></div>: <div></div>}
                                </div>
                            ))
                        }
                    </>
                }
            </div>
        </>
    )
}

export default VehiclesList;