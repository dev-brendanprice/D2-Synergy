const log = console.log.bind(console);

// Check if state query parameter exists in URL
const VerifyState = async () => {

    var urlParams = new URLSearchParams(window.location.search),
        state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = `https://synergy.brendanprice.xyz`;
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
            console.error('could not parse character, parseChar() @function');
    };
    return r;
};


// Make element for entry data when hash is found in definitions
// @obj {param}
const MakeBountyElement = (param) => {
    
    const itemPrgContainer = document.createElement('div'),
        itemOverlay = document.createElement('div'),
        itemTitle = document.createElement('div'),
        itemType = document.createElement('div'),
        itemDesc = document.createElement('div'),
        hr = document.createElement('hr'),
        item = document.createElement('img');



    // Create bottom element
    item.className = `bounty`;
    item.id = `${param.hash}`;
    document.querySelector('#bountyItems').appendChild(item);
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Prop content of item
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;
    itemDesc.innerHTML = param.displayProperties.description;

    // Create item progress and push to DOM
    let rootIndex = param.objectiveDefinitions;
    for (let indexCount=0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgCounter = document.createElement('div'),
            itemPrgDesc = document.createElement('div');

        itemPrgCounter.className = 'itemPrgCounter';
        itemPrgDesc.className = 'itemPrgDesc';
        itemPrgCounter.id = `prgCounter_${rootIndex[indexCount].hash}`;
        itemPrgDesc.id = `prgDesc_${rootIndex[indexCount].hash}`;
        itemPrgDesc.innerHTML = rootIndex[indexCount].progressDescription;
        itemPrgCounter.innerHTML = `${rootIndex[indexCount].completionValue === 100 ? `${(rootIndex[indexCount].unlockValueHash / 100) * 100}%` : `${rootIndex[indexCount].unlockValueHash}/${rootIndex[indexCount].completionValue}`}`;

        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgCounter);
        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgDesc);

        // Calculate the nth term for seperating objectives
        let paddingStepAmount = 40 / (rootIndex.length) === Infinity ? (0) : (40 / (rootIndex.length));
        itemPrgCounter.style.paddingBottom = '21px';
        itemPrgDesc.style.paddingBottom = '20px';
        
        for (let padC=1; padC < rootIndex.length; padC++) { // Seperate objectives

            var offset = paddingStepAmount*indexCount;
            if (offset!==0) {
                itemPrgCounter.style.paddingBottom = `${parseInt(itemPrgCounter.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
                itemPrgDesc.style.paddingBottom = `${parseInt(itemPrgDesc.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
            };
        };
    };

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).appendChild(itemTitle);
    document.querySelector(`#item_${param.hash}`).appendChild(itemType);
    document.querySelector(`#item_${param.hash}`).appendChild(hr);
    document.querySelector(`#item_${param.hash}`).appendChild(itemDesc);
    
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
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.location.href = `https://synergy.brendanprice.xyz`;
};


// Seperate numbers using commas
// @int {num}
const InsertSeperators = (num) => {
    return `${num}`.split()[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


// Capitalize First letter of string
const CapitilizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


// Sort items into bounties
var ParseBounties = (charInventory, utils) => {

    var charBounties = [],
        amountOfBounties = 0;

    charInventory.forEach(v => {
        let item = utils.definitions[v.itemHash];
        if (item.itemType === 26) {
            item.props = [];
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
    CalcXpYield
};