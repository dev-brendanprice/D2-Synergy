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

var log = console.log.bind(console),
    localStorage = window.localStorage,
    startTime = new Date(),
    GetMembershipsById = {},
    UserProfile = {};

// Default axios header
axios.defaults.headers.common = {
    "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d"
};

// Create IndexedDB database and URLSearchParams instance
var urlParams = new URLSearchParams(window.location.search);
var db = new Dexie('ManifestDefinitions');

// Configure the key for the database
db.version(1).stores({
    prefixes: `keyName`,
    entries: `keyName`
});
// 'prefixes' contains urls for definitions keys
// 'entries' contains the definitions that reside on those urls



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
        .catch(res => {
            if (res.response.data['error_description'] == 'AuthorizationCodeInvalid') {
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
    }
    catch (err) {
        console.error(err);
        // display error page, with error and options for user
    };
};


// Validate and/or update manifest
var GetDestinyManifest = async () => {

    var manifestVersion = localStorage.getItem('destinyManifestVersion'),
        sTime = new Date(),
        ManifestContent = {},
        LanguageType = 'en';

    // Check for manifest version, if true replace all preixes with current ones
    var resManifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    if (resManifest.data.Response.version != manifestVersion) {
        log('-> Manifest Is Not Up To Date, Reforming Manifest..');

        // Get prefixes for definition urls
        ManifestContent = resManifest.data.Response;
        for (property in ManifestContent) {
            db.prefixes.bulkPut([
                { keyName: property, data: ManifestContent[property] }
            ]);
        };

        // Get props data from definitions urls
        var defs = await db.table('prefixes').toArray();
        var defsURL = defs.find(item => item.keyName == 'jsonWorldContentPaths').data[LanguageType];
        var defsResponse = await (await fetch(`https://www.bungie.net${defsURL}`)).json();
        for (property in defsResponse) {
            db.entries.bulkPut([
                { keyName: property, data: defsResponse[property] }
            ]);
        };

        localStorage.setItem('destinyManifestVersion', resManifest.data.Response.version);
    };

    log(`-> Manifest Up To Date! [${new Date() - sTime}ms]`);
};


// Fetch basic bungie user details
var FetchBungieUserDetails = async (self, conf) => {

    var components = JSON.parse(localStorage.getItem('components'));

    var resGetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/1/`);
    GetMembershipsById = resGetMembershipsById.data.Response;

    var resProfile = await axios.get(`https://www.bungie.net/Platform/Destiny2/1/Profile/${GetMembershipsById.primaryMembershipId}/?components=200`);
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
    
    // Check tokens before anything else, in case user has not been validated for the duration of the accessToken timeout
    await CheckTokens();

    // Elements
    document.getElementById('charSelect').style.display = 'none';
    document.getElementById('charDisplay').style.display = 'inline-block';

    // Globals
    var className,
        characterId,
        CharacterInventories;


    // Loop over available characters
    for (var item in UserProfile.characters.data) {

        var char = UserProfile.characters.data[item];
        if (char.classType === classType) {
            className=parseChar(classType);
            characterId=char.characterId;
        };
    };


    // OAuth header guarantees a response
    var resCharacterInventories = await axios.get(`https://www.bungie.net/Platform/Destiny2/1/Profile/${GetMembershipsById.primaryMembershipId}/?components=201`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}` }});
    CharacterInventories = resCharacterInventories.data.Response.characterInventories.data;

    // Iterate over CharacterInventories[characterId]
    // var inventory = CharacterInventories[characterId];
    for (item in CharacterInventories[characterId]) {
        log(CharacterInventories[characterId][item])
    };
    log(new Date() - startTime);
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
// Query item against manifest via an itemHash
// @int {itemHash}
var QueryItemHash = async (itemHash) => {
    
    // Get prefixes from indexedDB and compare against to get item definitions
    
};
// Check document is loaded
// @ {}
var CheckDocumentLoadState = () => {
    return document.readyState === 'complete' ? true : false;
};
// Start loading sequence
// @ {}
var StartLoad = () => {
    if (CheckDocumentLoadState()) {
        document.getElementById('slider').style.display = 'auto';
    };
};
// Stop loading sequence
// @ {}
var StopLoad = () => {
    if (CheckDocumentLoadState()) {
        document.getElementById('slider').style.display = 'none';
    };
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
})();




// todo

// - implement error catching and handling
// - make page for errors with options for user
// - change url to remove state and code params, dont refresh page after or make a way for it to ignore this process in the OAuthFlow
// ^ above is to make the url look nice after authorization is done and will also apply when the user comes back to the website and has been authed before
// ^ maybe middleware between BungieOAuth and CheckTokens...
// - how to "duplicate" elements or have an undefined amouunt of elements with the same style properties
// - if loading takes longer ~10 seconds, and manifest has been fetched, display message saying to refresh