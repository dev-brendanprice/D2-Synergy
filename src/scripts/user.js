console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

var log = console.log.bind(console),
    localStorage = window.localStorage,
    startTime = new Date(),
    isPageLoaded = false,
    GetMembershipsById = {},
    UserProfile = {};

    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// Default axios header
axios.defaults.headers.common = {
    "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d"
};

document.addEventListener('DOMContentLoaded', () => {
    isPageLoaded = true;

    // Check to see if users' token has expired
    // Idk if this needed in the long run
    // var components = localStorage.getItem('components'),
    //     accessTokenKey = localStorage.getItem('accessToken'),
    //     refreshTokenKey = localStorage.getItem('refreshToken');
        
    // if (components && accessTokenKey && refreshTokenKey) {
    //     if (accessTokenKey['expires_in']+accessTokenKey['inception'] > new Date()) {
    //         localStorage.clear();
    //     } 
    //     else if (accessTokenKey['expires_in']+accessTokenKey['inception'] < new Date()) {
    //         // let user through
    //     };
    // };
});


// var db = new Dexie("ManifestDefinitions");

// // DB with single table 'entries'
// db.version(1).stores({
//   entries: `keyName`
// });

// // Adding values to the table 'entries'
// db.entries.bulkPut([
//   { keyName: 'DestinyMobileGlobalDefinitions', name: "Josephine", age: 21 },
//   { keyName: 'urmum', name: "lmfao", age: 69420 }
// ]);


// GET VALUES
// db.table('entries').toArray()
//     .then(res => {
//         log(res);
//     });

// CHANGE VALUES
// db.entries.put({keyName: 'urmum', name: 'cum'});



var AuthorizeBungie = async () => {

    var AuthorizationCode = window.location.search.replace('?code=', '');
    try {
        if (AuthorizationCode && !localStorage.getItem('components')) {

            var AccessToken = {}, RefreshToken = {}, components = {};
            const AuthorizationConfig = {
                headers: {
                    Authorization: `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            };

            await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AuthorizationConfig)
                .then(res => {
                    var data = res.data;

                    components['membership_id'] = data['membership_id'];
                    components['token_type'] = data['token_type'];
                    components['authorization_code'] = AuthorizationCode;

                    AccessToken['inception'] = Math.round(new Date().getTime() / 1000);
                    AccessToken['expires_in'] = data['expires_in'];
                    AccessToken['value'] = data['access_token'];

                    RefreshToken['inception'] = Math.round(new Date().getTime() / 1000);
                    RefreshToken['expires_in'] = data['refresh_expires_in'];
                    RefreshToken['value'] = data['refresh_token'];

                    localStorage.setItem('accessToken', JSON.stringify(AccessToken));
                    localStorage.setItem('components', JSON.stringify(components));
                    localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));
                });

            log('-> Authorized with Bungie.net!');
        }
        else if (!AuthorizationCode || !localStorage.getItem('components')) {
            window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
        };
    }
    catch (error) {
        window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
    };


    // Check if user entered the URL in-directly
    // Check against userAuth localStorage variable to see if user has authorized before
    //  and is entering the path directly
    // try {
    //     if (AuthorizationCode && localStorage.getItem('components')) {
    //         // Refresh tokens completley
    //         var accessTokenKey = JSON.parse(localStorage.getItem('accessToken'));
    //         var components = JSON.parse(localStorage.getItem('components'));
    //         var refreshTokenKey = JSON.parse(localStorage.getItem('refreshToken'));
    //         if (accessTokenKey && refreshTokenKey && components) {
    //             if (Math.round(new Date().getTime()/1000) - accessTokenKey['inception'] == accessTokenKey['expires_in']) {
    //                 window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
    //             }
    //             else {
    //                 log('-> LocalStorage items validated!');
    //                 // isUserAuthorized = true;
    //                 // localStorage.setItem('userAuthorized', true);
    //             };
    //         };
    //     }
    //     else if (!localStorage.getItem('components')) {
    //         log(`Line 82`)
    //         // User entered the URL directly
    //         // window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
    //     };
    // } catch (error) { 
    //     log(`Line 86: ${error}`);
    // };
};


var UpdateIndexedDB = async (obj) => {

    // Create database
    var db = new Dexie("ManifestDefinitions");

    // Configure the key
    db.version(1).stores({
        entries: `keyName`
    });

    // Put objects into table
    db.entries.bulkPut([
        // { keyName: }
    ]);
    log('bruh')
};
var GetDestinyManifest = async () => {

    // Create database
    var db = new Dexie("ManifestDefinitions");

    // Configure the key
    db.version(1).stores({
        entries: `keyName`
    });

    var manifestVersion = localStorage.getItem('destinyManifestVersion'),
        sTime = new Date(),
        ManifestContent = {};

    var resManifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    if (resManifest.data.Response.version != manifestVersion) {
        log('-> New Manifest Version Available..');

        ManifestContent = resManifest.data.Response;
        // arrToCast = {};
        for (property in ManifestContent) {
            // arrToCast[property] = ManifestContent[property];
            // Put objects into table
            db.entries.bulkPut([
                { keyName: property, data: ManifestContent[property] }
            ]);
        };
        // log(arrToCast)
        // await UpdateIndexedDB(arrToCast);

        localStorage.setItem('destinyManifestVersion', resManifest.data.Response.version);
    };

    log(`-> Manifest Upto Date! [${new Date() - sTime}ms]`);

};


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


var LoadCharacter = async (classType) => {
    
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

    
    // iterate over this
    var foo = CharacterInventories[characterId].items;

    for (let i=0; i<foo.length; i++) {
        // insert comparison against manifest here
        // var bar = await QueryItemHash(foo[0].itemHash);
    };
};


// -- [Modules] -- 

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
    var res = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}` }});
    return res;
};





// Main
(async () => {

    // Authorize user with bungie
    await AuthorizeBungie();

    // Configure content
    await GetDestinyManifest();
    await FetchBungieUserDetails();
    
    // await GetLsSize(localStorage);

    // Stop loading sequence
    // Jank way to do it but apparently setTimeout() never fires before DOMContent is loaded
    setTimeout(() => {
        isPageLoaded === true ? document.getElementById('slider').style.display = 'none' : null;
    });

    log(`-> OAuth Flow Done! [${(new Date() - startTime)}ms]`);
})();