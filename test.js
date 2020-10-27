const copLevel = 1;
const adminLevel = 3;
const myCopLevel = 3;
const newCopLevel = 4;

console.log("Running");

//if (adminLevel < 3) {
//    if (adminLevel < 2 && copLevel === 0) {
//        return console.log("mate ur not allowed to fkn whitelist");
//        // No u cannot do this naughty boi
//    } else {
//        if (newCopLevel >= myCopLevel) return console.log("New cop level is higher than ur own idiot");
//    };
//    console.log("How did I get here? you are now whitelisted get out of support channel 3");
//} else {
//    console.log("Whitelisted cause u are high rank mate");
//};


if ((adminLevel < 2  && copLevel === 0)) return console.log("First Error");
if (adminLevel < 3 && newCopLevel >= myCopLevel) return console.log("Second Error");


console.log("Finished");



