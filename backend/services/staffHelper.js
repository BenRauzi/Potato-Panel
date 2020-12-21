const { jwtVerify } = require("./authHelper");

const types = {
    "comp": 0,
    "whitelist": 1,
    "vehicles": 2,
    "staff": 3,
    "rcon": 4,
    "licenses": 5,
}
const logAction = async (staffCookie, member, log, type, sql) => {
    const userData = await jwtVerify(staffCookie);
    console.log(userData)
    try {
        await sql.awaitQuery(`INSERT into panel_logs (staff_member, member, log, type) VALUES (?, ?, ?, ?)`, [
            userData.pid,
            member,
            log,
            types[type]
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
