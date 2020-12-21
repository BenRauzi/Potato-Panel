const { jwtVerify } = require("./authHelper");

const logAction = async (staffCookie, member, log, type, sql) => {
    const userData = await jwtVerify(staffCookie);
    console.log(userData)
    try {
        await sql.awaitQuery(`INSERT into panel_logs (staff_member, member, log, type) VALUES (?, ?, ?, ?)`, [
            userData.pid,
            member,
            log,
            type
        ])
        return true
    } catch(err) {
        console.log(err)
        return false
    }
}

module.exports = {
    logAction
}
