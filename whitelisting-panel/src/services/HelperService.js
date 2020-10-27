import { staffRanks, copRanks, emsRanks, developerRanks, copDepartments, emsDepartments, Whitelist} from "../config/config";


export const formatMoney = (string) => {
    const output = "$" + (string.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    return output
}

export const getRole = (user) => {
    if(user.adminLevel > 0) return getStaffRank(user.adminLevel)
    if(user.developerlevel > 0) return getDevRank(user.developerlevel)
    if(user.copWhitelisting > user.emsWhitelisting) return getCopRank(user.copWhitelisting)
    if(user.emsWhitelisting > 0) return getEmsRank(user.emsWhitelisting)

    return "No Role"
}

export const getStaffRank = (level) => {
    if(!staffRanks) return "Error"

    for (var [rank, rankLevel] of Object.entries(staffRanks)) {
        if(rankLevel === level) return rank
    }
}

export const getCopRank = (level) => {

    if(!copRanks) return "Error"
    for (var [rank, rankLevel] of Object.entries(copRanks)) {
        if(rankLevel === level) return rank
    }

}

export const getEmsRank = (level) => {

    if(!emsRanks) return "Error"
    for (var [rank, rankLevel] of Object.entries(emsRanks)) {
        if(rankLevel === level) return rank
    }
}

export const getDevRank = (level) => {

    if(!developerRanks) return "Error"
    for (var [rank, rankLevel] of Object.entries(developerRanks)) {
        if(rankLevel === level) return rank
    }
}

export const getCopDept = (level) => {

    for (var [rank, rankLevel] of Object.entries(copDepartments)) {
        if(rankLevel === level) return rank
    }
}

export const getEmsDept = (level) => {

    for (var [rank, rankLevel] of Object.entries(emsDepartments)) {
        if(rankLevel === level) return rank
    }
}

export const getPerms = (level, adminLevel) => {

    if (adminLevel >= 4) return "Full Permissions";
    if (adminLevel >= 2) return "Whitelist";
    
    for (var [rank, rankLevel] of Object.entries(Whitelist)) {
        if(rankLevel === level) return rank
    }
}

export const getStaffPerms = (level) => {
    if (level >= 6) return "Full Permissions";
    if (level === 5) return "Whitelist";
    return "No Permissions";
}

export default {
   formatMoney,
   getRole,
   getCopRank,
   getStaffRank,
   getEmsRank,
   getEmsDept,
   getCopDept,
   getPerms,
   getDevRank,
}