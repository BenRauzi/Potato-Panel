export const formatMoney = (string) => {
    const output = "$" + (string.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    return output
}

export const getRole = (user) => {
    if(user.adminLevel > 0) return getStaffRank(user.adminLevel)
    if(user.copWhitelisting > user.emsWhitelisting) return getCopRank(user.copWhitelisting)
    if(user.emsWhitelisting > 0) return getEmsRank(user.emsWhitelisting)

    
    return "No Role"
}

export const getStaffRank = (level) => {
    const { staffRanks } = window

    for (var [rank, rankLevel] of Object.entries(staffRanks)) {
        if(rankLevel === level) return rank
    }
}

export const getCopRank = (level) => {
    const { copRanks } = window

    for (var [rank, rankLevel] of Object.entries(copRanks)) {
        if(rankLevel === level) return rank
    }

}

export const getEmsRank = (level) => {
    const { emsRanks } = window

    for (var [rank, rankLevel] of Object.entries(emsRanks)) {
        if(rankLevel === level) return rank
    }
}

export const getCopDept = (level) => {
    const { copDepartments } = window

    for (var [rank, rankLevel] of Object.entries(copDepartments)) {
        if(rankLevel === level) return rank
    }
}

export const getEmsDept = (level) => {
    const { emsDepartments } = window

    for (var [rank, rankLevel] of Object.entries(emsDepartments)) {
        if(rankLevel === level) return rank
    }
}

export const getPerms = (level, adminLevel) => {
    const { Whitelist } = window
    
    if (adminLevel >= 4) return "Full Permissions";
    if (adminLevel >= 2) return "Whitelist";
    
    for (var [rank, rankLevel] of Object.entries(Whitelist)) {
        if(rankLevel === level) return rank
    }
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
}