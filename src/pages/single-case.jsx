import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "../components/title";
import { getCasePosition, getCaseType, getStaffRank, getTimeSince } from "../services/HelperService";
import { getCase } from "../services/StaffService";

import DOMPurify from 'dompurify';
import moment from "moment";

const SingleCasePage = ({match}) => {
    const caseId = match.params.id;

    const [currentCase, setCase] = React.useState();

    useEffect(() => {
        const fetchCase = async () => {
            const supportCase = await getCase(caseId);

            setCase(supportCase);
        }
        fetchCase();
    }, [caseId, setCase]);

    if(!currentCase) return <Title title={`Support Case - ${caseId}`}/>

    const caseTime = new Date(currentCase.time);
    const currentTime = new Date(currentCase.currentTime);

    const { staffHelperSteam, staffMemberSteam, staff_member, staff_rank, staff_name, staff_helper, staff_helper_name, staff_helper_rank, case_type, details, evidence_link, other } = currentCase
    return (
        <>
            <Title title={`Support Case - ${caseId}`}/>
            <h1>Support Case - #{currentCase.id}</h1>
            {moment(caseTime).format('DD/MM/YY')} - {getTimeSince(caseTime, currentTime)}

            <div className="case-info">

                <Link to={`/user/${staff_member}`} className="steam-profile-support profile-cases">
                    <img alt="Avatar" src={staffMemberSteam.avatarUrl}></img>
                    <div className="steam-details">
                        <span>{staff_name}</span>
                        <span className="userid">Staff Rank: {getStaffRank(staff_rank)}</span>
                        <span className="userid">PID: {staff_member}</span>
                    </div>
                </Link>

                {
                    staff_helper ? 
                    <Link to={`/user/${staff_helper}`} className="steam-profile-support profile-cases">
                        <img alt="Avatar" src={staffHelperSteam.avatarUrl}></img>
                        <div className="steam-details">
                            <span>{staff_helper_name}</span>
                            <span className="userid">Staff Rank: {getStaffRank(staff_helper_rank)}</span>
                            <span className="userid">PID: {staff_helper}</span>
                        </div>
                    </Link> : undefined
                }

                <p>Case Type: {getCaseType(case_type)}</p>
                <p>Details: {DOMPurify.sanitize(details)}</p>
                <p>Evidence Link: <a href={evidence_link}>Link</a></p>
                <p>Other Infromation: {DOMPurify.sanitize(other)}</p>
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