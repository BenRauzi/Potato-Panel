import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/title";
import { getCasePosition, getCaseType, getTimeSince } from "../services/HelperService";
import { getCase } from "../services/StaffService";

import DOMPurify from 'dompurify';
import moment from "moment";

const SingleCasePage = ({match}) => {
    const caseId = match.params.id;

    const [currentCase, setCase] = React.useState()

    useEffect(() => {
        const fetchCase = async () => {
            const supportCase = await getCase(caseId);

            setCase(supportCase)
        }
        fetchCase()
    }, [caseId, setCase])

    if(!currentCase) return <Title title={`Support Case - ${caseId}`}/>

    const caseTime = new Date(currentCase.time)
    const currentTime = new Date(currentCase.currentTime)
    return (
        <>
            <Title title={`Support Case - ${caseId}`}/>
            <h1>Support Case - #{currentCase.id}</h1>
            {moment(caseTime).format('DD/MM/YY')} - {getTimeSince(caseTime, currentTime)}

            <div className="case-info">
                <p>Staff Member: <Link to={`/user/${currentCase.staff_member}`}>{currentCase.staff_name}</Link></p>
                <p>Staff Helper: <Link to={`/user/${currentCase.staff_helper}`}>{currentCase.staff_helper_name}</Link></p>

                <p>Case Type: {getCaseType(currentCase.case_type)}</p>
                <p>Details: {currentCase.details}</p>
                <p>Evidence Link: <a href={currentCase.evidence_link}>Link</a></p>
                <p>Other Infromation: {DOMPurify.sanitize(currentCase.other)}</p>
            </div>

            <div className="table">
                <div className="table-head padded-table-head">
                    <div>Name</div>
                    <div>Position</div>
                    <div>Player ID</div>
                </div>
                {
                    currentCase.members.filter(x => x.pid).length === 0 ?
                    <div className="table-row">
                        <div>No Members Found</div>
                    </div> :
                    <>
                        {
                             currentCase.members.map(({pid, name, reporter}, idx) => (
                                <div key={idx} className="table-row">
                                    <div>{name}</div>
                                    <div>{getCasePosition(reporter)}</div>
                                    <div>{pid}</div>
                                </div>
                            ))
                        }
                    </>
                }
            </div>
        </>
    )
}

export default SingleCasePage;