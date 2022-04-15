console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

// Import modules
import { ValidateManifest, ReturnEntry } from './utils/ValidateManifest.js';
import {
    VerifyState,
    ParseChar,
    Logout,
    StartLoad,
    StopLoad,
    MakeBountyElement,
    RedirUser,
    InsertSeperators,
    CapitilizeFirstLetter } from './utils/ModuleScript.js';
import {
    itemTypeKeys,
    vendorKeys,
    baseYields,
    petraYields } from "./utils/SynergyDefinitions.js";
import { propCount, bin, PushProps } from "./utils/MatchProps.js";



// Verify state before anything else
VerifyState();

// Explicit globals
var log = console.log.bind(console),
    startTime = new Date(),
    localStorage = window.localStorage,
    sessionStorage = window.sessionStorage,
    destinyMemberships = {},
    destinyUserProfile = {},
    membershipType,
    characters,
    urlParams = new URLSearchParams(window.location.search), // Declare URLSearchParams
    homeUrl = `http://localhost/D2-Synergy/www/`,
    userStruct = {},
    axiosHeaders = {
        ApiKey: '12a18fbb685a4a90bace718395c81ca8',
        Authorization: 'NDAwMjQ6SnNnQms0UU5JUGtWMXlXY0MzZUpPZGxCRmsyVzhnU0J0UFZITVgwcTFvWQ=='
    };


// Set default axios header
axios.defaults.headers.common = {
    "X-API-Key": `${axiosHeaders.ApiKey}`
};





// Authorize with Bungie.net
var BungieOAuth = async (authCode) => {

    var AccessToken = {},
        RefreshToken = {},
        components = {},
        AuthConfig = {
            headers: {
                Authorization: `Basic ${axiosHeaders.Authorization}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };

    // Authorize user and get credentials (first time sign-on (usually))
    await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${authCode}`, AuthConfig)
        .then(res => {
            var data = res.data;

            components['membership_id'] = data['membership_id'];
            components['token_type'] = data['token_type'];
            components['authorization_code'] = authCode;

            AccessToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
            AccessToken['expires_in'] = data['expires_in'];
            AccessToken['value'] = data['access_token'];

            RefreshToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
            RefreshToken['expires_in'] = data['refresh_expires_in'];
            RefreshToken['value'] = data['refresh_token'];

            localStorage.setItem('accessToken', JSON.stringify(AccessToken));
            localStorage.setItem('components', JSON.stringify(components));
            localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));

            log('-> Authorized with Bungie.net!');
        })
        .catch(err => {
            if (err.response.data['error_description'] == 'AuthorizationCodeInvalid' || err.response.data['error_description'] == 'AuthorizationCodeStale') {
                window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
            }
            else {
                console.error(err);
            };
        });
};


// Check tokens for expiration
var CheckComponents = async (bool) => {
    
    var acToken = JSON.parse(localStorage.getItem('accessToken')),
        rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        RefreshToken = {},
        AccessToken = {},
        components = {},
        AuthConfig = {
            headers: {
                Authorization: `Basic ${axiosHeaders.Authorization}`,
                "Content-Type": "application/x-www-form-urlencoded",
            }
        };


    // Remove invalid localStorage items & Redirect if items are missing
    var keyNames = ['value', 'inception',  'expires_in', 'membership_id', 'token_type', 'authorization_code'],
        cKeys = ['membership_id', 'token_type', 'authorization_code'],
        tokenKeys = ['inception', 'expires_in', 'value'];


    Object.keys(rsToken).forEach(item => {
        !keyNames.includes(item) ? (delete rsToken[item], localStorage.setItem('refreshToken', JSON.stringify(rsToken))) : null;
    });
    Object.keys(acToken).forEach(item => {
        !keyNames.includes(item) ? (delete acToken[item], localStorage.setItem('accessToken', JSON.stringify(acToken))) : null;
    });
    Object.keys(comps).forEach(item => {
        !keyNames.includes(item) ? (delete comps[item], localStorage.setItem('components', JSON.stringify(comps))) : null;
    });

    Object.keys(tokenKeys).forEach(item => {
        !Object.keys(rsToken).includes(tokenKeys[item]) ? RedirUser(homeUrl, 'rsToken=true') : null;
        !Object.keys(acToken).includes(tokenKeys[item]) ? RedirUser(homeUrl, 'acToken=true') : null;
    });
    Object.keys(cKeys).forEach(item => {
        !Object.keys(comps).includes(cKeys[item]) ? RedirUser(homeUrl, 'comps=true') : null;
    });



    // Check if either tokens have expired
    var isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1,
        isRsTokenExpired = (rsToken.inception + rsToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    if (isAcTokenExpired || isRsTokenExpired) {

        // Temporary deletion => Default headers are added back after OAuthFlow mechanisms
        delete axios.defaults.headers.common['X-API-Key'];

        // If either tokens have expired
        isAcTokenExpired ? log('-> Access token expired..') : log('-> Refresh token expired..');
        await axios.post('https://www.bungie.net/Platform/App/OAuth/token/', `grant_type=refresh_token&refresh_token=${rsToken.value}`, AuthConfig)
            .then(res => {
                var data = res.data;

                components['membership_id'] = data['membership_id'];
                components['token_type'] = data['token_type'];
                components['authorization_code'] = comps['authorization_code'];

                AccessToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
                AccessToken['expires_in'] = data['expires_in'];
                AccessToken['value'] = data['access_token'];

                RefreshToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
                RefreshToken['expires_in'] = data['refresh_expires_in'];
                RefreshToken['value'] = data['refresh_token'];

                localStorage.setItem('accessToken', JSON.stringify(AccessToken));
                localStorage.setItem('components', JSON.stringify(components));
                localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));
            });
        isAcTokenExpired ? log('-> Access Token Refreshed!') : log('-> Refresh Token Refreshed!');
    };
    bool ? log('-> Tokens Validated!') : null;
};


// Main OAuth flow mechanism
var OAuthFlow = async () => {

    const rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        acToken = JSON.parse(localStorage.getItem('accessToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        authCode = urlParams.get('code'); // ONLY place where authCode is to be fetched from

        // Clean URL and remove localStorage 'stateCode' item
        window.history.pushState({}, document.title, window.location.pathname);

    // Wrap in try.except for error catching
    try {
        // If user has no localStorage items and the code is incorrect
        if (authCode && (!comps || !acToken || !rsToken)) {
            await BungieOAuth(authCode);
        }
        // User has no credentials, fired before other conditions
        else if (!authCode && (!comps || !acToken || !rsToken)) {
            window.location.href = homeUrl;
        }

        // If user has authorized beforehand, but came back through empty param URL
        // If user has code and localStorage components
        else if (!authCode || authCode && (comps || acToken || rsToken)) {
            await CheckComponents();
        }

        // When user comes back with localStorage components but without param URL
        else if (!authCode && (comps || acToken || rsToken)) {
            await CheckComponents();
        }

        // Otherwise, redirect the user back to the 'Authorize' page
        else {
            window.location.href = homeUrl;
        };
    } catch (error) {
        console.error(error); // display error page, with error and options for user
    };
};


// Fetch basic bungie user details
var FetchBungieUserDetails = async () => {
    
    var components = JSON.parse(localStorage.getItem('components')),
        AuthConfig = { 
            headers: { 
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, 
                "X-API-Key": `${axiosHeaders.ApiKey}`
            }
        };
        

    // Variables to check/store
    membershipType = sessionStorage.getItem('membershipType'),
    destinyMemberships = JSON.parse(sessionStorage.getItem('destinyMemberships')),
    destinyUserProfile = JSON.parse(sessionStorage.getItem('destinyUserProfile'));

    // If user has no cache
    if (!membershipType || !destinyMemberships || !destinyUserProfile) {

        // Fetch bungie memberships
        var bungieMemberships = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/1/`, AuthConfig);
            destinyMemberships = bungieMemberships.data.Response;
            membershipType = destinyMemberships.destinyMemberships[0].membershipType;

        // Fetch user profile
        var userProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.destinyMemberships[0].membershipId}/?components=200`, AuthConfig);
            destinyUserProfile = userProfile.data.Response;

        // Cache the response
        sessionStorage.setItem('membershipType', membershipType);
        sessionStorage.setItem('destinyMemberships', JSON.stringify(destinyMemberships));
        sessionStorage.setItem('destinyUserProfile', JSON.stringify(destinyUserProfile));
    };

    // Load from cache
    if (membershipType || destinyMemberships || destinyUserProfile) {

        // Loop over characters
        characters = destinyUserProfile.characters.data;
        for (var item in characters) {

            var char = characters[item];
            document.getElementById(`classBg${char.classType}`).src = `https://www.bungie.net${char.emblemBackgroundPath}`;
            document.getElementById(`classType${char.classType}`).innerHTML = `${ParseChar(char.classType)}`;
            document.getElementById(`classLight${char.classType}`).innerHTML = `${char.light}`;
        };

        // Push user characters to HashBrowser
        userStruct['characters'] = characters;

        // Change DOM content
        document.getElementById('charactersContainer').style.display = 'inline-block';
        document.getElementById('categories').style.display = 'block';
        document.getElementById('statsContainer').style.display = 'block';
    };
};


// Load character from specific index
var LoadCharacter = async (classType) => {

    // Start load sequence
    StartLoad();

    // Validate tokens and other components
    await CheckComponents(false);

    
    // Globals
    var className = ParseChar(classType),
        characterId,
        CharacterInventories,
        definitions = {},
        objectiveDefinitions = {},
        membershipType = sessionStorage.getItem('membershipType'),
        charBounties = [];

    // Restart items and clear DOM content
    document.getElementById('totalXP').innerHTML = `${document.getElementById('totalXP').innerHTML.split(':')[0]}: `;
    document.getElementById('totalSpLevels').innerHTML = `${document.getElementById('totalSpLevels').innerHTML.split(':')[0]}:`;
    document.getElementById('displayTitle_Bounties').innerHTML = `${document.getElementById('displayTitle_Bounties').innerHTML.split('(')[0]}`;
    document.getElementById('contentDisplay').style.display = 'inline-block';
    document.getElementById('filters').innerHTML = '';
    document.getElementById('bountyItems').innerHTML = '';
    document.getElementById('overlays').innerHTML = '';
    document.getElementById('noItemsTooltip').style.display = 'none';

    // Filter out other classes that are not classType
    for (var char in characters) {
        if (characters[char].classType !== classType) {
            document.getElementById(`charContainer${characters[char].classType}`).classList.add('elBlur');
        }
        else if (characters[char].classType === classType) {
            document.getElementById(`charContainer${characters[char].classType}`).classList.remove('elBlur');
        };
    };

    // Get chosen character and save index  
    for (var item in destinyUserProfile.characters.data) {

        var char = destinyUserProfile.characters.data[item];
        if (char.classType === classType) {
            characterId = char.characterId;
        };
    };

    // Get manifest for world content and return it
    definitions = await ReturnEntry('DestinyInventoryItemDefinition');

    // OAuth header guarantees a response
    var resCharacterInventories = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/?components=201,300,202`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": `${axiosHeaders.ApiKey}` }});
    CharacterInventories = resCharacterInventories.data.Response.characterInventories.data;
    
    // Iterate over CharacterInventories[characterId].items
    var charInventory = CharacterInventories[characterId].items,
        amountOfBounties = 0;

    // var fubar = await ReturnEntry('DestinySandboxPerkDefinition');
    // log(fubar[718603205]);

    // Sandbox perks
    // charInventory.forEach(v => {
    //     let rt = definitions[v.itemHash];
    //     if (rt.hash === 534860348) {
    //         log(rt);
    //     };
    // });

    // Expire
    // charInventory.forEach(v => {
    //     if (definitions[v.itemHash].itemType === 26) {
    //         log(v.itemInstanceId);
    //     };
    // });


    // Sorts by index of item in itemTypeKeys
    var sortBountiesByType = (a, b) => {

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

    // Make array with specified groups
    var bountyArr = {};
    vendorKeys.forEach(key => {
        bountyArr[key] = [];
    });


    // Loop over inventory items and emit bounties
    var parsedBounties = ParseBounties(charInventory, {definitions});
        charBounties = parsedBounties[0]
        amountOfBounties = parsedBounties[1];

    // Assign objectives definitions to each item
    objectiveDefinitions = await ReturnEntry('DestinyObjectiveDefinition');
    Object.keys(charBounties).forEach(v => {
        charBounties[v].objectiveDefinitions = objectiveDefinitions[charBounties[v].objectives.objectiveHashes[0]];
    });
    
    // Loop over bounties and sort into groups
    bountyArr = SortByGroup(charBounties, {bountyArr, vendorKeys, itemTypeKeys});

    // Loop through bounties and sort groups' bounties
    bountyArr = SortByType(bountyArr, {sortBountiesByType});

    // Push charBounties to HashBrowser
    userStruct['charBounties'] = charBounties;

    // Render items to DOM
    PushToDOM(bountyArr, {MakeBountyElement, amountOfBounties});

    // Calculate XP yield from (active) bounties
    var totalXpYield = CalcXpYield(bountyArr, {itemTypeKeys, baseYields, petraYields});

    // Change DOM content
    document.getElementById('displayTitle_Bounties').style.display = 'block';

    // Toggle empty items tooltip
    if (amountOfBounties === 0) {
        document.getElementById('noItemsTooltip').style.display = 'inline-block';
        document.getElementById('noItemsTooltip').innerHTML = 'No Items exist on this character';
        document.getElementById('totalXP').innerHTML = `${document.getElementById('totalXP').innerHTML}${0}`;
        document.getElementById('totalSpLevelss').innerHTML = `${document.getElementById('totalSpLevels').innerHTML}: +${0} levels`;
    }
    else if (amountOfBounties > 0) {
        document.getElementById('noItemsTooltip').style.display = 'none';
        document.getElementById('displayTitle_Bounties').innerHTML = `${document.getElementById('displayTitle_Bounties').innerHTML} (${amountOfBounties})`
        document.getElementById('totalXP').innerHTML = `${document.getElementById('totalXP').innerHTML}${InsertSeperators(totalXpYield)}`;
        document.getElementById('totalSpLevels').innerHTML = `${document.getElementById('totalSpLevels').innerHTML} +${totalXpYield/100_000} levels`;
    };


    // Stop loading sequence
    StopLoad();
    log(`-> Indexed ${ParseChar(classType)}!`);

    // Load synergyDefinitions and match against bounties
    await PushProps();
    await LoadHeuristics();
};


// Load heuristics and configure data
var LoadHeuristics = async () => {

    // Create a filter for each prop
    for (const v in propCount) {

        if (propCount[v] > 1) {
            
            const filterContainer = document.createElement('div'),
                  filterContent = document.createElement('div');

            // Assign id's and classes + change innerHTML
            filterContainer.className = 'filter';
            filterContent.className = 'propName';
            filterContainer.id = `filter_${v}${propCount[v]}`;
            filterContent.id = `propName_${v}${propCount[v]}`;
            filterContent.innerHTML = `${CapitilizeFirstLetter(v)} (${propCount[v]})`;

            // Append children elements to respective parent elements
            document.querySelector('#filters').appendChild(filterContainer);
            document.querySelector(`#filter_${v}${propCount[v]}`).appendChild(filterContent);

            // Show relevant bounties as per filter
            filterContainer.addEventListener('click', () => {
                userStruct.charBounties.forEach(b => {

                    // Find bounties that do match the filter index
                    if (!b.props.includes(v)) {

                        document.getElementById(`${b.hash}`).style.opacity = '50%';
                        document.getElementById(`item_${b.hash}`).style.opacity = '50%';

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



// -- PLAYER STRUCTS -- //

// Sort items into bounties
var ParseBounties = (charInventory, utils) => {

    var charBounties = [],
        amountOfBounties = 0;

    charInventory.forEach(v => {
        var item = utils.definitions[v.itemHash];
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





// Add listeners for buttons
for (let a=0; a<=2; a++) {
    document.getElementById(`charContainer${a}`).addEventListener('click', () => {
        LoadCharacter(a);
    });
};

// Logout button listener
document.getElementById('navBarLogoutContainer', () => {
    Logout();
});

// Hover events for "Current Yield" query
document.getElementById('statsTitleQuery').addEventListener('mousemove', () => {
    document.getElementById('queryDiv').style.display = 'block';
});
document.getElementById('statsTitleQuery').addEventListener('mouseleave', () => {
    document.getElementById('queryDiv').style.display = 'none';
});

// Remove filters button
document.getElementById('removeFiltersID').addEventListener('click', () => {
    userStruct.charBounties.forEach(bounty => { // Loop over charBounties and reverse filtered items
        userStruct.greyOutDivs.forEach(greyHash => {
            document.getElementById(`${bounty.hash}`).style.opacity = 'unset';
            document.getElementById(`item_${bounty.hash}`).style.opacity = 'unset';
        });
    });
    userStruct.greyOutDivs = []; // Clear array
});


// -- MAIN
(async () => {
    
    // OAuth Flow
    await OAuthFlow();

    // Add default headers back, in case OAuthFlow needed a refresh
    axios.defaults.headers.common = {
        "X-API-Key": `${axiosHeaders.ApiKey}`
    };

    // Main
    await ValidateManifest();
    await FetchBungieUserDetails();

    // Load first character on profile
    LoadCharacter(characters[Object.keys(characters)[0]].classType);

    // OAuth flow (above methods) have completed
    log(`-> OAuth Flow Complete! [Elapsed: ${(new Date() - startTime)}ms]`);
})()
.catch(error => {
    console.error(error);
});


// Push charBounties to the HashBrowser
export { userStruct };