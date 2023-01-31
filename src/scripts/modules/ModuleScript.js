import { 
    itemTypeKeys,
    VendorHashesByLabel, 
    CurrentlyAddedVendors,
    vendorKeys,
    baseYields,
    petraYields,
    ActivityMode } from "./SynergyDefinitions.js";
import {
    itemDisplay,
    eventFilters,
    charBounties,
    excludedBountiesByVendor,
    itemDefinitions,
    objectiveDefinitions,
    seasonDefinitions,
    recordDefinitions,
    presentationNodeDefinitions,
    allProgressionProperties, 
    destinyUserProfile} from "../user.js";
import { LoadCharacter } from './LoadCharacter.js';

const log = console.log.bind(console),
      localStorage = window.localStorage,
      sessionStorage = window.sessionStorage;



// Check if state query parameter exists in URL
export async function VerifyState() {

    let urlParams = new URLSearchParams(window.location.search), state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.reload();
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};



// Redirect user back to specified url
// @string {url}, @string {param}
export function RedirUser(url, param) {
    window.location.href = `${url}?${param ? param : ''}`;
};



// Returns corresponding class name string using classType or vice versa
// @int {classType}
export function ParseChar(classType, isReverse = false) {

    log(classType, isReverse);
    if (classType === 0 || classType === 'Titan') {
        if (!isReverse) {
            return 'Titan';
        };
        return 0;
    }
    else if (classType === 1 || classType === 'Hunter') {
        if (!isReverse) {
            return 'Hunter';
        };
        return 1;
    }
    else if (classType === 2 || classType === 'Warlock') {
        if (!isReverse) {
            return 'Warlock';
        };
        return 2;
    };
};



// Return recordDefinition of current the seasons' challenges
// weekNumber: 1-xx where 0 is the "Complete all seasonal challenges" record
// Modular function, if weekNumber is passed, then it will only return challenges in that week, otherwise it will return all challenges
// @int {seasonHash}, @object {recordDefinitions}, @object {DestinyPresentationNodeDefinition}, @int {weekNumber}
export async function ParseSeasonalChallenges(seasonHash, seasonDefinitions, recordDefinitions, presentationNodeDefinitions, weekNumber) {

    // Self function to add props onto a challenge
    function addPropsToChallengeItem(seasonalChallenges) {
        for (let challenge in seasonalChallenges) {
            if (!seasonalChallenges[challenge].props) {
                seasonalChallenges[challenge].props = [];
            };
            seasonalChallenges[challenge].props = stringMatchProgressionItem(seasonalChallenges[challenge]);
        };
    };

    // Get the presentation node hash for the weekly challenges node
    let seasonalChallengesNodeHash = presentationNodeDefinitions[seasonDefinitions[seasonHash].seasonalChallengesPresentationNodeHash].children.presentationNodes[0].presentationNodeHash,
        seasonalChallenges = {};

    // Check if weekNumber is passed
    if (weekNumber) {

        // Get the presentation node hash for the specified weekly challenges node
        // Then get all the child record hashes for the challenges in that node
        let specifiedSeasonWeekNodeHash = presentationNodeDefinitions[seasonalChallengesNodeHash].children.presentationNodes[weekNumber].presentationNodeHash;
        let specifiedSeasonalChallengesInThatWeek = presentationNodeDefinitions[specifiedSeasonWeekNodeHash].children.records;
        
        // Loop through each challenge in that week and add it to the seasonalChallenges object
        for (let record in specifiedSeasonalChallengesInThatWeek) {
            let recordHash = specifiedSeasonalChallengesInThatWeek[record].recordHash;
            let recordDescription = recordDefinitions[recordHash].displayProperties.description;

            // Check if progressionDescriptor has string variables to replace
            if (recordDescription.includes('{')) {
                recordDefinitions[recordHash].displayProperties.description = replaceStringVariables(recordDescription);
            };
            seasonalChallenges[recordHash] = recordDefinitions[recordHash];
        };

        // Add props to each challenge
        addPropsToChallengeItem(seasonalChallenges);
        
        return seasonalChallenges;
    };

    // Get all the child presentation node hashes for the weekly challenges
    let seasonPresentationNodes = presentationNodeDefinitions[seasonalChallengesNodeHash].children.presentationNodes;
    
    // Loop through each weekly challenge node
    for (let node in seasonPresentationNodes) {
        
        // Get the presentation node hash for each weekly challenges node
        let presentationNodeHash = seasonPresentationNodes[node].presentationNodeHash;
        let weekPresentationNodeDefinition = presentationNodeDefinitions[presentationNodeHash].children.records;

        // Loop through each challenge in that week and add it to the seasonalChallenges object
        for (let fubar in weekPresentationNodeDefinition) {
            let recordHash = weekPresentationNodeDefinition[fubar].recordHash;
            let recordDefinition = recordDefinitions[recordHash];
            let recordDescription = recordDefinitions[recordHash].displayProperties.description;

            // Check if progressionDescriptor has string variables to replace
            if (recordDescription.includes('{')) {
                recordDefinitions[recordHash].displayProperties.description = replaceStringVariables(recordDescription);
            };
            seasonalChallenges[recordHash] = recordDefinition;
        };
    };

    // Add props to each challenge
    addPropsToChallengeItem(seasonalChallenges);

    return seasonalChallenges;
};



// Make element for entry data when hash is found in itemDefinitions
// @object {param}
export async function MakeBountyElement(param) {

    let itemOverlay = document.createElement('div'), 
        itemStatus = document.createElement('img'), 
        itemTitle = document.createElement('div'), 
        itemType = document.createElement('div'), 
        itemDesc = document.createElement('div'), 
        item = document.createElement('img'),
        hr = document.createElement('hr');

    // Create bottom element
    item.className = `bounty`;
    item.id = `bounty_${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
    item.style.width = `${itemDisplay.itemDisplaySize}px`;
    document.querySelector('#bountyItems').appendChild(item);

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    itemOverlay.style.display = 'none';
    itemOverlay.style.zIndex = '99';
    itemOverlay.style.pointerEvents = 'none';
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Prop content of item
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;
    itemDesc.innerHTML = param.displayProperties.description;

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).append(itemTitle, itemType, hr, itemDesc);

    // Create item progress and push to DOM
    let rootIndex = param.objectiveDefinitions, completionCounter = 0;

    for (let indexCount = 0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgCounter = document.createElement('div'), 
            itemPrgDesc = document.createElement('div');

        // Check if progess string exceeds char limit
        if (rootIndex[indexCount].progressDescription.length >= 24) {

            let rt = rootIndex[indexCount].progressDescription.slice(0, 24);
            if (rt.charAt(rt.length - 1) === ' ') {
                rt = rt.slice(0, rt.length - 1); // Remove deadspaces at the end of strings
            };
            rootIndex[indexCount].progressDescription = rt + '..';
        };

        itemPrgCounter.className = 'itemPrgCounter';
        itemPrgDesc.className = 'itemPrgDesc';
        itemPrgCounter.id = `prgCounter_${rootIndex[indexCount].hash}`;
        itemPrgDesc.id = `prgDesc_${rootIndex[indexCount].hash}`;

        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgCounter);
        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgDesc);

        // Render item objective progress
        itemPrgDesc.innerHTML = rootIndex[indexCount].progressDescription;
        param.progress.forEach(h => {
            if (h.objectiveHash === rootIndex[indexCount].hash) {

                // Render objective progress
                if (rootIndex[indexCount].completionValue === 100) {
                    itemPrgCounter.innerHTML = `${h.progress}%`;
                }
                else if (rootIndex[indexCount].completionValue !== 100) {
                    itemPrgCounter.innerHTML = `${h.progress}/${h.completionValue}`;
                };

                // Check if objective is completed
                if (h.complete) {
                    completionCounter++;
                };
            };
        });

        // Space out objectives, evenly, if there are more than 1
        let paddingStepAmount = 40 / (rootIndex.length); // 40 is the max padding-bottom value
        itemPrgCounter.style.paddingBottom = '21px';
        itemPrgDesc.style.paddingBottom = '20px';

        // Space objectives
        for (let padC = 1; padC < rootIndex.length; padC++) {

            let offset = paddingStepAmount * indexCount;
            if (offset !== 0) {
                itemPrgCounter.style.paddingBottom = `${parseInt(itemPrgCounter.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
                itemPrgDesc.style.paddingBottom = `${parseInt(itemPrgDesc.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
            };
        };
    };

    // Mark item as complete
    if (param.progress.length === completionCounter) {

        // Change areObjectivesComplete boolean
        param.areObjectivesComplete = true;
    }
    else if (param.progress.length !== completionCounter) {

        // Change areObjectivesComplete boolean
        param.areObjectivesComplete = false;
    };

    // Mark item as expired
    if (param.isExpired && !param.areObjectivesComplete) {

        // Change style to represent state
        itemStatus.className = `expire`;
        itemStatus.id = `expire_${param.hash}`;
        itemStatus.src = './static/ico/pursuit_expired.svg';
        document.getElementById(`bounty_${param.hash}`).style.border = '1px solid rgba(179,73,73, 0.749)';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.className = `complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './static/ico/pursuit_completed.svg';
        document.getElementById(`bounty_${param.hash}`).style.border = '1px solid rgba(182,137,67, 0.749)';
    };

    // Append the item status to the item
    document.querySelector(`#bountyItems`).append(itemStatus);

    // Watch for mouse events
    item.addEventListener('mousemove', function (e) {
        itemOverlay.style.position = 'absolute';
        itemOverlay.style.display = 'block';
        itemOverlay.style.left = `${e.pageX}px`;
        itemOverlay.style.top = `${e.pageY}px`;
    });

    item.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};



// Add loading bar and text to animate
// @boolean {passiveLoad}
export function StartLoad(passiveLoad) {

    if (passiveLoad) {
        document.getElementById('loadBarContainer').style.display = 'flex';
        return;
    };

    document.getElementById('skeletonLoadContainer').style.display = 'flex';
};



// Remove loading bar and text to animate
// @boolean {passiveLoad}
export function StopLoad(passiveLoad) {
    
    if (passiveLoad) {
        document.getElementById('loadBarContainer').style.display = 'none';
        return;
    };

    document.getElementById('skeletonLoadContainer').style.display = 'none';

    // If mobile view (temp fix)
    if (window.innerWidth <= 645) {
        document.getElementById('containerThatHasTheSideSelectionAndContentDisplay').style.display = 'block';
        return;
    };
    document.getElementById('containerThatHasTheSideSelectionAndContentDisplay').style.display = 'flex';
};



// Log user out on request
export function Logout() {
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.deleteDatabase('keyval-store');
    window.location.href = import.meta.env.HOME_URL;
};



// Insert commas into numbers where applicable
// @int {num}
export function InsertSeperators(num) {
    return new Intl.NumberFormat().format(num);
};



// Capitalize First letter of string
// @string {string}
export function CapitilizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



// Sort items into bounties
// @array {charInventory}, @object {charObjectives}, @object {itemDefintiions}
export function ParseBounties(charInventory, charObjectives, itemDefinitions) {

    let charBounties = [], 
        amountOfBounties = 0,
        returnObject = {};

    charInventory.forEach(bounty => {

        let item = itemDefinitions[bounty.itemHash];

        if (item.itemType === 26) {

            // Find the bounties origin vendor and check if it has been added
            // If the bounty has not beed added (referenced in CurrentAddedBounties)
            // then add it to the array so we can exclude it from permutations
            item.inventory.stackUniqueLabel.split('.').forEach(labelSubString => {

                if (Object.keys(VendorHashesByLabel).includes(labelSubString)) {
                    if (!Object.keys(CurrentlyAddedVendors).includes(labelSubString)) {

                        // Add the vendor, and the bounties, to the object
                        if (!excludedBountiesByVendor[labelSubString]) {
                            excludedBountiesByVendor[labelSubString] = [];
                        };
                        excludedBountiesByVendor[labelSubString].push(item.hash);
                    };
                };
            });

            // Add objectives to item
            item.progress = [];
            for (let objective of charObjectives[bounty.itemInstanceId].objectives) {
                item.progress.push(objective);
            };

            // Add isExpired property
            item.isExpired = new Date(bounty.expirationDate) < new Date();

            // Add props (properties) array
            item.props = [];

            // Add item properties
            item.props = stringMatchProgressionItem(item);
            log(item.displayProperties.description, item.props);

            // Add isComplete property
            let entriesAmount = item.progress.length, 
                entriesCount = 0;

            for (let objective of item.progress) {
                if (objective.complete) {
                    entriesCount++;
                };
            };

            // Set isComplete to true if the counted amount and length is the same (false by default)
            item.isComplete = false;
            if (entriesAmount === entriesCount) {
                item.isComplete = true;
            };

            // Push bounty item to charBounties and increment amountOfBounties
            charBounties.push(item);
            amountOfBounties++;
        };
    });
    
    returnObject.charBounties = charBounties;
    returnObject.amountOfBounties = amountOfBounties;
    return returnObject;
};



// Push bounties to DOM
// @array {bountyArr}, @int {amountOfBounties}, @function {MakeBountyElement}
export function PushToDOM(bountyArr, amountOfBounties, MakeBountyElement) {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        if (group.length !== 0) {
            group.forEach(item => {
                MakeBountyElement(item);
                amountOfBounties++;
            });
        };
    });
};



// Sort bounties via vendor group
// @array {charBounties}, @array {bountyArr}, @object {vendorKeys}
export function SortByGroup(charBounties, bountyArr, vendorKeys) {

    charBounties.forEach(v => {

        for (let i = 1; i < vendorKeys.length; i++) {

            if (vendorKeys.length - 1 === i) {

                bountyArr['other'].push(v);
                break;
            }
            else if (vendorKeys.length !== i) {

                if (v.inventory.stackUniqueLabel.includes(vendorKeys[i])) {
                    bountyArr[vendorKeys[i]].push(v);
                    break;
                };
            };
        };
    });
    return bountyArr;
};



// Sort bounties via bounty type
// @array {bountyArr}, @function {sortBountiesByType}
export function SortByType(bountyArr, sortBountiesByType) {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.sort(sortBountiesByType);
        };
    });
    return bountyArr;
};



// Sorts by index of item in itemTypeKeys
// @array {a}, @object {b}
export function SortBountiesByType(a, b) {

    let firstStackUniqueLabel = a.inventory.stackUniqueLabel, 
        secondStackUniqueLabel = b.inventory.stackUniqueLabel, 
        bountyTypeA,
        bountyTypeB;


    // Remove numbers from substring that we got from stackUniqueLabel
    // banshee44 is not acceptable so we strip it to banshee for example (not a valid use-case ofc)
    firstStackUniqueLabel.split('.').forEach(v => {

        let cleanStackUniqueLabel = v.replace(/[0-9]/g, '');
        if (itemTypeKeys.includes(cleanStackUniqueLabel)) {
            bountyTypeA = cleanStackUniqueLabel;
        };
    });

    secondStackUniqueLabel.split('.').forEach(v => {

        let cleanStackUniqueLabel = v.replace(/[0-9]/g, '');
        if (itemTypeKeys.includes(cleanStackUniqueLabel)) {
            bountyTypeB = cleanStackUniqueLabel;
        };
    });


    // Sort items by comparing indexes based on where the bountyType is in itemTypeKeys
    // weekly, daily, repeatable (in that order)
    if (itemTypeKeys.indexOf(bountyTypeA) < itemTypeKeys.indexOf(bountyTypeB)) {
        return -1;
    };
    if (itemTypeKeys.indexOf(bountyTypeA) > itemTypeKeys.indexOf(bountyTypeB)) {
        return 1;
    };
    return 0;
};



// Calculate total XP gain from (active) bounties
// @array {bountyArr}, @array {itemTypeKeys}, @object {baseYields}, @object {petraYields}
export async function CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields) {

    var totalXP = 0;
    var includeExpiredBounties = await CacheReturnItem('includeExpiredBounties');

    // Self func
    function DiffXP(bounty, bountyType) {
        // Check if bounty is from Petra
        if (bounty.inventory.stackUniqueLabel.includes('dreaming_city')) {
            totalXP += petraYields[bountyType];
            return;
        };

        // Else do normal calculation
        totalXP += baseYields[bountyType];
        return;
    };

    // Loop through bounty categories
    for (let bountyCtg in bountyArr) {
        
        // Check if category has any bounties
        let group = bountyArr[bountyCtg];
        if (group) {

            // Loop through bounties in category
            group.forEach((bounty) => {

                // Get bounty type
                var bountyType = itemTypeKeys.filter(v => bounty.inventory.stackUniqueLabel.includes(v))[0];

                // If true
                if (includeExpiredBounties) {
                    DiffXP(bounty, bountyType);
                    return;
                };

                // If false
                if (bounty.isComplete || !bounty.isExpired) {
                    DiffXP(bounty, bountyType);
                    return; 
                };

            });
        };
    };

    // Return total XP
    return totalXP;
};



// Return season pass progressional statistics
// @object {seasonProgressionInfo}, @object {prestigeInfo}, @object {rewardsTrack}, @object {itemDefinitions}
export async function ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeInfo, rewardsTrack) {

    const seasonRank = seasonProgressionInfo.level + prestigeInfo.level;
    
    let returnObject = {},
        earntSeasonPassTrackRewards;

    earntSeasonPassTrackRewards = Object.keys(rewardsTrack);

    if (seasonRank < 100) {

        // returnObject keys when under 100
        returnObject.xpToMaxSeasonPassRank = (seasonProgressionInfo.levelCap - seasonProgressionInfo.level) * 100000 + seasonProgressionInfo.progressToNextLevel;
        returnObject.progressToNextLevel = seasonProgressionInfo.progressToNextLevel;

        // Specify rewards track if under 100
        earntSeasonPassTrackRewards = Object.keys(rewardsTrack).splice(0, seasonRank);

        // Weekly progress
        returnObject.weeklyProgress = seasonProgressionInfo.weeklyProgress;
    }
    else {

        // returnObject keys when over 100
        returnObject.progressToNextLevel = prestigeInfo.progressToNextLevel;
        returnObject.xpToMaxSeasonPassRank = 0;

        // Hide if rank is 100+
        document.getElementById('seasonPassSecondContainer').style.display = 'none';

        // Weekly progress
        returnObject.weeklyProgress = prestigeInfo.weeklyProgress;
    };


    let fireteamBonusXpPercent = 0, // Shared wisdom
        bonusXpPercent = 0; // Bonus XP (personal)

    // Check unlocked ranks for XP bonuses
    earntSeasonPassTrackRewards.forEach(column => {
        rewardsTrack[column].forEach(itemHash => {

            const itemDisplayProperties = itemDefinitions[itemHash].displayProperties;

            if (itemDisplayProperties.name === 'Small Fireteam XP Boost') {
                fireteamBonusXpPercent = fireteamBonusXpPercent + 2;
            }
            else if (itemDisplayProperties.name === 'Small XP Boost') {
                bonusXpPercent = bonusXpPercent + 2;
            };
        });
    });

    // Push results to return object
    returnObject.sharedWisdomBonusValue = fireteamBonusXpPercent;
    returnObject.bonusXpValue = bonusXpPercent + 12; // You get 12% for owning the season
    returnObject.seasonPassLevel = seasonRank;

    // Return the object
    log(returnObject);
    return returnObject;
};



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



// Return season pass level, even when prestige level
// @object {seasonProgressionInfo}, @object {prestigeProgressionSeasonInfo}
export async function ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo) {

    let levelToReturn = 0;
    levelToReturn += seasonProgressionInfo.level;

    // If the season pass level is more than 100
    if (prestigeProgressionSeasonInfo.level !== 0) {
        levelToReturn += prestigeProgressionSeasonInfo.level;
    };
    return levelToReturn;
};



// Load first character on profile
// @object {characters}
export async function LoadPrimaryCharacter(characters) {
    
    CacheReturnItem('lastChar')
        .then(async (data) => {
            
            log(data);
            if (data === undefined) {
                let fallbackCharacter = characters[Object.keys(characters)[0]].classType;
                CacheAuditItem('lastChar', fallbackCharacter);
                await LoadCharacter(fallbackCharacter, characters);
                return;
            };
            await LoadCharacter(data, characters);
        })
        .catch((error) => {
            console.error(error);
        });
};



// Change item in userCache, add if it doesn't exist
// @string {key}, @int {value}
export async function CacheAuditItem(key, value) {

    // Configure userCache if it does not exist
    if (!localStorage.getItem('userCache')) {
        if (value) {
            localStorage.setItem('userCache', JSON.stringify({key: value}));
        }
        else {
            localStorage.setItem('userCache', JSON.stringify({}));
        };
    };

    // Get current userCache and append new key:value pair
    let userCache = JSON.parse(localStorage.getItem('userCache'));
    userCache[key] = value;
    localStorage.setItem('userCache', JSON.stringify(userCache));
};



// Get current userCache and remove specified key:value pair
// @string {key}
export async function CacheRemoveItem(key) {

    let userCache = JSON.parse(localStorage.getItem('userCache'));
    delete userCache[key];
    localStorage.setItem('userCache', JSON.stringify(userCache));
};



// Get current userCache and return specified key:value pair using key
// @string {key}
export async function CacheReturnItem(key) {

    let userCache = JSON.parse(localStorage.getItem('userCache'));
    return userCache[key];
};



// Adds something to the targets' innerHTML
// @string {target}, @string {content}
export function AddValueToElementInner(target, content) {

    // Change target innerHTML
    document.getElementById(`${target}`).innerHTML = content;
};



// DEPRECATED
// Load heuristics and configure data
// @array {charBounties}, @int {propCount}
export async function CreateFilters(charBounties, propCount) {

    let filtersObj = {},
        filtersArray = [];


    // Create new object for filter elements
    eventFilters.UpdateFilters({});

    // Create a filter for each prop
    for (let filterName in propCount) {

        if (propCount[filterName] > 1) {

            let filterContainer = document.createElement('div'),
                filterContent = document.createElement('div');

            // Assign id's and classes + change innerHTML
            filterContainer.className = 'filter';
            filterContainer.id = `filter_${filterName}${propCount[filterName]}`;

            filterContent.className = 'propName';
            filterContent.id = `propName_${filterName}${propCount[filterName]}`;
            filterContent.innerHTML = `${CapitilizeFirstLetter(filterName)} (${propCount[filterName]})`;

            // Add filter to eventFilters
            eventFilters.filterDivs[`propName_${filterName}${propCount[filterName]}`] = {};
            eventFilters.filterDivs[`propName_${filterName}${propCount[filterName]}`].element = filterContent;

            // Append children elements to respective parent elements
            // document.querySelector('#filters').appendChild(filterContainer);
            // document.querySelector(`#filter_${filterName}${propCount[filterName]}`).appendChild(filterContent);
            filtersObj[`${filterName}_${propCount[filterName]}`] = {};
            filtersObj[`${filterName}_${propCount[filterName]}`].container = filterContainer;
            filtersObj[`${filterName}_${propCount[filterName]}`].content = filterContent;
            filtersArray.push(`${filterName}_${propCount[filterName]}`);

            // Show bounties as per filter
            filterContainer.addEventListener('click', () => {
                charBounties.forEach(bounty => {

                    // Check if the current bounty in the loop has the selected filter present in .props
                    if (!bounty.props.includes(filterName)) {

                        // Change bounty elements to 50% transparency
                        document.getElementById(`${bounty.hash}`).style.opacity = '50%';
                        document.getElementById(`item_${bounty.hash}`).style.opacity = '50%';

                        // Change selected filter to white
                        log(filterName, propCount[filterName])
                        document.getElementById(`propName_${filterName}${propCount[filterName]}`).style.color = 'rgb(224, 224, 224)';

                        if (!eventFilters.grayedOutBounties) {
                            eventFilters.grayedOutBounties = [];
                            eventFilters.grayedOutBounties.push(bounty.hash);
                        }
                        else if (!eventFilters.grayedOutBounties.includes(bounty.hash)) {
                            eventFilters.grayedOutBounties.push(bounty.hash);
                        };
                    }
                    else {

                        // Change selected filter to white anyways
                        // In this situation the filter corresponds to all the bounties that are present, 
                        // so selecting one of these filters wont make a difference
                        document.getElementById(`propName_${filterName}${propCount[filterName]}`).style.color = 'rgb(224, 224, 224)';
                    }
                });
            });
        };
    };

    // Sort filtersArray by the amount of relating bounties the current filter has
    filtersArray.sort((a, b) => {

        let firstKey = parseInt(a.split('_')[1]),
            secondKey = parseInt(b.split('_')[1]);
        
        if (firstKey > secondKey) {
            return -1;
        }
        else {
            return 1;
        };
    });
    
    // Push filter elements to the page now that they are sorted
    for (let filter of filtersArray) {
        
        let filterID = `${filter.split('_')[0]}${filter.split('_')[1]}`;
        document.querySelector('#filters').appendChild(filtersObj[filter].container);
        document.querySelector(`#filter_${filterID}`).appendChild(filtersObj[filter].content);
    };
};



// Generate a random string with defined length
// @int {len}
export function GenerateRandomString(len) {
    let result = ' ',
        characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};



// Turn property name into a readable name (without the spaces)
// @string {propertyName}
export function parsePropertyNameIntoWord(propertyName) {

    let subStrings = propertyName.match(/[A-Z][a-z]+/g),
        word = '';

    if (!subStrings) {
        return propertyName;
    };

    for (const d in subStrings) {
        
        if (!word) {
            word += `${subStrings[d]}`;
        }
        else {
            word += ` ${subStrings[d]}`;
        };
    };

    return word;
};



// Find permutations of bounties
// [ DEPRECATED ]
async function FindBountyPermutations(charBounties) {

    const propertyCategories = {
        Destination: Destination,
        ActivityMode: ActivityMode,
        DamageType: DamageType,
        ItemCategory: ItemCategory,
        AmmoType: AmmoType,
        KillType: KillType
    };

    var categorized = {
        Destination: [],
        ActivityMode: [],
        DamageType: [],
        ItemCategory: [],
        AmmoType: [],
        KillType: []
    };

    var highestPropertyInEachCategory = {
        Destination: {
            propertyName: '',
            propertyCount: 0
        },
        ActivityMode: {
            propertyName: '',
            propertyCount: 0
        },
        DamageType: {
            propertyName: '',
            propertyCount: 0
        },
        ItemCategory: {
            propertyName: '',
            propertyCount: 0
        },
        AmmoType: {
            propertyName: '',
            propertyCount: 0
        },
        KillType: {
            propertyName: '',
            propertyCount: 0
        }
    };

    var permutedPropertiesByCategory = {
        Destination: {},
        ActivityMode: {},
        DamageType: {},
        ItemCategory: {},
        AmmoType: {},
        KillType: {}
    };


    // Determine what category a specified property is in
    function determineCategory(propertyName) {
        for (const category in propertyCategories) {
            if (propertyCategories[category].includes(propertyName)) {
                return category;
            };
        };
    };


    // Sort each property into categories
    for (const prp in bountyPropertiesCount) {
        
        for (const ctg in propertyCategories) {

            // Filter properties by category and find the highest count for each property
            if (propertyCategories[ctg].includes(prp)) {

                categorized[ctg].push(prp);
                // log(propertyCategories[ctg], ctg, prp);

                let highestPropertyCategory = highestPropertyInEachCategory[ctg];
                if (highestPropertyCategory.propertyCount < bountyPropertiesCount[prp]) {
                    highestPropertyCategory.propertyName = prp;
                    highestPropertyCategory.propertyCount = bountyPropertiesCount[prp];
                };

                // Percentage of bounties that have this property
                permutedPropertiesByCategory[ctg][prp] = Math.round((bountyPropertiesCount[prp] / charBounties.length) * 100);
            };
        };
    };

    // Turn our object into an array so we can sort it
    log(permutedPropertiesByCategory);
    let propertyNamesByPercentage = [];
    for (var ctg in permutedPropertiesByCategory) {
        for (var prp in permutedPropertiesByCategory[ctg]) {
            propertyNamesByPercentage.push([prp, permutedPropertiesByCategory[ctg][prp]]);
        };
    };

    // Sort the array by the percentage of bounties that have this property in descending order
    propertyNamesByPercentage.sort((a,b) => b[1] - a[1]);
    log(permutedPropertiesByCategory);

    // Check if name fields are going to contain anything
    for (const ctg in permutedPropertiesByCategory) {

        // if there are properties in this category then show add the name field data
        if (Object.keys(permutedPropertiesByCategory[ctg]).length !== 0) {

            // Field data object
            let fieldData = {};

            // Clear innerHTML of specified element
            document.getElementById(`ctg${ctg}`).innerHTML = '';
            document.getElementById(`ctg${ctg}`).style.fontStyle = 'normal';

            // Push the sorted properties to the DOM
            for (const keyValueArray of propertyNamesByPercentage) {
                
                const percent = keyValueArray[1],
                      propertyName = keyValueArray[0];

                log(determineCategory(keyValueArray[0]));

                var percentageFieldToChange = document.getElementById(`percentage${propertyName}`);
                if (percentageFieldToChange) {
                    percentageFieldToChange.innerHTML = `${percent}%`;
                };

                // document.getElementById(`ctg${determineCategory(keyValueArray[0])}`).innerHTML += `${propertyName} (${percent}%) `;
            };

            // Push all the percentages to the HTML
            for (const ctg in permutedPropertiesByCategory) {
                log('first');
                for (const propertyName in permutedPropertiesByCategory[ctg]) {
                    log('second');
                    document.getElementById(`ctg${ctg}`).innerHTML += `${propertyName} (${permutedPropertiesByCategory[ctg][propertyName]}%) `;
                };
            };
        };
    };

    // Push CurrentlyAddedVendors to the popup menu
    for (const item in CurrentlyAddedVendors) {
        
        let newListItem = document.createElement('li');

        newListItem.innerHTML = item;
        document.getElementById('vendorsList').appendChild(newListItem);
    };
};



// Find percentages between properties of progression items
export function CountProgressionItemProperties(charBounties, seasonalChallenges, options) {

    // -- options allows user options to be passed in
    // like: excluding certain properties from the search, or only searching for bounty properties


    // Track how many times each property appears in progression items
    let progressionPropertiesCount = {};

    // Loop over character bounties
    charBounties.forEach(bounty => {
        
        // Loop over bounty properties
        bounty.props.forEach(prop => {
            if (allProgressionProperties.includes(prop)) {
                progressionPropertiesCount[prop] = progressionPropertiesCount[prop] ? progressionPropertiesCount[prop] + 1 : 1;
            };
        });
    });

    // Loop over seasonal challenges
    seasonalChallenges.forEach(challenge => {
            
        // Loop over challenge properties
        challenge.props.forEach(prop => {
            if (allProgressionProperties.includes(prop)) {
                progressionPropertiesCount[prop] = progressionPropertiesCount[prop] ? progressionPropertiesCount[prop] + 1 : 1;
            };
        });
    });


    // Convert progressionPropertiesCount values into percentages
    let progressionPropertiesPercentages = {};

    for (const prop in progressionPropertiesCount) {
        progressionPropertiesPercentages[prop] = Math.round((progressionPropertiesCount[prop] / (charBounties.length + seasonalChallenges.length)) * 100);
    };

    // Sort progressionPropertiesPercentages by percentage in descending order
    progressionPropertiesPercentages.sort((a,b) => b[1] - a[1]);
    log(progressionPropertiesPercentages);
};



// Replace string variables
// @str {string}
export function replaceStringVariables(descriptor) {
    
    let variableId = (descriptor.split('{')[1].split('}')[0]).split(':')[1];
    let indexOfVariable = [descriptor.indexOf(`{`), descriptor.indexOf('}')];
    let variableSubString = descriptor.substring(indexOfVariable[0], indexOfVariable[1] + 1);

    // Check the profile and character context for string variable
    let variableValue;
    let currentCharId;

    CacheReturnItem('currentChar')
    .then((char) => {
        currentCharId = char.characterId;
    });

    if (destinyUserProfile.profileStringVariables.data.integerValuesByHash[variableId]) {
        variableValue = destinyUserProfile.profileStringVariables.data.integerValuesByHash[variableId];
    }
    else {
        variableValue = destinyUserProfile.characterStringVariables.data[currentCharId].integerValuesByHash[variableId];
    };

    // Replace the variable with the string value
    log(descriptor.replace(variableSubString, variableValue));
    return descriptor.replace(variableSubString, variableValue);
};



// String match progressions via displayProperties (pending for refactor and optimization)
// @obj {progressionItem}
export function stringMatchProgressionItem(progressionItem) {

    // Wildcard searches for properties that have other naming conventions/aliases
    const propertyAliases = {
        'Submachine Gun': 'SMG',
        'Season Of The Seraph': `${parsePropertyNameIntoWord(ActivityMode[29])}`
    };

    // ProgressionItems' displayProperties
    let progressionDescriptor = progressionItem.displayProperties.description,
        matchedProperties = [];
    
    // Loop over allProgressionProperties to match against the item description
    for (let property of allProgressionProperties) {
        
        // Find booleans
        let isPropertyAlias = progressionDescriptor.includes(propertyAliases[property]);
        let isPropertyMatch = progressionDescriptor.toLowerCase().includes(property.toLowerCase());

        // Includes property, is alias of property
        if (isPropertyAlias || isPropertyMatch) {

            // If property is alias, change to *my* standard name
            if (propertyAliases[property]) {
                property = propertyAliases[property];
            };

            // If property exists in matchedProperties
            if (!matchedProperties.some(matchedProperty => matchedProperty.includes(property))) {
                matchedProperties.push(property);
            };
        };
    };

    // String match the description against allProgressionProperties
    // allProgressionProperties.forEach(property => {

    //     // If the description includes the property name, or the property name is an alias of the property
    //     // For example, SMG is an alias of Submachine Gun
    //     if (progressionDescriptor.toLowerCase().includes(property.toLowerCase()) || progressionDescriptor.includes(propertyAliases[property])) {

    //         if (propertyAliases[property]) {
    //             property = propertyAliases[property];
    //         };

    //         // If the property exists in matchedProperties, as a substring
    //         if (!matchedProperties.some(matchedProperty => matchedProperty.includes(property))) {
    //             matchedProperties.push(property);
    //         };
    //     };
    // });

    // Return matched properties
    return matchedProperties;
};



// Function to fetch all progressional items
export async function ParseProgressionalItems(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp) {

    let returnObj = {
        charBounties: [],
        challenges: []
    };

    // Call function to get progressions for season pass XP and bonus stats
    const seasonPassProgressionStats = await ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack);

    // Season Pass innerHTML changes
    // AddValueToElementInner('seasonPassXpToNextRank', InsertSeperators(seasonPassProgressionStats.progressToNextLevel));
    // AddValueToElementInner('seasonPassXpToMaxRank', InsertSeperators(seasonPassProgressionStats.xpToMaxSeasonPassRank));
    // AddValueToElementInner('seasonPassFireteamBonus', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
    // AddValueToElementInner('seasonPassRankLevel', seasonPassProgressionStats.seasonPassLevel);
    // AddValueToElementInner('seasonPassXpBonus', `${seasonPassProgressionStats.bonusXpValue}%`); // +12 for bonus large xp modifier

    // // Pass in stats for the net breakdown section
    // AddValueToElementInner('sharedWisdomValue', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
    // AddValueToElementInner('ghostModValue', `${ghostModBonusXp}%`);
    // AddValueToElementInner('bonusXpValue', `${seasonPassProgressionStats.bonusXpValue}%`);


    // [ -- SEASONAL CHALLENGES -- ]
    // Clear HTML fields
    const filterToMakeCheckmarkGreen = 'invert(70%) sepia(96%) saturate(4644%) hue-rotate(84deg) brightness(126%) contrast(117%)',
          filterToResetCheckmark = 'invert(100%) brightness(50%)';

    document.getElementById('seasonPassBonusField').innerHTML = '--';
    document.getElementById('sharedWisdomBonusField').innerHTML = '--';
    document.getElementById('wellRestedBonusField').innerHTML = '--';
    document.getElementById('ghostModBonusField').innerHTML = '--';

    document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToResetCheckmark;

    // Get all seasonal challenges
    let allSeasonalChallenges = await ParseSeasonalChallenges(2809059433, seasonDefinitions, recordDefinitions, presentationNodeDefinitions, null);
    returnObj.challenges = allSeasonalChallenges; // Add to return object
    log('Seasonal Challenges:', allSeasonalChallenges);

    // Parse seasonal challenges into corresponding objects
    let completedChallenges = {},
        notCompletedChallenges = {},
        allSeasonalChallengesAndTheirDivs = {};

    for (const recordHash in characterRecords) {

        const objectives = characterRecords[recordHash].objectives;
        if (objectives && objectives.length > 0) {

            if (objectives.every((objective) => objective.complete)) {
                completedChallenges[recordHash] = {};
                completedChallenges[recordHash].displayProperties = recordDefinitions[recordHash].displayProperties;
                completedChallenges[recordHash].objectives = objectives;
            }
            else {
                notCompletedChallenges[recordHash] = {};
                notCompletedChallenges[recordHash].displayProperties = recordDefinitions[recordHash].displayProperties;
                notCompletedChallenges[recordHash].objectives = objectives;
            };
        };
    };


    // Create HTML elements for seasonal challenges
    for (const challengeHash in allSeasonalChallenges) {

        // Create HTML element for challenge
        let challengeContainer = document.createElement('div'),
            challengeIcon = document.createElement('img'),
            challengeName = document.createElement('div'),
            challengeBreakline = document.createElement('hr'),
            challengeDescription = document.createElement('div'),
            challengeProgressContainer = document.createElement('div'),
            challengeProgressTrack = document.createElement('div'),
            challengeProgressPercentBar = document.createElement('div');

        // Set attributes for challenge container
        challengeContainer.className = 'challengeContainer';
        challengeContainer.id = `${challengeHash}`;
        challengeIcon.className = 'challengeIcon';
        challengeName.className = 'challengeName';
        challengeBreakline.className = 'challengeBreakline';
        challengeDescription.className = 'challengeDescription';
        challengeProgressContainer.className = 'challengeProgressContainer';
        challengeProgressTrack.className = 'challengeProgressTrack';
        challengeProgressPercentBar.className = 'challengeProgressPercentBar';

        // Set attributes for content
        challengeDescription.innerHTML = allSeasonalChallenges[challengeHash].displayProperties.description;
        challengeName.innerHTML = allSeasonalChallenges[challengeHash].displayProperties.name;
        challengeIcon.src = `https://www.bungie.net${allSeasonalChallenges[challengeHash].displayProperties.icon}`;
        challengeContainer.style.userSelect = 'none';

        // Check if challenge is completed
        if (completedChallenges[challengeHash]) {
            challengeContainer.style.border = '1px solid #b39a36';
        };

        // Append all the content together
        challengeProgressContainer.appendChild(challengeProgressTrack);
        challengeProgressContainer.appendChild(challengeProgressPercentBar);
        challengeContainer.appendChild(challengeIcon);
        challengeContainer.appendChild(challengeName);
        challengeContainer.appendChild(challengeBreakline);
        challengeContainer.appendChild(challengeDescription);
        challengeContainer.appendChild(challengeProgressContainer);

        // Store the challenge and its div
        allSeasonalChallengesAndTheirDivs[challengeHash] = {};
        allSeasonalChallengesAndTheirDivs[challengeHash].container = challengeContainer;
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge = allSeasonalChallenges[challengeHash];

        // Append objectives to the challenge
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives = [];

        if (notCompletedChallenges[challengeHash] || completedChallenges[challengeHash]) {

            let challengeObjectives;

            // Parse non-completed objectives
            if (Object.keys(notCompletedChallenges).includes(challengeHash)) {

                challengeObjectives = notCompletedChallenges[challengeHash].objectives;
                for (const objective in challengeObjectives) {
                    allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(notCompletedChallenges[challengeHash].objectives[objective]);
                };
            };

            // Parse completed objectives
            if (Object.keys(completedChallenges).includes(challengeHash)) {

                challengeObjectives = completedChallenges[challengeHash].objectives;
                for (const objective in challengeObjectives) {
                    allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(completedChallenges[challengeHash].objectives[objective]);
                };
            };
        };

        // Check if the challenge is completed, set isComplete to true in guard statement, otherwise false by default
        // This is to make it easier to check if the challenge is complete, as opposed to comparing with completedChallenges
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = false;
        if (completedChallenges[challengeHash]) {
            allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = true;
        };

        // Sort challenge completion progress as a percentage of the total completion value
        let challengeObjectiveProgressTotal = 0,
            challengeObjectiveCompletionTotal = 0,
            challengeObjectives = allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives;

        for (const objective of challengeObjectives) {
            challengeObjectiveProgressTotal += objective.progress;
            challengeObjectiveCompletionTotal += objective.completionValue;
        };

        // Calculate progress as a percentage, if objective is "0/1" then it is a boolean, 
        // so set progress to 0% (if not complete) or 100% (if complete)
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage = (challengeObjectiveProgressTotal / challengeObjectiveCompletionTotal) * 100;

        // Change width of challengeProgressPercentBar based on completion percentage
        if (allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage >= 100) {
            challengeProgressPercentBar.style.width = '100%';
        }
        else {
            challengeProgressPercentBar.style.width = `${allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage}%`;
        };
    };

    // Sort challenges by completion percentage, in ascending order
    let sortedChallenges = Object.values(allSeasonalChallengesAndTheirDivs).sort((a, b) => a.challenge.completionPercentage - b.challenge.completionPercentage);
    log(Object.entries(sortedChallenges));

    // Slice the array of challenges into chunks of 6
    let chunkedChallenges = [];
    for (let i=0; i<Object.keys(sortedChallenges).length; i+=6) {
        chunkedChallenges.push(sortedChallenges.slice(i, i+6));
    };

    // Create HTML elements for each chunk of challenges
    for (let i=0; i<chunkedChallenges.length; i++) {
        
        // Create container thath olds the current chunk of 6 challenges
        let chunkContainer = document.createElement('div');
        chunkContainer.className = 'chunkPage';
        chunkContainer.id = `challengeChunk${i}`;
        
        // If it's the first iteration then, show the container, otherwise hide it
        if (i === 0) {
            chunkContainer.style.display = 'grid';
        }
        else {
            chunkContainer.style.display = 'none';
        };

        // Append each challenge, from the chunk, to the chunk container
        for (const chunk of chunkedChallenges[i]) {
            chunkContainer.appendChild(chunk.container);
        };

        // Append the chunk container to seasonalChallengeItems
        document.getElementById('seasonalChallengeItems').appendChild(chunkContainer);
    };

    // Push HTML fields for challenges header stats
    document.getElementById('outstandingChallengesAmountField').innerHTML = `${Object.keys(notCompletedChallenges).length}`;
    document.getElementById('completedChallengesAmountField').innerHTML = `${Object.keys(completedChallenges).length}`;
    document.getElementById('challengesAmountField').innerHTML = `${Object.keys(allSeasonalChallenges).length}`;
    // [ -- END OF SEASONAL CHALLENGES -- ]



    // [ -- BOUNTIES -- ]
    // Iterate over CharacterInventories[characterId].items
    let charInventory = CharacterInventories[characterId].items, 
        amountOfBounties = 0;

    // Make array with specified groups
    let bountyArr = {};
    vendorKeys.forEach(key => {
        bountyArr[key] = [];
    });

    // Loop over inventory items and emit bounties
    log('loadCharacter parsing bounties');
    let parsedBountiesResponse = ParseBounties(charInventory, CharacterObjectives, itemDefinitions, objectiveDefinitions);
    let characterBounties = parsedBountiesResponse.charBounties;
    amountOfBounties = parsedBountiesResponse.amountOfBounties;
    returnObj.charBounties = characterBounties; // Add bounties to return object
    log(amountOfBounties, characterBounties);

    if (amountOfBounties < 20) {
        document.getElementById('recommendationTooltip').style.display = 'block';
    };

    // Translate objective hashes to objective strings
    Object.keys(characterBounties).forEach(bounty => {
        
        let objHashes = characterBounties[bounty].objectives.objectiveHashes;
        characterBounties[bounty].objectiveDefinitions = [];

        for (let objHash of objHashes) {
            characterBounties[bounty].objectiveDefinitions.push(objectiveDefinitions[objHash]);
        };
    });

    // Sort bounties by group (vanguard, gunsmith etc)
    bountyArr = SortByGroup(characterBounties, bountyArr, vendorKeys);

    // Sort bounties by type (weekly, daily etc)
    bountyArr = SortByType(bountyArr, SortBountiesByType);

    // Push sorted bounties to the page
    PushToDOM(bountyArr, amountOfBounties, MakeBountyElement);

    // Get statistics for subheadings
    let amountOfExpiredBounties = 0, 
        amountOfCompletedBounties = 0;

    // Count completed and expired bounties
    for (let bounty of characterBounties) {
        if (bounty.isComplete) {
            amountOfCompletedBounties++;
        }
        else if (bounty.isExpired) {
            amountOfExpiredBounties++;
        };
    };

    // Find well rested bonus
    let wellRestedBonus = 1;
    if (seasonProgressionInfo.level === 100) {
        if (prestigeProgressionSeasonInfo.weeklyProgress <= 500_000) {
            document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
            document.getElementById('wellRestedBonusField').innerHTML = `2x`;
            wellRestedBonus = 2;
        }
        else {
            document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
        };
    }
    else if (seasonProgressionInfo.level < 100) {
        if (seasonProgressionInfo.weeklyProgress <= 500_000) {
            document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
            document.getElementById('wellRestedBonusField').innerHTML = `2x`;
            wellRestedBonus = 2;
        }
        else {
            document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
        };
    };
        
    // Check if ghost mods are slotted, turn off checkmark if not
    if (ghostModBonusXp) {
        document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        document.getElementById('ghostModBonusField').innerHTML = `+${ghostModBonusXp}%`;
    }
    else {
        document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToResetCheckmark;
    };

    // Check if shared wisdom is not equal to 0, turn off checkmark if not
    if (seasonPassProgressionStats.sharedWisdomBonusValue) {
        document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        document.getElementById('sharedWisdomBonusField').innerHTML = `+${seasonPassProgressionStats.sharedWisdomBonusValue}%`;
    }
    else {
        document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToResetCheckmark;
    };

    // Check if bonus xp is not equal to 0, turn off checkmark if not
    if (seasonPassProgressionStats.bonusXpValue) {
        document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        document.getElementById('seasonPassBonusField').innerHTML = `+${seasonPassProgressionStats.bonusXpValue}%`;
    }
    else {
        document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToResetCheckmark;
    };

    // Calculate XP yield from (active) bounties
    let totalXpYield = 0;
    let totalXpYieldWithModifiers = 0;
    await CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields)
    .then((xpYield) => {
        totalXpYield = xpYield;
    })
    .catch((err) => {
        console.error(err);
    });

    // Format to 1.n
    // XP modifier, does not contain well rested bonus
    const xpModifier = (((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp) * wellRestedBonus) / 100) + 1;
    log(xpModifier, wellRestedBonus);
    
    // Subtract the difference between current weekly progress to the end of the well rested bonus
    if (((totalXpYield * xpModifier) * 2) > (500_000 - seasonPassProgressionStats.weeklyProgress)) {

        log('Well-Rested Surpassed');

        // Ignore well rested bonus
        const xpModifier = (((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp)) / 100) + 1;

        log([totalXpYield, xpModifier, (totalXpYield * xpModifier), (500_000 - seasonPassProgressionStats.weeklyProgress), (500_000 - seasonPassProgressionStats.weeklyProgress) / 2]);
        log(`${totalXpYield} * ${xpModifier} + ((500_000 - ${seasonPassProgressionStats.weeklyProgress}) / 2)`);

        // Calculate XP yield where well rested bonus has no more overhead; will not be used on the overhead calculation
        totalXpYieldWithModifiers = (totalXpYield * xpModifier) + ((500_000 - seasonPassProgressionStats.weeklyProgress) / 2);
        log(totalXpYieldWithModifiers);
    }
    else {
        log('well rested bonus not surpassed');
        totalXpYieldWithModifiers = totalXpYield * xpModifier;
    };

    // Push subheading statistics
    AddValueToElementInner('bountiesTotalField', amountOfBounties);
    AddValueToElementInner('bountiesExpiredField', amountOfExpiredBounties);
    AddValueToElementInner('bountiesCompletedField', amountOfCompletedBounties);
    AddValueToElementInner('bountiesOutstandingField', amountOfBounties - amountOfCompletedBounties);

    // Check if there are no bounties
    if (amountOfBounties === 0) {

        // Toggle no items tooltip
        document.getElementById('noBountiesTooltip').style.display = 'block';

        // Set raw xp values to 0
        AddValueToElementInner('rawXpField', 0);
        AddValueToElementInner('artifactLevelsField', 0);
        AddValueToElementInner('SeasonPassLevelsField', 0);
        // Set modified xp values to 0
        AddValueToElementInner('xpWithModField', 0);
        AddValueToElementInner('artifactLevelsWithModField', 0);
        AddValueToElementInner('SeasonPassLevelsWithModField', 0);

    }
    else if (amountOfBounties > 0) {

        // Set raw xp values
        AddValueToElementInner('rawXpField', InsertSeperators(totalXpYield));
        AddValueToElementInner('artifactLevelsField', 0);
        AddValueToElementInner('SeasonPassLevelsField', InsertSeperators(totalXpYield / 100_000));
        // Set modified xp values
        AddValueToElementInner('xpWithModField', InsertSeperators(totalXpYieldWithModifiers));
        AddValueToElementInner('artifactLevelsWithModField', 0);
        AddValueToElementInner('SeasonPassLevelsWithModField', InsertSeperators(totalXpYieldWithModifiers / 100_000));
    };
    // [ -- END OF BOUNTIES -- ]

    log('-> ParseProgressionalItems Done');
    return returnObj;
};



// Function to find all the relations between progressional items
export async function ParseProgressionalRelations(progressionalItems) {
    
    let bountyRelations = {},
        challengeRelations = {};

    // Loop through character bounties
    for (let bounty of progressionalItems.charBounties) {
        
        // Loop through props and add to bountyRelations
        bounty.props.forEach((prop) => {

            // Check if prop exists in bountyRelations, if so add 1
            if (bountyRelations[prop]) {
                bountyRelations[prop]++;
            }
            else { // if not create it
                bountyRelations[prop] = 1;
            };

        });
    };

    // Loop through challenges
    // for (let v in progressionalItems.challenges) {
        
    //     let challenge = progressionalItems.challenges[v];
    //     log(challenge);

    //     challenge.props.forEach((prop) => {

    //         // Check if props exists in challengeRelations, if so add 1
    //         if (challengeRelations[prop]) {
    //             challengeRelations[prop]++;
    //         }
    //         else { // if not create it
    //             challengeRelations[prop] = 1;
    //         };

    //     });
    // };
    
    // Remove keys' values that are not more than 1
    bountyRelations = Object.fromEntries(Object.entries(bountyRelations).filter(([key, value]) => value > 1));

    // Sort bountyRelations by value (highest to lowest)
    bountyRelations = Object.entries(bountyRelations).sort((a,b) => b[1] - a[1]);

    log(bountyRelations, challengeRelations);
};