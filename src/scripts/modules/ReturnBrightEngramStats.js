

// Return bright engram progressional statistics
async function ReturnBrightEngramProgressionStats(seasonProgressionInfo, prestigeInfo, rewardsTrack, itemDefinitions) {

    // BRIGHT ENGRAMS (todo):
    // If the user is level 97 then this means their next engram is 102 (5 levels)
    // The 5n term starts at level 97 instead of 100
    // For this we can use a linear function (y = mx + b)
    // and rearrange it to solve for x
    // In this scenario we can just assume that x will yeild a decimal value that we can
    // use as a percentage progress to the next level that awards a bright engram
    // nextEngramLevel = (currentLevel - startLevel) / nth term
    // nextEngramLevel = (102 - 97) / 5;
    // nextEngramLevel = 0.8 or 80%
    // Of course this is all assuming that b always starts at 97 and not some other arbitrary value, other than 100.
};



// Calculate stats based around the season pass XP structure 
// async function ReturnSeasonProgressionStats(seasonProgressionInfo, prestigeInfo, rewardsTrack, itemDefinitions) {

//     // Get total season rank 
//     let seasonRank = seasonProgressionInfo.level + prestigeInfo.level, 
//         returnArr = {};

//     // Check if the season pass is higher than level 100 (prestige level)
//     if (seasonRank >= 100) { // Prestige

//         let levelsOutOfFiveToNextRank = (((seasonRank - 97) / 5) * 10) / 2;

//         let nextEngramRank = (seasonRank + ((levelsOutOfFiveToNextRank) - 5)),
//             brightEngramCount = 0,
//             fireteamBonusXpPercent = 0,
//             bonusXpPercent = 0;

//         // Push Xp required until next engram to returnArr
//         returnArr.xpRequiredForNextEngram = ((nextEngramRank - seasonRank) * 100000) - prestigeInfo.progressToNextLevel;

//         // Iterate through the entire season pass and count all bright engrams
//         Object.keys(rewardsTrack).forEach(v => {
//             rewardsTrack[v].forEach(x => {

//                 let itemDisplayProperties = itemDefinitions[x].displayProperties;

//                 if (x === 1968811824) {
//                     brightEngramCount++;
//                 }
//                 else if (itemDisplayProperties.name === 'Small Fireteam XP Boost') {
//                     fireteamBonusXpPercent = fireteamBonusXpPercent + 2;
//                 }
//                 else if (itemDisplayProperties.name === 'Small XP Boost') {
//                     bonusXpPercent = bonusXpPercent + 2;
//                 };
//             });
//         });

//         // Push all results to the array that we return
//         let prestigeRanksDividedNthTerm = (seasonRank - 100) / 5;
//         returnArr.totalBrightEngramsEarnt = brightEngramCount + Math.trunc(prestigeRanksDividedNthTerm);
//         returnArr.sharedWisdomBonusValue = fireteamBonusXpPercent;
//         returnArr.bonusXpBonusValue = bonusXpPercent;
//         returnArr.progressToNextLevel = prestigeInfo.progressToNextLevel;
//         returnArr.xpToMaxSeasonPassRank = 0;

//         // Change DOM content if the user is over rank 100
//         document.getElementById('seasonPassSecondContainer').style.color = 'rgb(99, 99, 99)';
//         document.getElementById('seasonPassXpToMaxRank').style.color = 'rgb(63, 96, 112)';
//     }

//     else if (seasonRank < 100) { // Not prestige (less than 100)
//         // Here, we are earning bright engrams relative to the season pass structure, because we are not past level 100
//         // Once we are level 97, the n5 term applies to the levelling structure
//         let splicedRewardsTrack = Object.keys(rewardsTrack).splice(seasonRank), 
//             seasonPassEngramRanks = [];

//         // Iterate through rewards track and get every bright engram at their respective levels
//         splicedRewardsTrack.forEach(v => {
//             rewardsTrack[v].forEach(x => {
//                 if (x === 1968811824) {
//                     seasonPassEngramRanks.push(v);
//                 };
//             });
//         });

//         // Push results to return array
//         if (!seasonPassEngramRanks[0]) {

//             // Read above this function for more info on this
//             let levelsOutOfFiveToNextRank = (((seasonRank - 97) / 5) * 10) / 2;
//             let xpRequiredForNextRankThatGivesEngram = ((5 - (levelsOutOfFiveToNextRank)) * 100000) + seasonProgressionInfo.progressToNextLevel;
//             returnArr.xpRequiredForNextEngram = xpRequiredForNextRankThatGivesEngram;
//         }
//         else if (seasonPassEngramRanks[0]) {

//             let nextEngramRank = seasonPassEngramRanks[0];
//             returnArr.xpRequiredForNextEngram = ((nextEngramRank - seasonRank) * 100000) - seasonProgressionInfo.progressToNextLevel;
//         };

//         // Iterate through indexes before and upto the season rank level to get total number of bright engrams earnt
//         let RewardsTrackUptoSeasonRank = Object.keys(rewardsTrack).splice(0, seasonRank), brightEngramCount = 0, fireteamBonusXpPercent = 0, bonusXpPercent = 0;

//         RewardsTrackUptoSeasonRank.forEach(v => {
//             rewardsTrack[v].forEach(x => {

//                 let itemDisplayProperties = itemDefinitions[x].displayProperties;

//                 if (x === 1968811824) {
//                     brightEngramCount++;
//                 }
//                 else if (itemDisplayProperties.name === 'Small Fireteam XP Boost') {
//                     fireteamBonusXpPercent = fireteamBonusXpPercent + 2;
//                 }
//                 else if (itemDisplayProperties.name === 'Small XP Boost') {
//                     bonusXpPercent = bonusXpPercent + 2;
//                 };
//             });
//         });

//         // Push results to return array
//         returnArr.totalBrightEngramsEarnt = brightEngramCount;
//         returnArr.sharedWisdomBonusValue = fireteamBonusXpPercent;
//         returnArr.bonusXpBonusValue = bonusXpPercent;
//         returnArr.progressToNextLevel = seasonProgressionInfo.progressToNextLevel;
//         returnArr.xpToMaxSeasonPassRank = (seasonProgressionInfo.levelCap - seasonProgressionInfo.level) * 100000 + seasonProgressionInfo.progressToNextLevel;
//     };

//     // Return our object
//     return returnArr;
// };