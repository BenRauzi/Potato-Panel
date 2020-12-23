import { jwtVerify } from "./authHelper";

const types = {
    "comp": 1,
    "whitelist": 2,
    "vehicles": 3,
    "staff": 4,
    "rcon": 5,
    "licenses": 6,
    "case": 7,
    "house": 8,
    "misc": 9,
};

export const logAction = async (staffCookie, member, log, type, sql) => {
    const userData = await jwtVerify(staffCookie);
    try {
        await sql.awaitQuery(`INSERT into panel_logs (staff_member, member, log, type) VALUES (?, ?, ?, ?)`, [
            userData.pid,
            member,
            log,
            types[type]
        ]);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    };
};

export default logAction