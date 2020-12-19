const { checkToken } = require("../services/authService");

const { v4: uuid } = require('uuid');
const { getSteamInfo } = require("../services/steamHelper");

const casesController = (app, sql) => {
    app.get('/cases', checkToken, async(req, res) => {
        const pageNumber = req.query.p || 1;
        const count = parseInt(req.query.c) || 10;

        const startingPoint = (pageNumber - 1) * count;

        try {
            const caseCount = await sql.awaitQuery("SELECT CURRENT_TIMESTAMP, COUNT(*) from support_cases");

            const cases = await sql.awaitQuery(`SELECT id, support_cases.uid, support_cases.staff_member as staffMember, support_cases.case_type as caseType, support_cases.time, players.name as staffMemberName FROM support_cases 
            INNER JOIN players
            ON players.pid = support_cases.staff_member
            ORDER BY id DESC LIMIT ?, ?`, [
                startingPoint,
                count
            ])
            

            const response = {
                count: caseCount[0]["COUNT(*)"],
                time: caseCount[0]["CURRENT_TIMESTAMP"],
                result: cases
            }

            return res.send(response)
        } catch(error) {
            console.log(error)
            return res.sendStatus(500)
        }
    })

    app.get('/cases/filter', checkToken, async(req, res) => {
        const pageNumber = req.query.p || 1;
        const caseType = parseInt(req.query.type);
        const count = parseInt(req.query.c) || 10;

        const startingPoint = (pageNumber - 1) * count;

        try {
            const caseCount = await sql.awaitQuery("SELECT CURRENT_TIMESTAMP, COUNT(*) from support_cases WHERE case_type = ?", [caseType]);

            const cases = await sql.awaitQuery(`SELECT id, support_cases.uid, support_cases.staff_member as staffMember, support_cases.case_type as caseType, support_cases.time, players.name as staffMemberName FROM support_cases 
            INNER JOIN players
            ON players.pid = support_cases.staff_member
            WHERE support_cases.case_type = ?
            ORDER BY id DESC LIMIT ?, ?`, [
                caseType,
                startingPoint,
                count
            ])
            

            const response = {
                count: caseCount[0]["COUNT(*)"],
                time: caseCount[0]["CURRENT_TIMESTAMP"],
                result: cases
            }

            return res.send(response)
        } catch(error) {
            console.log(error)
            return res.sendStatus(500)
        }
    })

    app.post('/case/add', checkToken, async(req, res) => {

        const { staffMember, staffHelper, details, evidence, other, caseType, members } = req.body

        const uid = uuid()
        try {
            const result = await sql.awaitQuery(`INSERT INTO support_cases (uid, staff_member, staff_helper, details, evidence_link, other, case_type) VALUES (?, ?, ?, ?, ?, ?, ?)`
            , [
                uid,
                staffMember,
                staffHelper,
                details,
                evidence,
                other,
                caseType,
            ])

            const memberResult = await sql.awaitQuery(`INSERT INTO support_case_members (case_id, pid, reporter) VALUES
                    ${"(?, ?, ?), ".repeat(members.length)}`.slice(0, -2), members.flatMap(({pid, reporter}) => [uid, pid, reporter]))

            return res.sendStatus(200)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    })

    app.get('/case', checkToken, async(req, res) => {
        const caseId = req.query.id

        if(!caseId) return res.sendStatus(204)

        try {
            const result = await sql.awaitQuery(`SELECT CURRENT_TIMESTAMP as currentTime, support_cases.*, support_case_members.pid, support_case_members.reporter, p1.name, p2.name AS staff_name, p3.name AS staff_helper_name, panel_1.adminLevel as staff_rank, panel_2.adminLevel as staff_helper_rank
                FROM support_cases 
                LEFT JOIN support_case_members 
                ON support_case_members.case_id = support_cases.uid 
                LEFT JOIN players p1
                ON support_case_members.pid = p1.pid
                INNER JOIN players p2
                ON support_cases.staff_member = p2.pid
                INNER JOIN panel_users panel_1
                ON support_cases.staff_member = panel_1.pid
                LEFT JOIN panel_users panel_2
                ON support_cases.staff_helper = panel_2.pid
                LEFT JOIN players p3
                ON support_cases.staff_helper = p3.pid
                WHERE support_cases.uid = ?
            `, [
                caseId
            ])
            
            // const { id, uid, staff_member, staff_helper, details, evidence: evidence_link, other, caseType: case_type, time} = result[0]
            const caseData = {
                ...result[0],
                pid: undefined,
                reporter: undefined,
                name: undefined,
                members: result.map(({pid, reporter, name}) => ({pid: pid, reporter: reporter, name: name}))
            }

            if(caseData.staff_helper) {
                const [ staffMemberSteam, staffHelperSteam ] = await Promise.all([getSteamInfo(caseData.staff_member), getSteamInfo(caseData.staff_helper)])
                return res.send({...caseData, staffHelperSteam, staffMemberSteam})
            }

            const staffMemberSteam = await getSteamInfo(caseData.staff_member);
            
            return res.send({...caseData, staffMemberSteam})
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    })

    app.get("/user/cases", checkToken, async(req, res) => {
        const userId = req.query.pid;

        if(!userId) return res.sendStatus(204)

        try {
            const result = await sql.awaitQuery(`SELECT CURRENT_TIMESTAMP as currentTime, support_cases.id, support_cases.uid, support_cases.staff_member, support_cases.case_type as caseType, support_cases.time, players.name as staffMemberName, support_case_members.reporter FROM support_cases
                INNER JOIN support_case_members
                ON support_case_members.case_id = support_cases.uid
                INNER JOIN players
                ON support_cases.staff_member = players.pid
                WHERE support_case_members.pid = ? 
                ORDER BY support_cases.id DESC 
            `, [
                userId
            ])

            res.send(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    })
}

module.exports = casesController