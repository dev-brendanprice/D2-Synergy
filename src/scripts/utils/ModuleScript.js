import { itemTypeKeys } from "./SynergyDefinitions.js";
import { 
    LoadCharacter,
    itemDisplaySize,
    eventFilters } from "../user.js";

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



// Returns corresponding class name using classType
// @int {classType}
export function ParseChar(classType) {

    let returnCharString;
    switch (classType) {
        case 0:
            returnCharString = 'Titan';
            break;
        case 1:
            returnCharString = 'Hunter';
            break;
        case 2:
            returnCharString = 'Warlock';
            break;
        default:
            console.error('Could not parse character, parseChar() @function');
    };
    return returnCharString;
};



// Make element for entry data when hash is found in itemDefinitions
// @object {param}
export async function MakeBountyElement(param) {

    let itemOverlay = document.createElement('div'), itemStatus = document.createElement('img'), itemTitle = document.createElement('div'), itemType = document.createElement('div'), itemDesc = document.createElement('div'), item = document.createElement('img'), hr = document.createElement('hr');


    // Create bottom element
    item.className = `bounty`;
    item.id = `${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
    item.style.width = `${itemDisplaySize}px`;
    document.querySelector('#bountyItems').appendChild(item);

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    itemOverlay.style.display = 'none';
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

        let itemPrgCounter = document.createElement('div'), itemPrgDesc = document.createElement('div');

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

        // Calculate the nth term for seperating objectives
        let paddingStepAmount = 40 / (rootIndex.length) === Infinity ? (0) : (40 / (rootIndex.length));
        itemPrgCounter.style.paddingBottom = '21px';
        itemPrgDesc.style.paddingBottom = '20px';

        for (let padC = 1; padC < rootIndex.length; padC++) { // Seperate objectives

            let offset = paddingStepAmount * indexCount;
            if (offset !== 0) {
                itemPrgCounter.style.paddingBottom = `${parseInt(itemPrgCounter.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
                itemPrgDesc.style.paddingBottom = `${parseInt(itemPrgDesc.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
            };
        };
    };

    // Mark item as complete
    if (param.progress.length === completionCounter) {
        param.areObjectivesComplete = true;

        // Change style to represent state
        document.getElementById(`item_${param.hash}`).className = 'itemContainerComplete'; // ?
        document.getElementById(`${param.hash}`).style.border = '1px solid rgba(182,137,67, 0.749)';
    }
    else if (param.progress.length !== completionCounter) {
        param.areObjectivesComplete = false;
    };

    // Mark item as expired
    if (param.isExpired && !param.areObjectivesComplete) {
        itemStatus.className = `expire`;
        itemStatus.id = `expire_${param.hash}`;
        itemStatus.src = './ico/pursuit_expired.svg';

        // Change style to represent state
        // document.getElementById(`item_${param.hash}`).className = 'itemContainerExpired';
        document.getElementById(`${param.hash}`).style.border = '1px solid rgba(179,73,73, 0.749)';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.className = `complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './ico/pursuit_expired.svg';
    };
    document.querySelector(`#bountyItems`).append(itemStatus);

    // Watch for mouse events
    item.addEventListener('mousemove', (e) => {
        let el = itemOverlay.style;
        el.display = 'inline-block';
        el.left = `${e.pageX}px`;
        el.top = `${e.pageY}px`;
    });

    item.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};



// Start loading sequence
export function StartLoad() {

    // Add loading bar
    document.getElementById('slider').style.display = 'block';

    // Add load content
    document.getElementById('loadingContentContainer').style.display = 'block';
};



// Stop loading sequence
export function StopLoad() {

    // Remove loading bar
    document.getElementById('slider').style.display = 'none';

    // Use mobile layout for content
    document.getElementById('loadingContentContainer').style.display = 'none';
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

    charInventory.forEach(v => {

        let item = itemDefinitions[v.itemHash];

        if (item.itemType === 26) {

            // Add objectives to item
            item.progress = [];
            for (let prg of charObjectives[v.itemInstanceId].objectives) {
                item.progress.push(prg);
            };

            // Add isExpired property
            item.isExpired = new Date(v.expirationDate) < new Date();
            item.props = [];

            // Add isComplete property
            let entriesAmount = item.progress.length, entriesCount = 0;

            for (let progressEntry of item.progress) {
                if (progressEntry.complete) {
                    entriesCount++;
                };
            };

            // Set to true otherwise false by default
            item.isComplete = false;
            if (entriesAmount === entriesCount) {
                item.isComplete = true;
            };

            // Push item to arr
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

    let stackLabelA = a.inventory.stackUniqueLabel, stackLabelB = b.inventory.stackUniqueLabel, stackTypeA, stackTypeB;

    // Remove numbers & get key names from stackUniqueLabel even if it contains _
    stackLabelA.split('.').forEach(v => {
        let keyFromStack = v.replace(/[0-9]/g, '');
        keyFromStack.includes('_') ? keyFromStack.split('_').forEach(x => itemTypeKeys.includes(x) ? stackTypeA = x : null) : itemTypeKeys.includes(v.replace(/[0-9]/g, '')) ? stackTypeA = v.replace(/[0-9]/g, '') : null;
    });
    stackLabelB.split('.').forEach(v => {
        let keyFromStack = v.replace(/[0-9]/g, '');
        keyFromStack.includes('_') ? keyFromStack.split('_').forEach(x => itemTypeKeys.includes(x) ? stackTypeB = x : null) : itemTypeKeys.includes(v.replace(/[0-9]/g, '')) ? stackTypeB = v.replace(/[0-9]/g, '') : null;
    });

    // Sort items by returning index
    if (itemTypeKeys.indexOf(stackTypeA) < itemTypeKeys.indexOf(stackTypeB)) {
        return -1;
    };
    if (itemTypeKeys.indexOf(stackTypeA) > itemTypeKeys.indexOf(stackTypeB)) {
        return 1;
    };
    return 0;
};



// Calculate total XP gain from (active) bounties
// @array {bountyArr}, @array {itemTypeKeys}, @object {baseYields}, @object {petraYields}
export function CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields) {

    let totalXP = 0;
    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.forEach(z => {

                for (let i = 0; i < itemTypeKeys.length; i++) {

                    let label = z.inventory.stackUniqueLabel;
                    if (label.includes(itemTypeKeys[i])) {

                        if (label.includes('dreaming_city')) {
                            totalXP += petraYields[itemTypeKeys[i]];
                        }
                        else {
                            totalXP += baseYields[itemTypeKeys[i]];
                        };
                        break;
                    };
                };
            });
        };
    });
    return totalXP;
};



// Return season pass progressional statistics
// @object {seasonProgressionInfo}, @object {prestigeInfo}, @object {rewardsTrack}, @object {itemDefinitions}
export async function ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeInfo, rewardsTrack, itemDefinitions) {

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
    }
    else {

        // returnObject keys when over 100
        returnObject.progressToNextLevel = prestigeInfo.progressToNextLevel;
        returnObject.xpToMaxSeasonPassRank = 0;

        // Hide if rank is 100+
        document.getElementById('seasonPassSecondContainer').style.display = 'none';
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
        if (!data) {
            CacheAuditItem('lastChar', characters[Object.keys(characters)[0]].classType);
            await LoadCharacter(characters[Object.keys(characters)[0]].classType);
        }
        else {
            await LoadCharacter(data);
        };
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
export function AddNumberToElementInner(target, content) {

    // Change target innerHTML
    document.getElementById(`${target}`).innerHTML = content;
};



// Load heuristics and configure data
// @array {charBounties}, @int {propCount}
export async function CreateFilters(charBounties, propCount) {

    // Create new object for filter elements
    eventFilters.UpdateFilters({});

    // Create a filter for each prop
    for (let v in propCount) {

        if (propCount[v] > 1) {

            let filterContainer = document.createElement('div'), filterContent = document.createElement('div');

            // Assign id's and classes + change innerHTML
            filterContainer.className = 'filter';
            filterContent.className = 'propName';
            filterContainer.id = `filter_${v}${propCount[v]}`;
            filterContent.id = `propName_${v}${propCount[v]}`;
            filterContent.innerHTML = `${CapitilizeFirstLetter(v)} (${propCount[v]})`;

            // Add filter to eventFilters
            eventFilters.filterDivs[`propName_${v}${propCount[v]}`] = {};
            eventFilters.filterDivs[`propName_${v}${propCount[v]}`].element = filterContent;

            // Append children elements to respective parent elements
            document.querySelector('#filters').appendChild(filterContainer);
            document.querySelector(`#filter_${v}${propCount[v]}`).appendChild(filterContent);

            // Show bounties as per filter
            filterContainer.addEventListener('click', () => {
                charBounties.forEach(b => {

                    // Find bounties that match the filter index
                    if (!b.props.includes(v)) {

                        document.getElementById(`${b.hash}`).style.opacity = '50%';
                        document.getElementById(`item_${b.hash}`).style.opacity = '50%';
                        document.getElementById(`propName_${v}${propCount[v]}`).style.color = 'rgb(224, 224, 224)';

                        if (!eventFilters.grayedOutBounties) {
                            eventFilters.grayedOutBounties = [];
                            eventFilters.grayedOutBounties.push(b.hash);
                        }
                        else if (!eventFilters.grayedOutBounties.includes(b.hash)) {
                            eventFilters.grayedOutBounties.push(b.hash);
                        };
                    };
                });
            });
        };
    };
};



// Generate a random string with defined length
// @int {len}
export function GenerateRandomString(len) {
    let result = ' ';
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};
