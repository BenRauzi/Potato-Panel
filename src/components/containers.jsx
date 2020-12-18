import React, { useContext, useEffect } from 'react';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getContainersByID, removeContainer } from '../services/housesService';
import UserContext from '../services/UserContext';

export const Containers = ({pid}) => {
    const [containers, setContainers] = React.useState([]);

    const { user } = useContext(UserContext);
    useEffect(() => {
        const fetchContainers = async () => {
            const result = await getContainersByID(pid)

            setContainers(result.containers)
        }
        fetchContainers()
    }, [pid, setContainers])

    const deleteContainer = (id) => {
        setContainers(containers.filter(x => x.id !== id))

        removeContainer(id)
    }

    return (
        <div className="table">
            <div className="table-head padded-table-head">
                <div>ID</div>
                <div>Classname</div>
                <div></div>
            </div>
            {
                containers.length > 0 ?
                <>
                    {
                        containers.map(({id, classname}, idx) => (
                            <div className="table-row">
                                <div>{id}</div>
                                <div>{classname}</div>
                                { user.adminLevel > 3 ? <div><FontAwesomeIcon className="delete-btn" onClick={() => deleteContainer(id)} icon={faTrashAlt}/></div> : <div></div> }
                            </div>
                        ))
                    }
                </> : 
                <div className="table-row">
                    <div>No Containers Found</div>
                </div>
            }
        </div>
    )
}

export default Containers;