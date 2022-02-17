console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Please report any errors to @beru2003 on Twitter.');

var log = console.log.bind(console),
    localStorage = window.localStorage,
    startTime = new Date(),
    isPageLoaded = false,
    GetMembershipsById = {},
    Characters = {};

axios.defaults.headers.common = {
    "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d",
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

var AuthorizeBungie = async () => {

    var AuthorizationCode = window.location.search.replace('?code=','');
    try {
        if (AuthorizationCode && !localStorage.getItem('components')) {

            var AccessToken = {}, 
            RefreshToken = {},
            components = {};
            const AuthorizationConfig = {
                headers: {
                    "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            };
    
            await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AuthorizationConfig)
            .then(res => {
                var data = res.data;
    
                components['membership_id'] = data['membership_id'];
                components['token_type'] = data['token_type'];
                components['authorization_code'] = AuthorizationCode;
    
                AccessToken['inception'] = Math.round(new Date().getTime()/1000);
                AccessToken['expires_in'] = data['expires_in'];
                AccessToken['value'] = data['access_token'];
    
                RefreshToken['inception'] = Math.round(new Date().getTime()/1000);
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


var GetDestinyManifest = async () => {
    try {
        const DestinyManifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
        localStorage.setItem('destinyManifestVersion', JSON.stringify(DestinyManifest['data']['Response']['version']));
        log('-> Manifest (Version) Accquired!');
    } catch (error) { window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`; };
};


var FetchBungieUserDetails = async (self, conf) => {

    var components = JSON.parse(localStorage.getItem('components'));


    resGetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/1/`);
    GetMembershipsById = resGetMembershipsById.data.Response;
    // log(GetMembershipsById.data.Response.destinyMemberships[0]);

    resCharacters = await axios.get(`https://www.bungie.net/Platform/Destiny2/1/Profile/${GetMembershipsById.destinyMemberships[0].membershipId}/?components=200`);
    Characters = resCharacters.data.Response.characters.data
    // log(resCharacters.data.Response.characters.data);


    for (item in Characters) {
        var char = Characters[item];
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

};


var LoadCharacter = async (classType) => {
    log(classType);
};


var GetLsSize = async () => {
    var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;

    while (i--) { values.push(localStorage.getItem(keys[i])); };

    log('[Usage Bytes]: ', encodeURI(JSON.stringify(values)).split(/%..|./).length - 1);
};


(async () => {

    // Authorize user with bungie
    await AuthorizeBungie();

    // Configure content
    await GetDestinyManifest();
    await FetchBungieUserDetails();
    
    // await GetLsSize();

    // Stop loading sequence
    // Jank way to do it but apparently setTimeout() never fires before DOMContent is loaded
    setTimeout(() => {
        isPageLoaded ? document.getElementById('slider').style.display = 'none' : null;
    });

    log('-> API Fetch Complete!');

    log(`Runtime: ${(new Date() - startTime)}ms`);
})();