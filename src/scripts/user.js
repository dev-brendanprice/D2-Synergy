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
    browserLanguageType = 'en', // Get from browser info or sumn idfk lol
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
var CheckComponents = async () => {
    
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


    // Remove items in localStorage that are not present within keyNames
    keyNames = ['value', 'inception',  'expires_in', 'membership_id', 'token_type', 'authorization_code'];
    Object.keys(rsToken).forEach(item => {
        !keyNames.includes(item) ? (delete rsToken[item], localStorage.setItem('refreshToken', JSON.stringify(rsToken))) : null;
    });
    Object.keys(acToken).forEach(item => {
        !keyNames.includes(item) ? (delete acToken[item], localStorage.setItem('accessToken', JSON.stringify(acToken))) : null;
    });
    Object.keys(comps).forEach(item => {
        !keyNames.includes(item) ? (delete comps[item], localStorage.setItem('components', JSON.stringify(comps))) : null;
    });
    
    // Temporary deletion => Default headers are added back after OAuthFlow mechanisms
    delete axios.defaults.headers.common['X-API-Key'];

    // Check if either tokens have expired
    isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    isRsTokenExpired = (rsToken.inception + rsToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    if (isAcTokenExpired || isRsTokenExpired) {

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
    log('-> Tokens Validated!');
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


// Validate and/or update manifest
var GetDestinyManifest = async () => {

    var ParseManifest = async (resManifest, tableName) => {

        log('-> Manifest Not Up To Date, Updating Manifest..');

        // Temporary deletion => Default headers are added back after OAuthFlow mechanisms
        delete axios.defaults.headers.common['X-API-Key'];

        // Get jsonWorldContentPaths from definitions
        var definitionObjects;
        Object.keys(resManifest.data.Response).forEach(item => item === tableName ? definitionObjects = resManifest.data.Response[item][browserLanguageType] : null);

        // If tableName is the mobile version, we have to do a seperate install process because the structure is different
        if (tableName === 'jsonWorldComponentContentPaths') {  
            
            // Fetch definitions
            var destinyVendorDefinitionResponse = await axios.get(`https://www.bungie.net${definitionObjects.DestinyVendorDefinition}`);
            var destinyVendorGroupDefinitionResponse = await axios.get(`https://www.bungie.net${definitionObjects.DestinyVendorGroupDefinition}`);

            // Put response into indexedDB
            for (var property in destinyVendorDefinitionResponse.data) {
                db[tableName].bulkPut([ { keyName: property, data: destinyVendorDefinitionResponse.data[property] } ]);
            };
            for (var property in destinyVendorGroupDefinitionResponse.data) {
                db[tableName].bulkPut([ { keyName: property, data: destinyVendorGroupDefinitionResponse.data[property] } ]);
            };
        }
        else if (tableName !== 'jsonWorldComponentContentPaths') {

            // Fetch definitions & put response into indexedDB
            var definitionsFromResponse = await axios.get(`https://www.bungie.net${urlSuffix}`);
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
        sTime = new Date();

    // Check for manifest version, if true replace all preixes with current ones
    var manifestFromResponse = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    if (manifestFromResponse.data.Response.version !== manifestVersion || jsonWorldContentPaths.length === 0) {

        // Parse manifest response
        await ParseManifest(manifestFromResponse, 'jsonWorldContentPaths');
    } 
    else if (jsonWorldComponentContentPaths.length === 0) {

        // Parse manifest response
        await ParseManifest(manifestFromResponse, 'jsonWorldComponentContentPaths');
    };

    log(`-> Manifest Up To Date! [Elapsed: ${new Date() - sTime}ms]`);
};


// Fetch basic bungie user details
var FetchBungieUserDetails = async () => {

    var components = JSON.parse(localStorage.getItem('components'));

    // Variables to check/store
    membershipType = sessionStorage.getItem('membershipType'),
    destinyMemberships = JSON.parse(sessionStorage.getItem('destinyMemberships')),
    destinyUserProfile = JSON.parse(sessionStorage.getItem('destinyUserProfile'));


    // If user has not loaded the page before, within current session
    if (!membershipType || !destinyMemberships || !destinyUserProfile) {

        // Fetch character information from API
        var resGetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/1/`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
        destinyMemberships = resGetMembershipsById.data.Response;
        membershipType = destinyMemberships.destinyMemberships[0].membershipType;
        var resProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/?components=200`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
        destinyUserProfile = resProfile.data.Response;
        sessionStorage.setItem('membershipType', membershipType);
        sessionStorage.setItem('destinyMemberships', JSON.stringify(destinyMemberships));
        sessionStorage.setItem('destinyUserProfile', JSON.stringify(destinyUserProfile));
    };
    
    // If user has loaded the page before, within current session
    if (membershipType || destinyMemberships || destinyUserProfile) {

        // Index response to display characters' info
        for (var item in destinyUserProfile.characters.data) {
            var char = destinyUserProfile.characters.data[item];
            if (char.classType == 0) {
                document.getElementById('charImg0').src = `https://www.bungie.net${char.emblemPath}`;
                document.getElementById('classType0').innerHTML = 'Titan';
            } else if (char.classType == 1) {
                document.getElementById('charImg1').src = `https://www.bungie.net${char.emblemPath}`;
                document.getElementById('classType1').innerHTML = 'Hunter';
            } else if (char.classType == 2) {
                document.getElementById('charImg2').src = `https://www.bungie.net${char.emblemPath}`;
                document.getElementById('classType2').innerHTML = 'Warlock';
            };
        };
    };

    log('-> Bungie User Fetched!');
};


// Load character from specific index
var LoadCharacter = async (classType) => {

    // Start load sequence
    StartLoad();

    // Validate tokens and other components
    await CheckComponents();

    // Elements
    document.getElementById('charSelect').style.display = 'none';
    document.getElementById('charDisplay').style.display = 'inline-block';

    // Globals
    var className,
        characterId,
        CharacterInventories,
        definitions = {},
        membershipType = sessionStorage.getItem('membershipType');

    // Get chosen character and save index  
    for (var item in destinyUserProfile.characters.data) {

        var char = destinyUserProfile.characters.data[item];
        if (char.classType === classType) {
            className = parseChar(classType);
            characterId = char.characterId;
        };
    };

    // Get manifest and return it
    await db.entries.where({keyName: 'DestinyInventoryItemDefinition'}).toArray()
    .then(massiveObj => {
        definitions = massiveObj[0].data;
    });

    // OAuth header guarantees a response
    var resCharacterInventories = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/?components=201`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
    CharacterInventories = resCharacterInventories.data.Response.characterInventories.data;

    // Iterate over CharacterInventories[characterId].items
    var charInventory = CharacterInventories[characterId].items,
        amountOfItems = 0,
        amountOfBounties = 0;

    
    // Loop over char inventory and filter out non bounty items
    // Append all bounty items to arr
    // Sort bounty items via uniqueStackLabel
    // Render to the DOM


    // --- {{{{{{READ ME}}}}}} --- //

    // Get all vendors that are actively selling bounties and formalize a list of names to compare against
    // Sort this list by alphabetical order
    // Compare player bounty items to this list and order bounties in the bounties arr according to the structure

    // Example:
    // bountieArr = ['transmog', 'gunsmith', 'strikes']
    // vendorsArr = ['banshee', 'ada-1', 'zavala']

    // We sort vendorsArr alhabetically, then order the bounties in bountiesArr relative to their respective vendors in vendorsArr

    // --- {{{{{{READ ME}}}}}} --- //
    

    // var foo = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMemberships.primaryMembershipId}/Character/${characterId}/Vendors/?components=400`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
    // var thing = foo.data.Response.vendors.data;
    // for (item in thing) {
    //     log(thing[item].vendorHash);
    // };

    // var bounties = {};
    // var keyNames = ['gunsmith', 'repeatable'];
    // // [bounties.gunsmith.repeatable].x => store x
    // // [bounties.gunsmith.daily].x => store x
    // for (item of charInventory) {
    //     // log(definitions[item.itemHash])
    //     // Is bounty
    //     if (definitions[item.itemHash].itemType == 26) {
    //         bounties[item.itemHash] = definitions[item.itemHash];
    //     };
    // };
    // log(bounties);


    // Loop over each item and check to see if item is bounty, true = push to arr, false = just ignore execution.
    charInventory.forEach(item => { definitions[item.itemHash].itemType === 26 ? (MakeElement(definitions[item.itemHash]), amountOfBounties++, log(definitions[item.itemHash])) : null; });

    // document.getElementById('subTitleOne').innerHTML = `${amountOfItems} Item(s) Indexed`;
    document.getElementById('subTitleTwo').innerHTML = `${amountOfBounties} Bounty(s) Found`;

    // Stop loading sequence
    StopLoad();
    log(`-> Indexed Character ${classType}!`);
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
    log('clicked')
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
// Check document is loaded
// @ {}
var CheckDocumentLoadState = () => {
    return document.readyState === 'complete' ? true : false;
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
// @obj {item}
var MakeElement = (item) => {

    const bottom = document.createElement('img'),
        top = document.createElement('div');

    // Create bottom element
    bottom.className = `entryData`;
    bottom.id = `${item.hash}`;
    document.querySelector('#charDisplay').appendChild(bottom);
    bottom.src = `https://www.bungie.net${item.displayProperties.icon}`;

    // Create element that overlays on mouseOver event
    top.className = `entryDataOverlay`;
    document.querySelector('#overlays').appendChild(top);
    top.innerHTML = item.displayProperties.name;

    // Watch for mouse movement and mouse leave
    bottom.addEventListener('mousemove', (e) => {
        top.style.display = 'block';
        top.style.marginLeft = `${e.pageX}px`;
        top.style.marginTop = `${e.pageY}px`;
    });
    bottom.addEventListener('mouseleave', (e) => {
        top.style.display = 'none';
    });
};


// 484780086
// 201433599
// 296614670
// var namesToMatch = ['trials', 'strikes', 'gunsmith', 'transmog'];
// ReturnDefinition(484780086, 'DestinyInventoryItemDefinition')
//     .then(res => {
//         // single item, sorted via hash
//         var bountySplitName = res.inventory.stackUniqueLabel.split('.');

//         bountySplitName.forEach(item => namesToMatch.includes(item) ? log(item, true) : log(item, false));

//     });

// Main
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

    // Processes done
    StopLoad();
    log(`-> OAuth Flow Done! [Elapsed: ${(new Date() - startTime)}ms]`);
})()
.catch(error => {
    console.error(error);
});







// todo

// - implement back to character select page
// - implement error catching and handling
// - make page for errors with options for user
//   ^ if loading takes longer ~10 seconds, and manifest has been fetched, display message saying to hard refresh