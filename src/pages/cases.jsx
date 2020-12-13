import React from "react"
import { useEffect } from "react";
import Title from "../components/title"
import { getCases, getFilteredCases } from "../services/StaffService";

import { CaseTypes } from "../config/config"
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { getTimeSince } from "../services/HelperService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const CasesPage = () => {
    const [cases, setCases] = React.useState({
        count: 0,
        time: new Date(),
        result: []
    })

    const [pageLength, setPageLength] = React.useState(10);
    const [page, setPage] = React.useState(1);

    const [caseType, setCaseType] = React.useState(0);
    
    useEffect(() => {
        if(caseType !== 0) return

        const fetchCases = async () => {
            const staff = await getCases(page, pageLength);

            setCases(staff)
        }
        fetchCases()
    }, [page, pageLength, caseType]) // Any time the page, pageLength or query changes, this will run.

    useEffect(() => {
        if(caseType === 0) return

        const fetchFilteredCases = async () => {
            const staff = await getFilteredCases(page, pageLength, caseType);

            setCases(staff)
           
        }
        fetchFilteredCases()
    }, [page, pageLength, caseType]) // Any time the page, pageLength or query changes, this will run.
    return (
        <>
            <Title title="Support Cases"/>
            <h1>Cases</h1>
            ArmA Studios Support Cases
            

            <div className="filters">
                <div className="filter">
                    Case Type: 
                    <select value={caseType} onChange={(e) => setCaseType(parseInt(e.target.value))}>
                        {
                            Object.entries(CaseTypes).map((values, idx) => (
                                <option key={idx} value={values[1]}>{values[0]}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="add-button-box">
                    <Link to="/case/new">
                        New Case <FontAwesomeIcon icon={faPlus}/>
                    </Link>
                </div>
            </div>

            <div className="table">
                <div className="table-head">
                    <div>UID</div>
                    <div>Staff Member</div>
                    <div>Case Type</div>
                    <div>Time</div>                   
                </div>
                {
                    cases.result.length > 0 ?
                    cases.result.map(({id, uid, staffMemberName, caseType, time}, idx) => (
                        <Link to={`/case/${uid}`} key={idx} className="table-row">
                            <div>{id}</div>
                            <div>{staffMemberName}</div>
                            <div>{caseType}</div>
                            <div>{getTimeSince(new Date(time), new Date(cases.time))}</div>
                        </Link>
                    )) :
                    <div className="table-row">
                        <div>No results found</div>
                    </div>
                }

                <div className="filters spaced">
                    <div className="page-count">
                        Show: 
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
                        pageCount={Math.ceil(cases.count / pageLength)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={(e) => {setPage(e.selected + 1)}}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    />
                </div>
               
               
            </div>
        </>
    )
}

export default CasesPage;