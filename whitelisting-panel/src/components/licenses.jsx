import React, { useEffect } from 'react';
import { getLicenseName } from '../services/HelperService';
import { getLicenses, setLicense } from '../services/UserService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { LicenseList } from '../config/config';


const Licenses = ({pid}) => {
    const [licenses, setLicenses] = React.useState()
    const [currentLicense, setCurrentLicense] = React.useState(undefined)
    const [unownedLicenses, setUnownedLicenses] = React.useState()

    useEffect(() => {
        const fetchLicenses = async () => {
            const res = await getLicenses(pid)

            setLicenses(res.filter(x => {
                if (x[1] === 1) return true
                return false
            }).map(x => x[0]))
            
        }
        fetchLicenses()
    }, [setLicenses, pid])

    const deleteLicense = (license) => {
        console.log(license)

        setLicense(pid, license, 0)
        console.log(pid)

        setLicenses(licenses.filter(item => item !== license))
    }

    const addLicense = (license) => {
        if(license === undefined) return
        if (license === 0) license = unownedLicenses[0][1]

        setLicense(pid, license, 1)
        
        setLicenses([...licenses, license])
    }

    useEffect(() => {
        if(licenses === undefined) return
        const unowned = Object.entries(LicenseList).filter(x => !licenses.includes(x[1]))

        setUnownedLicenses(unowned)

        if(unowned.length > 0) return setCurrentLicense(unowned[0][1])
        setCurrentLicense(undefined)
        
    }, [licenses])

    if(!licenses || !unownedLicenses) return <></>
    
    return (
        <>
          <div className="table">
            <div className="table-head">
                <div>Name</div>
                <div>Id</div>
                <div className="nowrap">
                    
                <select className="dropdown" value={currentLicense} onChange={(e) => setCurrentLicense(e.target.value)}>
                    {
                        unownedLicenses.map((values, idx) => (
                            <option key={idx} value={values[1]}>{getLicenseName(values[1])}</option>
                        ))
                    }
                </select>
                
                <button className="add-btn"><FontAwesomeIcon icon={faPlus} onClick={() => addLicense(currentLicense)}/></button>
                    
                </div>
            </div>
            {
                licenses.length === 0 ?
                <div className="table-row">
                    <div>No licenses found</div>
                </div> :
                <>
                    {
                        licenses.map((license, idx) => (
                            <div key={idx} className="table-row">
                                <div>{getLicenseName(license)}</div>
                                <div>{license}</div>
                                <div><FontAwesomeIcon onClick={() => deleteLicense(license)} className="delete-btn" icon={faTrashAlt}/></div>
                            </div>
                        ))
                    }
                </>
            }
          </div>
        </>
    )
}

export default Licenses;