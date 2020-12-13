import React, { useEffect, useContext } from "react"
import Title from "../components/title";

import DOMPurify from "dompurify";
import { CaseTypes } from "../config/config"
import { getUsers, getUserSteam, searchUsers } from "../services/UserService";
import { getStaff, searchStaff, submitCase } from "../services/StaffService";
import { getCasePosition, getStaffRank } from "../services/HelperService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel, faMinus, faPlus, faSearch, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import ProfileIcon from "../assets/profile.png";
import UserContext from "../services/UserContext";
import { Redirect } from "react-router-dom";

const NewCasePage = () => {
    const { user } = useContext(UserContext);

    const [details, setDetails] = React.useState("");
    const [evidence, setEvidence] = React.useState("");
    const [caseType, setCaseType] = React.useState(1);
    const [otherDetails, setOtherDetails] = React.useState("");
    const [staffHelper, setStaffHelper] = React.useState("");
    const [staffHelperSteam, setStaffHelperSteam] = React.useState("");

    const [staffQuery, setStaffQuery] = React.useState("");
    const [membersQuery, setMembersQuery] = React.useState("");

    const [staffList, setStaffList] = React.useState({
        count: 0,
        result: []
    });
    const [members, setMembers] = React.useState({
        count: 0,
        result: []
    });
    const [caseMembers, setCaseMembers] = React.useState({
        case: 0,
        result: []
    });

    const [caseSubmitted, setCaseSubmitted] = React.useState(false);

    const validateForm = () => (details !== "" && evidence !== "" && otherDetails !== "");

    const caseTypes = Object.entries(CaseTypes).slice(1);

    const handleSubmitCase = async (event) => {
        event.preventDefault();

        const caseDetails = {
            staffMember: user.pid,
            staffHelper: staffHelper.pid,
            details: details,
            evidence: evidence,
            caseType: caseType,
            other: otherDetails,
            members: caseMembers.result.map(({pid, reporter}) => ({pid: pid, reporter: reporter}))
        }

        const result = await submitCase(caseDetails)

        if(result === 200) return setCaseSubmitted(true)

        window.alert("Error Saving Case")
    }

    useEffect(() => {
        const getMembers = async () => {
            const users = await searchUsers(membersQuery, 1, 20)
            setMembers(users)
        }

        getMembers()
    }, [membersQuery, setMembers])

    useEffect(() => {
        const getMembers = async () => {
            const staff = await searchStaff(staffQuery, 1, 20)
            console.log(staff)
            setStaffList(staff)
        }

        getMembers()
    }, [staffQuery, setStaffList])

    useEffect(() => {
        if(!staffHelper) return
        const getSteamInfo = async() => {
            const steamInfo = await getUserSteam(staffHelper.pid);
            setStaffHelperSteam(steamInfo)
            console.log(steamInfo)
        }
        getSteamInfo()
    }, [staffHelper, setStaffHelperSteam])

    const fetchStaff = debounce((searchTerm) => {
        setStaffQuery(searchTerm);
    }, 500);

    const fetchMembers = debounce((searchTerm) => {
        setMembersQuery(searchTerm);
    }, 500);

    if(caseSubmitted) return <Redirect to="/cases"/>
    return (
        <>
            <Title title="New Support Case"/>
            <h1>New Support Case</h1>
           
            <form onSubmit={handleSubmitCase}>
            <div className="page-row">
                
                    <div className="user-info-tab">
                        <div className="support-form-details">
                            <textarea className="case-details" value={details} onChange={(e) => setDetails(DOMPurify.sanitize(e.target.value))} placeholder="Details"/>
                            <textarea className="other-input" value={otherDetails} onChange={(e) => setOtherDetails(DOMPurify.sanitize(e.target.value))} placeholder="Other Information"/>
                            <input className="evidence-input" type="text" value={evidence} onChange={(e) => setEvidence(DOMPurify.sanitize(e.target.value))} placeholder="Evidence"/>                            
                        </div>
                    </div>
                    <div className="user-info-tab">
                        {
                            staffHelperSteam ? 
                            <a target="_blank" rel="noopener noreferrer" href={staffHelperSteam.profileUrl} className="steam-profile-support">
                                <img alt="Default Avatar" src={staffHelperSteam.avatarUrl}></img>
                                <div className="steam-details">
                                    <span>{staffHelper.username}</span>
                                    <span className="userid">Staff Rank: {getStaffRank(staffHelper.adminLevel)}</span>
                                    <span className="userid">PID: {staffHelper.pid}</span>
                                </div>
                            </a> :
                            <div className="steam-profile-support">
                                <img alt="Default Avatar" src={ProfileIcon}></img>
                                <div className="steam-details">
                                    <span>No Staff Helper</span>
                                    <span className="userid">Staff Rank: None</span>
                                    <span className="userid">PID: None</span>
                                </div>
                            </div>
                        }
                            
                        <select className="case-type" name="case-type" id="case-type" onChange={(e) => setCaseType(parseInt(e.target.value))} value={caseType}>
                            {
                                caseTypes.map((caseType, idx) => (
                                    <option key={idx} value={caseType[1]}>{caseType[0]}</option>
                                ))
                            }
                        </select>
                        

                        <button className="case-submit-btn" disabled={!validateForm()} type="submit">Submit Case</button>
                    </div>
                
            </div>
            </form>
            <div className="page-row">
                <div className="user-info-tab">
                    <Tabs>
                        <TabList>
                            <Tab>Members</Tab>
                            <Tab>Staff Helper</Tab>
                        </TabList>
                        <TabPanel>
                            <div className="filters">
                                <div></div>

                                <div className="search-box">
                                    <input type="text" placeholder="Search" onChange={(e) => fetchMembers(e.target.value)}/>
                                    <button>
                                        <FontAwesomeIcon icon={faSearch}/>
                                    </button>
                                </div>
                            </div>
                            <div className="table">
                                <div className="table-head">
                                    <div>Name</div>
                                    <div>Pid</div>
                                    <div></div>
                                </div>
                                {
                                    members.result.length > 0 ?
                                    <>  
                                    {
                                        members.result.map((user, idx) => {
                                            const { name, pid } = user

                                            if(caseMembers.result.find(user => user.pid === pid)) return undefined
                                            return (
                                                <div className="table-row" key={idx}>
                                                    <div>{name}</div>
                                                    <div>{pid}</div>
                                                    <div><FontAwesomeIcon className="delete-btn" icon={faPlus} onClick={e => setCaseMembers({
                                                        count: caseMembers.count + 1,
                                                        result: [
                                                            ...caseMembers.result,
                                                            {...user, reporter: 0 }
                                                        ]
                                                    })}/>
                                                    <FontAwesomeIcon className="delete-btn" icon={faGavel} onClick={e => setCaseMembers({
                                                        count: caseMembers.count + 1,
                                                        result: [
                                                            ...caseMembers.result,
                                                            {...user, reporter: 1}
                                                        ]
                                                    })}/></div>
                                                </div>
                                            )
                                        })
                                    }
                                    </> : 
                                    <div className="table-row">
                                        <div>No results found</div>
                                    </div>
                                }
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="filters">
                                <div></div>

                                <div className="search-box">
                                    <input type="text" placeholder="Search" onChange={(e) => fetchStaff(e.target.value)}/>
                                    <button>
                                        <FontAwesomeIcon icon={faSearch}/>
                                    </button>
                                </div>
                            </div>
                            <div className="table">
                                <div className="table-head">
                                    <div>Name</div>
                                    <div>Staff Rank</div>
                                    <div>UID</div>
                                    <div></div>
                                </div>
                                {
                                    staffList.result.length > 0 ?
                                    <>  
                                    {
                                        staffList.result.map((user, idx) => {
                                            const {username, uid, adminLevel} = user
                                            return (
                                                <div className="table-row" key={idx}>
                                                    <div>{username}</div>
                                                    <div>{getStaffRank(adminLevel)}</div>
                                                    <div>{uid}</div>
                                                    <div>
                                                        {
                                                            staffHelper.uid === uid ? 
                                                            <FontAwesomeIcon className="delete-btn" icon={faMinus} onClick={e => setStaffHelper({})}/> :
                                                            <FontAwesomeIcon className="delete-btn" icon={faPlus} onClick={e => setStaffHelper(user)}/>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    </> : 
                                    <div className="table-row">
                                        <div>No results found</div>
                                    </div>
                                }
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
                
                <div className="user-info-tab">
                    <Tabs>
                        <TabList>
                            <Tab>Case Members</Tab>
                        </TabList>
                        <TabPanel>
                            <div className="filters">
                                <div></div>

                                <div className="search-box">
                                    <input type="text" placeholder="Search" onChange={(e) => fetchMembers(e.target.value)}/>
                                    <button>
                                        <FontAwesomeIcon icon={faSearch}/>
                                    </button>
                                </div>
                            </div>

                            <div className="table">
                                <div className="table-head">
                                    <div>Name</div>
                                    <div>Pid</div>
                                    <div>Position</div>
                                    <div></div>
                                </div>
                                {
                                    caseMembers.result.length > 0 ?
                                    <>  
                                    {
                                        caseMembers.result.map((user, idx) => {
                                            const { name, pid, reporter } = user
                                            return (
                                                <div className="table-row" key={idx}>
                                                    <div>{name}</div>
                                                    <div>{pid}</div>
                                                    <div>{getCasePosition(reporter)}</div>
                                                    <div><FontAwesomeIcon className="delete-btn" icon={faTrashAlt} onClick={e => setCaseMembers({
                                                        count: caseMembers.count - 1,
                                                        result: caseMembers.result.filter(user => user.pid !== pid)
                                                    })}/></div>
                                                </div>
                                            )
                                        })
                                    }
                                    </> : 
                                    <div className="table-row">
                                        <div>No members found</div>
                                    </div>
                                }
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
            </div>
        </>
    )
}

export default NewCasePage;