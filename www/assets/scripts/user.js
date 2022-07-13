console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
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
    CapitilizeFirstLetter,
    ParseBounties,
    PushToDOM,
    SortByGroup,
    SortByType,
    SortBountiesByType,
    CalcXpYield,
    CalculateXpForBrightEngram,
    ReturnSeasonPassLevel,
    LoadPrimaryCharacter,
    CacheAuditItem,
    CacheRemoveItem,
    CacheReturnItem } from './utils/ModuleScript.js';
import {
    itemTypeKeys,
    vendorKeys,
    baseYields,
    petraYields } from './utils/SynergyDefinitions.js';
import { bountyPropCount, PushProps } from './utils/MatchProps.js';
import { AddEventListeners } from './utils/Events.js';



// Validate state parameter
VerifyState();

// Globals
var urlParams = new URLSearchParams(window.location.search),
    sessionStorage = window.sessionStorage,
    localStorage = window.localStorage,
    log = console.log.bind(console),
    objectiveDefinitions = {},
    destinyMemberships = {},
    destinyUserProfile = {},
    startTime = new Date(),
    sessionCache = {},
    definitions = {},
    userStruct = {},
    membershipType,
    characters,
    homeUrl = 'https://synergy.brendanprice.xyz/',
    axiosHeaders = {
        ApiKey: 'e62a8257ba2747d4b8450e7ad469785d',
        Authorization: 'MzgwNzQ6OXFCc1lwS0M3aWVXQjRwZmZvYmFjWTd3ZUljemlTbW1mRFhjLm53ZThTOA=='
    },
    clientId = 38074;

    document.getElementById('loadingContentContainer').style.display = 'block'; // Show loading content

// Set default axios header
userStruct.homeUrl = homeUrl;
axios.defaults.headers.common = {
    "X-API-Key": `${axiosHeaders.ApiKey}`
};

// Configure userStruct properties
userStruct.charBounties = [];
userStruct.characters = {};
userStruct.filterDivs = {};
userStruct.homeUrl = '';
userStruct.bools = {};
userStruct.ints = {};
userStruct.objs = {};

// Push data
userStruct.objs.currView = document.getElementById('pursuitsContainer');
userStruct.bools.characterLoadToggled = false;
userStruct.ints.refreshTime = new Date();
userStruct.bools.filterToggled = false;
CacheAuditItem('refreshInterval', 5*60000);



// Authorize with Bungie.net
var BungieOAuth = async (authCode) => {

    let AccessToken = {},
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
            let data = res.data;

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
                window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code`;
            }
            else {
                console.error(err);
            };
        });
};


// Check tokens for expiration
var CheckComponents = async (bool) => {
    
    let acToken = JSON.parse(localStorage.getItem('accessToken')),
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
    let isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1,
        isRsTokenExpired = (rsToken.inception + rsToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    if (isAcTokenExpired || isRsTokenExpired) {

        // Temporary deletion => Default headers are added back after OAuthFlow mechanisms
        delete axios.defaults.headers.common['X-API-Key'];

        // Change load content
        document.getElementById('loadingText').innerHTML = 'Refreshing Tokens';

        // If either tokens have expired
        isAcTokenExpired ? log('-> Access token expired..') : log('-> Refresh token expired..');
        await axios.post('https://www.bungie.net/Platform/App/OAuth/token/', `grant_type=refresh_token&refresh_token=${rsToken.value}`, AuthConfig)
            .then(res => {
                let data = res.data;

                components["membership_id"] = data["membership_id"];
                components["token_type"] = data["token_type"];
                components["authorization_code"] = comps["authorization_code"];

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

    let rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        acToken = JSON.parse(localStorage.getItem('accessToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        authCode = urlParams.get('code'); // ONLY place where authCode is to be fetched from

        // Clean URL
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
    
    let seasonHash,
        components = JSON.parse(localStorage.getItem('components')),
        AuthConfig = { 
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, 
                "X-API-Key": `${axiosHeaders.ApiKey}`
            }
        };
        

    // Change load content
    document.getElementById('loadingText').innerHTML = 'Fetching User Details';

    // Variables to check/store
    membershipType = sessionStorage.getItem('membershipType'),
    destinyMemberships = JSON.parse(sessionStorage.getItem('destinyMemberships')),
    destinyUserProfile = JSON.parse(sessionStorage.getItem('destinyUserProfile'));

    // If user has no cache
    if (!membershipType || !destinyMemberships || !destinyUserProfile) {

        // Fetch bungie memberships
        let bungieMemberships = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/1/`, AuthConfig);
            destinyMemberships = bungieMemberships.data.Response;
            membershipType = destinyMemberships.destinyMemberships[0].membershipType;

        // Fetch user profile
        let userProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.destinyMemberships[0].membershipId}/?components=200`, AuthConfig);
            destinyUserProfile = userProfile.data.Response;

        // Cache the response
        sessionStorage.setItem('membershipType', membershipType);
        sessionStorage.setItem('destinyMemberships', JSON.stringify(destinyMemberships));
        sessionStorage.setItem('destinyUserProfile', JSON.stringify(destinyUserProfile));
    };

    // Load from cache
    if (membershipType && destinyMemberships && destinyUserProfile) {

        // Loop over characters
        characters = destinyUserProfile.characters.data;
        for (let item in characters) {
            let char = characters[item];
            document.getElementById(`classBg${char.classType}`).src = `https://www.bungie.net${char.emblemBackgroundPath}`;
            document.getElementById(`classType${char.classType}`).innerHTML = `${ParseChar(char.classType)}`;
            document.getElementById(`classLight${char.classType}`).innerHTML = `${char.light}`;
        };

        // Push relevant items to the browser
        userStruct['characters'] = characters;

        // Change DOM content
        document.getElementById('charactersContainer').style.display = 'inline-block';
        document.getElementById('categories').style.display = 'block';
        document.getElementById('statsContainer').style.display = 'block';
    };
};


// Load character from specific index
var LoadCharacter = async (classType, isRefresh) => {

    if (!userStruct.characterLoadToggled) {

        // Configure load sequence
        document.getElementById('loadingText').innerHTML = 'Indexing Character';
        await CheckComponents(false);
        StartLoad();
        
        // Globals in this scope
        let membershipType = sessionStorage.getItem('membershipType'),
            CharacterProgressions,
            CharacterInventories,
            CharacterObjectives,
            seasonPassInfo = {},
            seasonPassLevel = 0,
            prestigeSeasonInfo,
            CurrentSeasonHash,
            charBounties = [],
            seasonInfo = {},
            characterId;


        // Toggle character load
        userStruct.characterLoadToggled = true;
        CacheAuditItem('lastChar', classType);
            
        // Clear DOM content
        document.getElementById('displayTitle_Bounties').innerHTML = `${document.getElementById('displayTitle_Bounties').innerHTML.split('(')[0]}`;
        document.getElementById('totalBrightEngrams').innerHTML = `${document.getElementById('totalBrightEngrams').innerHTML.split(':')[0]}: `;
        document.getElementById('totalSpLevels').innerHTML = `${document.getElementById('totalSpLevels').innerHTML.split(':')[0]}:`;
        document.getElementById('totalXP').innerHTML = `${document.getElementById('totalXP').innerHTML.split(':')[0]}: `;
        document.getElementById('loadingContentContainer').style.display = 'block';
        document.getElementById('contentDisplay').style.display = 'none';
        document.getElementById('noItemsTooltip').style.display = 'none';
        document.getElementById('bountyItems').innerHTML = '';
        document.getElementById('overlays').innerHTML = '';
        document.getElementById('filters').innerHTML = '';

        // Filter out other classes that are not classType
        for (let char in characters) {
            if (characters[char].classType !== classType) {
                document.getElementById(`charContainer${characters[char].classType}`).classList.add('elBlur');
            }
            else if (characters[char].classType === classType) {
                document.getElementById(`charContainer${characters[char].classType}`).classList.remove('elBlur');
            };
        };

        // Get chosen character and save index  
        for (let item in destinyUserProfile.characters.data) {
            let char = destinyUserProfile.characters.data[item];
            if (char.classType === classType) {
                characterId = char.characterId;
            };
        };

        // OAuth header guarantees a response
        if (!sessionCache.resCharacterInventories || isRefresh) {
            let resCharacterInventories = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/?components=100,201,202,205,300,301`, {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`,"X-API-Key": `${axiosHeaders.ApiKey}`}});
                CharacterInventories = resCharacterInventories.data.Response.characterInventories.data;
                CurrentSeasonHash = resCharacterInventories.data.Response.profile.data.currentSeasonHash;
                CharacterProgressions = resCharacterInventories.data.Response.characterProgressions.data[characterId].progressions;
                CharacterObjectives = resCharacterInventories.data.Response.itemComponents.objectives.data;
                sessionCache.resCharacterInventories = resCharacterInventories;
        }
        else if (sessionCache.resCharacterInventories) {
                CharacterInventories = sessionCache.resCharacterInventories.data.Response.characterInventories.data;
                CurrentSeasonHash = sessionCache.resCharacterInventories.data.Response.profile.data.currentSeasonHash;
                CharacterProgressions = sessionCache.resCharacterInventories.data.Response.characterProgressions.data[characterId].progressions;
                CharacterObjectives = sessionCache.resCharacterInventories.data.Response.itemComponents.objectives.data;
        };

        // Iterate over CharacterInventories[characterId].items
        let charInventory = CharacterInventories[characterId].items,
            amountOfBounties = 0;

        // Make array with specified groups
        let bountyArr = {};
        vendorKeys.forEach(key => {
            bountyArr[key] = [];
        });

        // Loop over inventory items and emit bounties
        let parsedBounties = ParseBounties(charInventory, CharacterObjectives, {definitions, objectiveDefinitions});
            charBounties = parsedBounties[0]
            amountOfBounties = parsedBounties[1];

        // Assign objective(s) definitions to each item
        Object.keys(charBounties).forEach(v => {
            let objHashes = charBounties[v].objectives.objectiveHashes;
            charBounties[v].objectiveDefinitions = [];
            for (let objHash of objHashes) {
                charBounties[v].objectiveDefinitions.push(objectiveDefinitions[objHash]);
            };
        });
        
        // Loop over bounties and sort into groups then by type
        bountyArr = SortByGroup(charBounties, {bountyArr, vendorKeys, itemTypeKeys});
        bountyArr = SortByType(bountyArr, {SortBountiesByType});
        PushToDOM(bountyArr, {MakeBountyElement, amountOfBounties});
        userStruct['charBounties'] = charBounties;

        // Calculate XP yield from (active) bounties
        const totalXpYield = CalcXpYield(bountyArr, {itemTypeKeys, baseYields, petraYields});

        // Get season pass info
        let seasonDefinitions = await ReturnEntry('DestinySeasonDefinition');
            seasonInfo = CharacterProgressions[seasonDefinitions[CurrentSeasonHash].seasonPassProgressionHash];
        let seasonPassDefinitions = await ReturnEntry('DestinySeasonPassDefinition');
            seasonPassInfo = seasonPassDefinitions[seasonDefinitions[CurrentSeasonHash].seasonPassHash];
            prestigeSeasonInfo = CharacterProgressions[seasonPassInfo.prestigeProgressionHash];
        let xpRequiredForNextBrightEngram = await CalculateXpForBrightEngram(seasonInfo, prestigeSeasonInfo, totalXpYield, seasonPassInfo);
            seasonPassLevel = await ReturnSeasonPassLevel(seasonInfo, prestigeSeasonInfo);

        // Change DOM content
        let brightEngramTracker = document.getElementById('totalBrightEngrams');
        document.getElementById('displayTitle_Bounties').style.display = 'block';
        document.getElementById('currentSpLevel').innerHTML = `Season Pass Level: ${seasonPassLevel}`;
        brightEngramTracker.innerHTML = `${brightEngramTracker.innerHTML}${InsertSeperators(xpRequiredForNextBrightEngram)} Xp`;

        // Toggle empty items tooltip
        if (amountOfBounties === 0) {
            document.getElementById('totalSpLevels').innerHTML = `${document.getElementById('totalSpLevels').innerHTML} +${0} levels`;
            document.getElementById('totalXP').innerHTML = `${document.getElementById('totalXP').innerHTML}${0}`;
            document.getElementById('noItemsTooltip').innerHTML = 'No Items exist on this character';
            document.getElementById('noItemsTooltip').style.display = 'inline-block';
        }
        else if (amountOfBounties > 0) {
            document.getElementById('displayTitle_Bounties').innerHTML = `${document.getElementById('displayTitle_Bounties').innerHTML} (${amountOfBounties})`;
            document.getElementById('totalSpLevels').innerHTML = `${document.getElementById('totalSpLevels').innerHTML} +${totalXpYield/100_000} levels`;
            document.getElementById('totalXP').innerHTML = `${document.getElementById('totalXP').innerHTML}${InsertSeperators(totalXpYield)}`;
            document.getElementById('noItemsTooltip').style.display = 'none';
        };

        // Load synergyDefinitions and match against bounties
        await PushProps();
        await CreateFilters('charBounties', bountyPropCount);
        userStruct.characterLoadToggled = false;

        // Toggle elements
        document.getElementById('loadingContentContainer').style.display = 'none';
        userStruct.objs.currView.style.display = 'block';
        document.getElementById('contentDisplay').style.display = 'inline-block';

        // Stop loading sequence
        StopLoad();
    };
};


// Load heuristics and configure data
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




// -- MAIN
(async () => {
    
    // OAuth Flow
    await OAuthFlow();

    // Add default headers back, in case OAuthFlow needed a refresh
    axios.defaults.headers.common = { "X-API-Key": `${axiosHeaders.ApiKey}` };
    await ValidateManifest();
    await FetchBungieUserDetails();

    // Fetch manifest
    objectiveDefinitions = await ReturnEntry('DestinyObjectiveDefinition');
    definitions = await ReturnEntry('DestinyInventoryItemDefinition');

    // Load first character on profile
    await LoadPrimaryCharacter(userStruct.characters);
    await AddEventListeners();
    log(`-> OAuth Flow Complete! [Elapsed: ${(new Date() - startTime)}ms]`);

})()
// .catch (error => {
//     document.getElementById('errorTitle').innerHTML = error.name;
//     document.getElementById('errorMessage').innerHTML = error.message;
// });

export { LoadCharacter, userStruct, homeUrl };