console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

// Verify state before anything else
var uP = new URLSearchParams(window.location.search),
    state = uP.get('state'),
    url = `http://86.2.10.33:4645/D2Synergy-v0.3/src/views/app.html`;
if (state != window.localStorage.getItem('stateCode')) {
    window.location.href = url;
} else {
    window.localStorage.removeItem('stateCode');
};

// Explicit globals
var log = console.log.bind(console),
    browserLanguageType = window.navigator.language.split('-')[0], // Language from browser preference
    startTime = new Date(),
    localStorage = window.localStorage,
    sessionStorage = window.sessionStorage,
    destinyMemberships = {},
    destinyUserProfile = {},
    membershipType;

// Default axios header
axios.defaults.headers.common = {
    "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d"
};

// Create IndexedDB database and URLSearchParams instance
var urlParams = new URLSearchParams(window.location.search);
var db = new Dexie('ManifestDefinitions');

// Configure the key for the database
db.version(1).stores({
    jsonWorldContentPaths: 'keyName',
    jsonWorldComponentContentPaths: 'keyName'
});




// Validate and/or update manifest
var GetDestinyManifest_New = async () => {

    var storedManifestVersion = localStorage.getItem('destinyManifestVersion'),
        jsonWorldContent    = await db.table('jsonWorldContentPaths').toArray(),
        jsonWorldComponents = await db.table('jsonWorldComponentContentPaths').toArray(),
        manifestKeys = [];


    
    // Fetch base manifest 
    var manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    manifest = manifest.data.Response;

    // Fetch content from manifest url
    delete axios.defaults.headers.common['X-API-Key'];
    var worldContent = await axios.get(`https://www.bungie.net${manifest.jsonWorldContentPaths[browserLanguageType]}`),
        worldContent = worldContent.data;

    var worldComponents = await axios.get(`https://www.bungie.net${manifest.jsonWorldComponentContentPaths[browserLanguageType]}`),
        worldComponents = worldComponents.data;

    // Pull manually what you need instead of dynamically doing it 
};


// Validate and/or update manifest
var GetDestinyManifest = async () => {

    var ParseManifest = async (resManifest, tableName) => {

        // @ Params
        // resManifest
        // tableName

        // Check localStorage items before
        await CheckComponents();

        // Temporary deletion => Default headers are added back after OAuthFlow mechanisms
        delete axios.defaults.headers.common['X-API-Key'];

        // Get jsonWorldContentPaths from definitions
        var definitionObjects;
        Object.keys(resManifest.data.Response).forEach(item => item === tableName ? definitionObjects = resManifest.data.Response[item][browserLanguageType] : null);

        // If tableName is the mobile version, we have to do a seperate install process because the structure is different
        if (tableName === 'jsonWorldComponentContentPaths') {  
            
            // Fetch definitions
            var root = manifestFromResponse.data.Response.jsonWorldComponentContentPaths.en;
            var destinyVendorDefinitionResponse = await axios.get(`https://www.bungie.net${root.DestinyVendorDefinition}`);

            // Put response into indexedDB
            db[tableName].bulkPut([ { keyName: 'DestinyVendorDefinition', data: destinyVendorDefinitionResponse.data } ])
        }
        else if (tableName !== 'jsonWorldComponentContentPaths') {

            // Fetch definitions & put response into indexedDB
            var definitionsFromResponse = await axios.get(`https://www.bungie.net${definitionObjects}`);
            for (var property in definitionsFromResponse.data) {
                db[tableName].bulkPut([ { keyName: property, data: definitionsFromResponse.data[property] } ]);
            };
        };

        // Save manifest version
        localStorage.setItem('destinyManifestVersion', resManifest.data.Response.version);
    };

    // Get components from db and localStorage
    var manifestVersion = localStorage.getItem('destinyManifestVersion'),
        jsonWorldContentPaths = await db.table('jsonWorldContentPaths').toArray(),
        jsonWorldComponentContentPaths = await db.table('jsonWorldComponentContentPaths').toArray(),
        sTime = new Date(),
        requiredDbEntries = [
            'DestinyInventoryItemDefinition'
        ];
    

    // Check for manifest version
    var manifestFromResponse = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    if (manifestFromResponse.data.Response.version !== manifestVersion) {

        // Parse manifest response
        log('-> Manifest Not Up To Date, Updating Manifest..');
        await ParseManifest(manifestFromResponse, 'jsonWorldContentPaths');
    };

    if (jsonWorldContentPaths.length === 0) {

        // Parse manifest response
        log('-> Manifest Not Correct, Updating Manifest..');
        await ParseManifest(manifestFromResponse, 'jsonWorldContentPaths');
    };

    if (jsonWorldComponentContentPaths.length === 0) {

        // Parse manifest response
        log('-> Manifest Not Correct, Updating Manifest..');
        await ParseManifest(manifestFromResponse, 'jsonWorldComponentContentPaths');
    };

    log(`-> Manifest Up To Date! [Elapsed: ${new Date() - sTime}ms]`);
};


// Authorize with Bungie.net
var BungieOAuth = async (authCode) => {

    var AccessToken = {},
        RefreshToken = {},
        components = {},
        AuthConfig = {
            headers: {
                Authorization: 'Basic MzgwNzQ6OXFCc1lwS0M3aWVXQjRwZmZvYmFjWTd3ZUljemlTbW1mRFhjLm53ZThTOA==',
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
            if (err.response.data['error_description'] == 'AuthorizationCodeInvalid') {
                window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
            }
            else if (err.response.data['error_description'] == 'AuthorizationCodeStale') {
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
                Authorization: `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
                "Content-Type": "application/x-www-form-urlencoded",
            }
        };


    // Remove invalid localStorage items & Redirect if items are missing
    var keyNames = ['value', 'inception',  'expires_in', 'membership_id', 'token_type', 'authorization_code'],
        tokenKeys = ['inception', 'expires_in', 'value'],
        cKeys = ['membership_id', 'token_type', 'authorization_code'],
        redirUrl = 'http://86.2.10.33:4645/D2Synergy-v0.3/src/views/app.html';


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
        !Object.keys(rsToken).includes(tokenKeys[item]) ? RedirUser(redirUrl, 'rsToken=true') : null;
        !Object.keys(acToken).includes(tokenKeys[item]) ? RedirUser(redirUrl, 'acToken=true') : null;
    });
    Object.keys(cKeys).forEach(item => {
        !Object.keys(comps).includes(cKeys[item]) ? RedirUser(redirUrl, 'comps=true') : null;
    });



    // Check if either tokens have expired
    isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
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


// Remove URL query params
var CleanURL = () => {
    window.history.pushState({}, document.title, window.location.pathname);
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
            window.location.href = `http://86.2.10.33:4645/D2Synergy-v0.3/src/views/app.html`;
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
            window.location.href = `http://86.2.10.33:4645/D2Synergy-v0.3/src/views/app.html`;
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
                "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" 
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
        var userProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/?components=200`, AuthConfig);
            destinyUserProfile = userProfile.data.Response;

        // Cache the response
        sessionStorage.setItem('membershipType', membershipType);
        sessionStorage.setItem('destinyMemberships', JSON.stringify(destinyMemberships));
        sessionStorage.setItem('destinyUserProfile', JSON.stringify(destinyUserProfile));
    };

    // Load from cache
    if (membershipType || destinyMemberships || destinyUserProfile) {

        // Loop over characters
        var characterData = destinyUserProfile.characters.data;
        for (var item in characterData) {

            var char = characterData[item];
            document.getElementsByClassName('charImg')[char.classType].style.border = '1px solid white';
            document.getElementById(`charBg${char.classType}`).src = `https://www.bungie.net${char.emblemBackgroundPath}`;
            document.getElementById(`charImg${char.classType}`).src = `https://www.bungie.net${char.emblemPath}`;
            document.getElementById(`classType${char.classType}`).innerHTML = `${parseChar(char.classType)}`;
            document.getElementById(`charLight${char.classType}`).innerHTML = `${char.light}`;
        };
    };
};


// Load character from specific index
var LoadCharacter = async (classType) => {

    // Start load sequence
    StartLoad();

    // Validate tokens and other components
    await CheckComponents(false);

    
    // Globals
    var className = parseChar(classType),
        characterId,
        CharacterInventories,
        definitions = {},
        membershipType = sessionStorage.getItem('membershipType');


    // Edit DOM content
    var mainContainer = document.getElementById('mainContainer').style;
        mainContainer.background = 'none';
        mainContainer.border = 'none';

    document.getElementById('charSelect').style.display = 'none';
    document.getElementById('charDisplay').style.display = 'inline-block';
    document.getElementById('charDisplayTitle_Character').innerHTML = `${className} //`;


    // Get chosen character and save index  
    for (var item in destinyUserProfile.characters.data) {

        var char = destinyUserProfile.characters.data[item];
        if (char.classType === classType) {
            // className = parseChar(classType);
            characterId = char.characterId;
        };
    };

    // Get manifest for world content and return it
    await db.jsonWorldContentPaths.where({keyName: 'DestinyInventoryItemDefinition'}).toArray()
    .then(massiveObj => {
        definitions = massiveObj[0].data;
    });

    // OAuth header guarantees a response
    var resCharacterInventories = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/?components=201`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
    CharacterInventories = resCharacterInventories.data.Response.characterInventories.data;

    // Iterate over CharacterInventories[characterId].items
    var charInventory = CharacterInventories[characterId].items,
        amountOfBounties = 0,
        charBounties = [];

    // Declare sorting keys
    var itemTypeKeys = [
        'weekly',
        'daily',
        'repeatable'
    ],
    vendorKeys = [
        'clan',
        'cosmodrome',
        'crucible',
        'dawning',
        'dreaming_city',
        'edz',
        'eternity',
        'europa',
        'fotl', // Festive of the Lost
        'gambit',
        'gunsmith',
        'iron_banner',
        'luna',
        'myriad', // Nessus
        'solstice',
        'spring',
        'strikes',
        'throneworld',
        'transmog',
        'trials',
        'war_table',
        'other'
    ],
    baseYields = {
        'weekly': 12_000,
        'daily': 6_000,
        'repeatable': 4_000
    },
    petraYields = {
        'weekly': 6_000,
        'daily': 1_000,
        'repeatable': 0
    };

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
    bountyArr = {};
    vendorKeys.forEach(key => {
        bountyArr[key] = [];
    });


    // Loop over inventory items and emit bounties
    parsed = ParseBounties(charInventory, {definitions});
    charBounties = parsed[0]
    amountOfBounties = parsed[1];
    
    // Loop over bounties and sort into groups
    bountyArr = SortByGroup(charBounties, {bountyArr, vendorKeys, itemTypeKeys});

    // Loop through bounties and sort groups' bounties
    bountyArr = SortByType(bountyArr, {sortBountiesByType});

    // Render items to DOM
    PushToDOM(bountyArr, {MakeBountyElement, amountOfBounties});

    // Calculate XP yield from (active) bounties
    var totalXpYield = CalcXpYield(bountyArr, {itemTypeKeys, baseYields, petraYields});

    // Change DOM content
    // document.getElementById('amountOfBounties').innerHTML = `${amountOfBounties === 1 ? `${amountOfBounties} Bounty Found` : `${amountOfBounties} Bounties Found`}`;
    document.getElementById('totalBounties').innerHTML = `Bounties: ${amountOfBounties}`;
    document.getElementById('totalXP').innerHTML = `Total XP: ${totalXpYield}`;

    // Stop loading sequence
    StopLoad();
    log(`-> Indexed ${parseChar(classType)}!`);
};


// Sort items into bounties
var ParseBounties = (charInventory, utils) => {

    var charBounties = [],
        amountOfBounties = 0;

    charInventory.forEach(v => {
        var item = utils.definitions[v.itemHash];
        if (item.itemType === 26) {
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




// -- MODULES

// Returns corresponding class name using classType
// @int {classType}
var parseChar = (classType) => {
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
// Log user out on request
// @ {}
var Logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://86.2.10.33:4645/D2Synergy-v0.3/src/views/app.html';
};
// Returns size of data that currently resides in localStorage
// @window.obj {localStorage}
var GetLsSize = async (localStorage) => {
    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;

    while (i--) { values.push(localStorage.getItem(keys[i])); };

    log('[Usage Bytes]: ', encodeURI(JSON.stringify(values)).split(/%..|./).length - 1);
};
// Returns Definitions from the DestinyInventoryItemDefinition entry
// @int {hash} @str {defType}
var ReturnDefinition = async (hash, defType) => {
    // Preload information in the future
    var response = await db.entries.where({keyName: defType}).toArray();
    return response[0].data[hash];
};
// Start loading sequence
// @ {}
var StartLoad = () => {
    document.getElementById('slider').style.display = 'block';
};
// Stop loading sequence
// @ {}
var StopLoad = () => {
    document.getElementById('slider').style.display = 'none';
};
// Make element for entry data when hash is found in definitions
// @obj {param}
var MakeBountyElement = (param) => {

    const item = document.createElement('img'),
          itemOverlay = document.createElement('div'),
          itemTitle = document.createElement('div'),
          itemType = document.createElement('div'),
          itemDesc = document.createElement('div'),
          hr = document.createElement('hr');


    // Create bottom element
    item.className = `bounty`;
    item.id = `${param.hash}`;
    document.querySelector('#items').appendChild(item);
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

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).appendChild(itemTitle);
    document.querySelector(`#item_${param.hash}`).appendChild(itemType);
    document.querySelector(`#item_${param.hash}`).appendChild(hr);
    document.querySelector(`#item_${param.hash}`).appendChild(itemDesc);
    

    // Watch for mouse events
    item.addEventListener('mousemove', (e) => {
        // var el = itemOverlay.style;
        itemOverlay.style.display = 'inline-block';
        itemOverlay.style.left = `${e.pageX}px`;
        itemOverlay.style.top = `${e.pageY}px`;
        log('on');
    });

    item.addEventListener('mouseleave', (e) => {
        log('OFF');
        itemOverlay.style.display = 'none';
    });
};  
// Redirect user back to specified url
// @string {url}
var RedirUser = (url, param) => {
    window.location.href = `${url}?${param ? param : ''}`;
};




// -- MAIN
(async () => {
    
    // OAuth Flow
    await OAuthFlow();

    // Add default headers back, in case OAuthFlow needed a refresh
    axios.defaults.headers.common = {
        "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d"
    };

    // Main
    await GetDestinyManifest();
    await FetchBungieUserDetails();

    // -- dev --
    LoadCharacter(0);

    // Processes done
    // StopLoad();
    log(`-> OAuth Flow Done! [Elapsed: ${(new Date() - startTime)}ms]`);
})()
.catch(error => {
    console.error(error);
});