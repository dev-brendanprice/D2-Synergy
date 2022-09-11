import { itemTypeKeys } from "./SynergyDefinitions.js";
import { LoadCharacter, userStruct, homeUrl } from "../user.js";

const log = console.log.bind(console),
      localStorage = window.localStorage,
      sessionStorage = window.sessionStorage;

// Check if state query parameter exists in URL
const VerifyState = async () => {

    var urlParams = new URLSearchParams(window.location.search),
        state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = 'http://localhost:5500/www/';
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};

// Redirect user back to specified url
// @string {url}, @string {param}
const RedirUser = (url, param) => {
    window.location.href = `${url}?${param ? param : ''}`;
};


// Returns corresponding class name using classType
// @int {classType}
const ParseChar = (classType) => {
    var r;
    switch (classType) {
        case 0:
            r='Titan';
            break;
        case 1:
            r='Hunter';
            break;
        case 2:
            r='Warlock';
            break;
        default:
            console.error('Could not parse character, parseChar() @function');
    };
    return r;
};


// Make element for entry data when hash is found in definitions
// @obj {param}
const MakeBountyElement = async (param) => {

    let itemOverlay = document.createElement('div'),
        itemStatus = document.createElement('img'),
        itemTitle = document.createElement('div'),
        itemType = document.createElement('div'),
        itemDesc = document.createElement('div'),
        item = document.createElement('img'),
        hr = document.createElement('hr');


    // Create bottom element
    item.className = `bounty`;
    item.id = `${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
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
    let rootIndex = param.objectiveDefinitions,
        completionCounter = 0;

    for (let indexCount=0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgCounter = document.createElement('div'),
            itemPrgDesc = document.createElement('div');

        // Check if progess string exceeds char limit
        if (rootIndex[indexCount].progressDescription.length >= 24) {

            var rt = rootIndex[indexCount].progressDescription.slice(0, 24);
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
        
        for (let padC=1; padC < rootIndex.length; padC++) { // Seperate objectives

            var offset = paddingStepAmount*indexCount;
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
        itemStatus.src = './assets/icons/pursuitExpired.svg';

        // Change style to represent state
        // document.getElementById(`item_${param.hash}`).className = 'itemContainerExpired';
        document.getElementById(`${param.hash}`).style.border = '1px solid rgba(179,73,73, 0.749)';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.className = `complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './assets/icons/pursuitCompleted.svg';
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
const StartLoad = () => {
    document.getElementById('slider').style.display = 'block';
};


// Stop loading sequence
const StopLoad = () => {
    document.getElementById('slider').style.display = 'none';
};


// Log user out on request
const Logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.deleteDatabase('keyval-store');
    window.location.href = homeUrl;
};


// Insert commas into numbers where applicable
// @int {num}
const InsertSeperators = (num) => {
    return new Intl.NumberFormat().format(num);
};


// Capitalize First letter of string
const CapitilizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


// Sort items into bounties
var ParseBounties = (charInventory, charObjectives, utils) => {

    var charBounties = [],
        amountOfBounties = 0;

    charInventory.forEach(v => {
        let item = utils.definitions[v.itemHash];
        if (item.itemType === 26) {

            // Add objectives to item
            item.progress = [];
            for (let prg of charObjectives[v.itemInstanceId].objectives) {
                item.progress.push(prg);
            };

            // Add other item information
            item.isExpired = new Date(v.expirationDate) < new Date(); 
            item.props = [];

            // Push item to arr
            charBounties.push(item);
            amountOfBounties++;
        };
    });
    return [charBounties, amountOfBounties];
};


// Push bounties to DOM
var PushToDOM = (bountyArr, utils) => {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        if (group.length !== 0) {
            group.forEach(item => {
                utils.MakeBountyElement(item);
                utils.amountOfBounties++;
            });
        };
    });
};


// Sort bounties via vendor group
var SortByGroup = (charBounties, utils) => {

    charBounties.forEach(v => {
        for (let i=1; i < utils.vendorKeys.length; i++) {
            if (utils.vendorKeys.length-1 === i) {
                utils.bountyArr['other'].push(v);
                break;
            }
            else if (utils.vendorKeys.length !== i) {
                if (v.inventory.stackUniqueLabel.includes(utils.vendorKeys[i])) {
                    utils.bountyArr[utils.vendorKeys[i]].push(v);
                    break;
                };
            };
        };
    });
    return utils.bountyArr;
};


// Sort bounties via bounty type
var SortByType = (bountyArr, utils) => {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.sort(utils.sortBountiesByType);
        };
    });
    return bountyArr;
};


// Sorts by index of item in itemTypeKeys
var SortBountiesByType = (a, b) => {

    var stackLabelA = a.inventory.stackUniqueLabel,
        stackLabelB = b.inventory.stackUniqueLabel,
        stackTypeA,
        stackTypeB;
    
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
    if (itemTypeKeys.indexOf(stackTypeA) < itemTypeKeys.indexOf(stackTypeB)){
        return -1;
    };
    if (itemTypeKeys.indexOf(stackTypeA) > itemTypeKeys.indexOf(stackTypeB)){
        return 1;
    };
    return 0;
};


// Calculate total XP gain from (active) bounties
var CalcXpYield = (bountyArr, utils) => {

    var totalXP = 0;
    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        
        if (group.length !== 0) {
            group.forEach(z => {

                for (let i=0; i<utils.itemTypeKeys.length; i++) {

                    let label = z.inventory.stackUniqueLabel;
                    if (label.includes(utils.itemTypeKeys[i])) {

                        if (label.includes('dreaming_city')) {
                            totalXP += utils.petraYields[utils.itemTypeKeys[i]];
                        }
                        else {
                            totalXP += utils.baseYields[utils.itemTypeKeys[i]];
                        };
                        break;
                    };
                };
            });
        };
    });
    return totalXP;
};


// New function for getting XP required for next bright engram
var CalculateXpForNextBrightEngram = async (seasonInfo, prestigeInfo, rewardsTrack) => {

    // Get total season rank
    let seasonRank = seasonInfo.level + prestigeInfo.level;

    // Check if the season pass is higher than level 100 (prestige level)
    if (seasonRank >= 100) { // Prestige

        // Calculate Xp needed for next bright engram based on the current prestige level
        // Here, we are assuming that you get a bright engram every other five levels
        let nextEngramRank = Math.ceil((seasonRank+1)/5)*5;
        return ((nextEngramRank - seasonRank) * 100_000) - prestigeInfo.progressToNextLevel;
    }
    else if (seasonRank < 100) { // Not prestige (less than 100)
        
        // Iterate through rewards track and get every bright engram at their respective levels
        // Here, we are assuming that you get bright engrams relative to the season pass structure, because we are not past level 100
        let splicedRewardsTrack = Object.keys(rewardsTrack).splice(seasonRank),
            engramRanks = [];

        splicedRewardsTrack.forEach(v => {
            rewardsTrack[v].forEach(x => {
                if (x === 1968811824) {
                    engramRanks.push(v);
                };
            });
        });

        let nextEngramRank = engramRanks[0];
        return ((nextEngramRank - seasonRank) * 100_000) - seasonInfo.progressToNextLevel;
    };
};


// Calculate percentage based on first parameter
var CalculatePercentage = async (a, b) => {
    return Math.trunc((100 * a) / b);
};


// Return season pass level, even when prestige level
var ReturnSeasonPassLevel = async (seasonInfo, prestigeSeasonInfo) => {
    
    var levelToReturn = 0;
    levelToReturn += seasonInfo.level;

    // If the season pass level is more than 100
    if (prestigeSeasonInfo.level !== 0) {
        levelToReturn += prestigeSeasonInfo.level;
    };
    return levelToReturn;
};


// Load first character on profile
var LoadPrimaryCharacter = async (characters) => {
    var lastChar = CacheReturnItem('lastChar');
    if (lastChar) { 
        LoadCharacter(lastChar);
    }
    else if (!lastChar) {
        LoadCharacter(characters[Object.keys(characters)[0]].classType);
    };
};


// Wrappers for localStorage userCache
var CacheAuditItem = async (key, value) => {

    // Configure userCache if it does not exist#
    if (!localStorage.getItem('userCache')) { localStorage.setItem('userCache', JSON.stringify({}))};
    
    var userCache = JSON.parse(localStorage.getItem('userCache'));
    userCache[key] = value;
    localStorage.setItem('userCache', JSON.stringify(userCache));
};
var CacheRemoveItem = async (key, value) => {
    var userCache = JSON.parse(localStorage.getItem('userCache'));
    delete userCache[key];
    localStorage.setItem('userCache', JSON.stringify(userCache));
};
var CacheReturnItem = (key, value) => {
    var userCache = JSON.parse(localStorage.getItem('userCache'));
    return userCache[key];
};


// Adds something to the targets' innerHTML
// @string {target}, @string {content}
var AddNumberToElementInner = (target, content) => {

    // Change target innerHTML
    document.getElementById(`${target}`).innerHTML = content;
};


// Load heuristics and configure data
// @array {initArrStr}, @int {propCount}
var CreateFilters = async (initArrStr, propCount) => {

    // Create new object for filter elements
    userStruct['filterDivs'] = {};

    // Create a filter for each prop
    for (let v in propCount) {

        if (propCount[v] > 1) {
            
            let filterContainer = document.createElement('div'),
                  filterContent = document.createElement('div');

            // Assign id's and classes + change innerHTML
            filterContainer.className = 'filter';
            filterContent.className = 'propName';
            filterContainer.id = `filter_${v}${propCount[v]}`;
            filterContent.id = `propName_${v}${propCount[v]}`;
            filterContent.innerHTML = `${CapitilizeFirstLetter(v)} (${propCount[v]})`;

            // Add filter to UserStruct
            userStruct['filterDivs'][`propName_${v}${propCount[v]}`] = {};
            userStruct['filterDivs'][`propName_${v}${propCount[v]}`].element = filterContent;

            // Append children elements to respective parent elements
            document.querySelector('#filters').appendChild(filterContainer);
            document.querySelector(`#filter_${v}${propCount[v]}`).appendChild(filterContent);

            // Show bounties as per filter
            filterContainer.addEventListener('click', () => {
                userStruct[initArrStr].forEach(b => {

                    // Find bounties that match the filter index
                    if (!b.props.includes(v)) {

                        document.getElementById(`${b.hash}`).style.opacity = '50%';
                        document.getElementById(`item_${b.hash}`).style.opacity = '50%';
                        document.getElementById(`propName_${v}${propCount[v]}`).style.color = 'rgb(224, 224, 224)';

                        if (!userStruct['greyOutDivs']) {
                            userStruct['greyOutDivs'] = [];
                            userStruct['greyOutDivs'].push(b.hash);
                        }
                        else if (!userStruct['greyOutDivs'].includes(b.hash)) {
                            userStruct['greyOutDivs'].push(b.hash);
                        };
                    };
                });
            });
        };
    };
};


// Generate a random string with defined length
// @int {len}
var GenerateRandomString = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};



export {
    VerifyState,
    ParseChar,
    Logout,
    StartLoad,
    StopLoad,
    MakeBountyElement,
    RedirUser,
    InsertSeperators,
    CapitilizeFirstLetter,
    ParseBounties,
    PushToDOM,
    SortByGroup,
    SortByType,
    SortBountiesByType,
    CalcXpYield,
    CalculateXpForNextBrightEngram,
    CalculatePercentage,
    ReturnSeasonPassLevel,
    LoadPrimaryCharacter,
    CacheAuditItem,
    CacheRemoveItem,
    CacheReturnItem,
    AddNumberToElementInner,
    CreateFilters,
    GenerateRandomString
};