console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

// Verify state (discretely)
(() => {
    var uP=new URLSearchParams(window.location.search);
    var s=uP.get('state')
    if (s!=window.localStorage.getItem('stateCode')) {
        window.location.href=`http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
    };
});

// Explicit globals
var log = console.log.bind(console),
    localStorage = window.localStorage,
    startTime = new Date(),
    GetMembershipsById = {},
    UserProfile = {},
    LanguageType = 'en', // Get from browser info or sumn idfk lol
    ElementKeys = [];

// Default axios header
axios.defaults.headers.common = {
    "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d"
};

// Create IndexedDB database and URLSearchParams instance
var urlParams = new URLSearchParams(window.location.search);
var db = new Dexie('ManifestDefinitions');

// Configure the key for the database
db.version(1).stores({
    prefixes: `keyName`, // 'prefixes' contains urls for definitions keys
    entries: `keyName`   // 'entries' contains the definitions that reside on those urls
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
            else {
                console.error(err);
            };
        });
};


// Check tokens for expiration
var CheckTokens = async () => {
    
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
            })
            .catch(err => {
                if (res.response.data['error_description'] == 'AuthorizationCodeInvalid') {
                    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
                }
                else {
                    console.error(err);
                };
            });
        isAcTokenExpired ? log('-> Access Token Refreshed!') : log('-> Refresh Token Refreshed!');
    };
    log('-> Tokens Validated!');
};


// Main OAuth flow mechanism
var OAuthFlow = async () => {

    var rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        acToken = JSON.parse(localStorage.getItem('accessToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        authCode = urlParams.get('code'); // Only place where authCode must be fetched from

    // Wrap in try.except for error catching
    try {

        // If user has no localStorage items and the code is incorrect
        if (authCode && (!comps || !acToken || !rsToken)) {
            await BungieOAuth(authCode);
        }

        // If user has authorize beforehand, but came back through empty param URL
        else if (!authCode) {
            await CheckTokens();
        }

        // User comes back but authCode in URL is still present
        else if (authCode && (comps || acToken || rsToken)) {
            await CheckTokens();
        }

        // Otherwise, redirect the user back to the 'Authorize' page
        else {
            window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
        };
    } catch (error) {
        console.error(error);
        // display error page, with error and options for user
    };
};


// Validate and/or update manifest
var GetDestinyManifest = async () => {

    var ParseManifest = async (resManifest, bool) => {

        // Save prefixes for URLs
        var ManifestContent = resManifest.data.Response;
        for (property in ManifestContent) {
            db.prefixes.bulkPut([
                { keyName: property, data: ManifestContent[property] }
            ]);
        };

        // Get data from each prefix URL
        var defs = await db.table('prefixes').toArray(),
            defsURL = defs.find(item => item.keyName === 'jsonWorldContentPaths').data[LanguageType],
            defsResponse = await (await fetch(`https://www.bungie.net${defsURL}`)).json();
        for (property in defsResponse) {
            db.entries.bulkPut([
                { keyName: property, data: defsResponse[property] }
            ]);
        };
    };

    var manifestVersion = localStorage.getItem('destinyManifestVersion'),
        entries = await db.table('entries').toArray(),
        sTime = new Date();

    // Check for manifest version, if true replace all preixes with current ones
    var resManifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    if (entries.length === 0) {
        log('-> Manifest Is Not Present On This Browser, Fetching Manifest..');

        // User has the correct version in localStorage but has no indexedDB items
        await ParseManifest(resManifest, true);

    }
    else if (resManifest.data.Response.version !== manifestVersion) {
        log('-> Manifest Is Not Up To Date, Updating Manifest..');

        // Parse manifest response
        await ParseManifest(resManifest, false);
    };

    // Save manifest version number after either outcome
    localStorage.setItem('destinyManifestVersion', resManifest.data.Response.version);
    log(`-> Manifest Up To Date! [${new Date() - sTime}ms]`);
};


// Fetch basic bungie user details
var FetchBungieUserDetails = async (self, conf) => {

    var components = JSON.parse(localStorage.getItem('components')),
        membershipType;

    var resGetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/1/`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
    GetMembershipsById = resGetMembershipsById.data.Response;
    membershipType = GetMembershipsById.destinyMemberships[0].membershipType;

    var resProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${GetMembershipsById.primaryMembershipId}/?components=200`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
    UserProfile = resProfile.data.Response;


    for (var item in UserProfile.characters.data) {
        var char = UserProfile.characters.data[item];
        if (char.classType == 0) {
            // log(char.emblemPath);
            document.getElementById('charImg0').src = `https://www.bungie.net${char.emblemPath}`;
            document.getElementById('classType0').innerHTML = 'Titan';
        }else if (char.classType == 1) {
            // log(char.emblemPath);
            document.getElementById('charImg1').src = `https://www.bungie.net${char.emblemPath}`;
            document.getElementById('classType1').innerHTML = 'Hunter';
        }else if (char.classType == 2) {
            // log(char.emblemPath);
            document.getElementById('charImg2').src = `https://www.bungie.net${char.emblemPath}`;
            document.getElementById('classType2').innerHTML = 'Warlock';
        };
    };
    log('-> Bungie User Fetched!');
};


// Load character from specific index
var LoadCharacter = async (classType) => {
    
    // Start load sequence
    StartLoad();

    // Check tokens before anything else, in case user has not been validated for the duration of the accessToken timeout
    await CheckTokens();

    // Elements
    document.getElementById('charSelect').style.display = 'none';
    document.getElementById('charDisplay').style.display = 'inline-block';

    // Globals
    var className,
        characterId,
        CharacterInventories,
        definitions = {},
        membershipType = GetMembershipsById.destinyMemberships[0].membershipType;

    // Loop over available characters
    for (var item in UserProfile.characters.data) {

        var char = UserProfile.characters.data[item];
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
    var resCharacterInventories = await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${GetMembershipsById.primaryMembershipId}/?components=201`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`, "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d" }});
    CharacterInventories = resCharacterInventories.data.Response.characterInventories.data;

    // Iterate over CharacterInventories[characterId].items
    var charInventory = CharacterInventories[characterId].items,
        amountOfItems = 0,
        amountOfBounties = 0;
    

    for (item in charInventory) {
        for (prop in definitions) {

            if (definitions[prop].itemType === 26) {
                if (definitions[prop].hash === charInventory[item].itemHash) {

                    // // Create img tag for bounty image
                    // let imgDiv = document.createElement('img');
                    // imgDiv.setAttribute('class', 'entryData');
                    // document.querySelector('#charDisplay').appendChild(imgDiv);
                    // imgDiv.src = `https://www.bungie.net${definitions[prop].displayProperties.icon}`;

                    // // Create overlay div for mouse tracking event
                    // let divOverlay = document.createElement('img');
                    // divOverlay.setAttribute('id', `entryDataOverlay`);
                    // document.getElementById('charDisplay').insertBefore(divOverlay, imgDiv);
                    // divOverlay.src = `https://www.bungie.net${definitions[prop].displayProperties.icon}`;

                    // // Add event listeners to elements
                    // imgDiv.addEventListener('mousemove', (e) => {
                    //     divOverlay.style.display = 'block';
                    //     divOverlay.style.marginLeft = `${e.pageX}px`;
                    //     divOverlay.style.marginBottom = `${e.pageY}px`;
                    // });

                    // imgDiv.addEventListener('mouseleave', (e) => {
                    //     divOverlay.style.display = 'none';
                    // });

                    // Create img tag for bounty image
                    let bottom = document.createElement('img');
                    bottom.setAttribute('class', 'entryData');
                    document.querySelector('#charDisplay').appendChild(bottom);
                    // bottom.src = `https://www.bungie.net${definitions[prop].displayProperties.icon}`;
                    bottom.innerHTML = prop;

                    // Create overlay div for mouse tracking event
                    let top = document.createElement('img');
                    top.setAttribute('id', 'entryDataOverlay');
                    document.getElementById('charDisplay').insertBefore(top, bottom);
                    top.src = `https://www.bungie.net${definitions[prop].displayProperties.icon}`;

                    bottom.addEventListener('mousemove', (e) => {
                        top.style.display = 'block';
                        top.style.marginLeft = `${e.pageX}px`;
                        top.style.marginTop = `${e.pageY}px`;
                    });

                    bottom.addEventListener('mouseleave', (e) => {
                        top.style.display = 'none';
                    });

                    amountOfBounties++;
                };
            };
        };
        amountOfItems++;
    };
    document.getElementById('subTitleOne').innerHTML = `${amountOfItems} Item(s) Indexed`;
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
    if (classType === 0) {
        r='Titan'
    }else if (classType === 1) {
        r='Hunter'
    }else if (classType === 2) {
        r='Warlock'
    }else{ console.error('could not parse character, parseChar() @function'); };
    return r;
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
// @ {}
var ReturnDefinitions = async () => {
    
    // Get manifest and return it
    await db.entries.where({keyName: 'DestinyInventoryItemDefinition'}).toArray()
    .then(massiveObj => {
        return massiveObj;
    });
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
// Takes position of cursour and applies overlayElement to cursor
// @mouse.obj {e}, @document.element {element}, @document.element {overlayElement}
var TrackCursour = (e, element, overlayElement) =>{
    log(overlayElement)
    // overlayElement.style.left = `${e.pageX}px`;
    // overlayElement.style.top = `${e.pageY}px`;
};
// Make random key and compare if it exists if(!true) make key again etc.
// @int {len}
var RandKey = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    ElementKeys.indexOf(result) ? RandKey(len) : ElementKeys.push(result);
};



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
    log(`-> OAuth Flow Done! [${(new Date() - startTime)}ms]`);
    log(`-> Awaiting User Input..`);
})()
.catch(error => {
    log('-> Destiny API Is Not Available Right Now...');
});









// todo

// - save chosen character index when refreshing - session storage maybe
// - implement error catching and handling
// - make page for errors with options for user
// - change url to remove state and code params, dont refresh page after or make a way for it to ignore this process in the OAuthFlow
// ^ above is to make the url look nice after authorization is done and will also apply when the user comes back to the website and has been authed before
// ^ maybe middleware between BungieOAuth and CheckTokens...
// - how to "duplicate" elements or have an undefined amouunt of elements with the same style properties
// - if loading takes longer ~10 seconds, and manifest has been fetched, display message saying to refresh