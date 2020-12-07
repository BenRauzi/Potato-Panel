import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getCasePosition, getCaseType } from "../services/HelperService";
import { getUserCases } from "../services/UserService";

const SupportCases = ({pid}) => {
    const [ cases, setCases ] = React.useState([])

    useEffect(() => {
        const getCases = async() => {
            const cases = await getUserCases(pid)
            setCases(cases)
        }
        getCases()
    }, [pid, setCases])
    return (
        <>
             <div className="table">
                <div className="table-head padded-table-head">
                    <div>id</div>
                    <div>Staff Member</div>
                    <div>Case type</div>
                    <div>Position</div>
                    <div>Time Since</div>
                </div>
                {
                    cases.length > 0 ?
                    <>
                        {
                            cases.map(({id, uid, staffMemberName, caseType, timeSince, reporter }, idx) => (
                                <Link to={`/case/${uid}`} key={idx} className="table-row">
                                    <div>{id}</div>
                                    <div>{staffMemberName}</div>
                                    <div>{getCaseType(caseType)}</div>
                                    <div>{getCasePosition(reporter)}</div>
                                    <div>{timeSince}</div>
                                </Link>
                            ))
                        }
                    </> : 
                    <div className="table-row">
                        <div>No Cases Found</div>
                    </div>
                }
            </div>
        </>
    )
}

export default SupportCases;