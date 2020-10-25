export const formatMoney = (string) => {
    const output = "$" + (string.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    return output
}

export default {
    formatMoney
}