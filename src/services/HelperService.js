import { staffRanks, copRanks, emsRanks, developerRanks, copDepartments, emsDepartments, Whitelist, developerDepartments, LicenseList, CaseTypes, CasePositions, dojRanks, dojDepartments, logTypes} from "../config/config";

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

export const getDevDept = (level) => {

    for (var [rank, rankLevel] of Object.entries(developerDepartments)) {
        if(rankLevel === level) return rank
    }
}

export const getDojLevel = (level) => {

    for (var [rank, rankLevel] of Object.entries(dojRanks)) {
        if(rankLevel === level) return rank
    }
}

export const getDojDept = (level) => {

    for (var [rank, rankLevel] of Object.entries(dojDepartments)) {
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

export const getLicenseName = (code) => {

    for (var [anme, classname] of Object.entries(LicenseList)) {
        if(classname === code) return anme
    }
}

export const getStaffPerms = (level) => {
    if (level >= 6) return "Full Permissions";
    if (level === 5) return "Whitelist";
    return "No Permissions";
}

export const getCaseType = (type) => {

    if(!CaseTypes) return "Error"
    for (var [name, caseType] of Object.entries(CaseTypes)) {
        if(type === caseType) return name
    }

}

export const getCasePosition = (position) => {

    if(!CasePositions) return "Error"
    for (var [name, casePosition] of Object.entries(CasePositions)) {
        if(casePosition === position) return name
    }
}

export const getLogType = (position) => {

    if(!logTypes) return "Error"
    for (var [name, logType] of Object.entries(logTypes)) {
        if(logType === position) return name
    }
}

export const getTimeSince = (date, current_time = new Date()) => {
    var seconds = Math.floor((current_time - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
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
   getDevDept,
   getLicenseName,
   getCaseType,
   getCasePosition,
   getTimeSince,
   getLogType,
}