import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { getHousesByID, removeHouse } from '../services/housesService';

const Houses = ({pid}) => {
    const [houses, setHouses] = React.useState([]);
    useEffect(() => {
        const fetchHouses = async () => {
            const houses = await getHousesByID(pid);

            setHouses(houses.houses)
        }
        fetchHouses()
    }, [pid])
    
    const deleteHouse = (id) => {
        setHouses(houses.filter(x => x.id !== id))
        removeHouse(id)
    }
    
    return (
        <div className="table">
            <div className="table-head">
                <div>Position</div>
                <div>Insert Time</div>
                <div></div>
            </div>
            {
                houses.length > 0 ? 
                <>
                    {
                        houses.map(({id, pos, insert_time}, idx) => (
                            <div className="table-row">
                                <div>{pos}</div>
                                <div>{insert_time}</div>
                                <div><FontAwesomeIcon className="delete-btn" onClick={() => deleteHouse(id)} icon={faTrashAlt}/></div>
                            </div>
                                
                        ))
                    }
                </> : 
                <div className="table-row">
                    <div>No results found</div>
                </div>
            }
        </div>
    )
};

export default Houses;