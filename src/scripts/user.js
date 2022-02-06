console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Please report any errors to @beru2003 on Twitter.')
var log = console.log.bind(console);
var localStorage = window.localStorage;


const AuthorizeBungie = async () => {

    var AuthorizationCode = window.location.search.replace('?code=','');
    try {
        if (AuthorizationCode && !localStorage.getItem('components')) {

            // If user does not have localStorage items
            var AccessToken = {},
            RefreshToken = {},
            components = {};
            const AxiosConfig = {
                headers: {
                    "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            };
    
            await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AxiosConfig)
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
        };
    } 
    catch (error) {
        log(error);
    };

    // Check if user entered the URL in-directly
    try {
        if (AuthorizationCode && localStorage.getItem('components')) {

            // Refresh tokens completley
            var accessTokenKey = JSON.parse(localStorage.getItem('accessToken'));
            var components = JSON.parse(localStorage.getItem('components'));
            var refreshTokenKey = JSON.parse(localStorage.getItem('refreshToken'));
    
            if (accessTokenKey && refreshTokenKey && components) {
                if (Math.round(new Date().getTime()/1000) - accessTokenKey['inception'] == accessTokenKey['expires_in']) {
                    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
                }
                else {
                    log('-> LocalStorage items validated!');
                    return true;
                };
            };
        }
        else if (!localStorage.getItem('components')) {
            // User entered the URL directly
            window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
        };
    } catch (error) { log(error); };
};


const GetDestinyManifest = async () => {
    var accessTokenKey = JSON.parse(localStorage.getItem('accessToken'));
    const AxiosConfig = {
        headers: {
            "X-API-Key": 'e62a8257ba2747d4b8450e7ad469785d',
            Authorization: `Bearer ${accessTokenKey['value']}`
        }
    };

    const DestinyManifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`, AxiosConfig);
    localStorage.setItem('destinyManifestVersion', JSON.stringify(DestinyManifest['data']['Response']['version']));

    log('-> Manifest (Version) Accquired!');
};


const FetchBungieUserDetails = async () => {
    var components = JSON.parse(localStorage.getItem('components')),
    accessTokenKey = JSON.parse(localStorage.getItem('accessToken'));
    var userComponents = {};
    const AxiosConfig = {
        headers: {
            "X-API-Key": 'e62a8257ba2747d4b8450e7ad469785d',
            Authorization: `Bearer ${accessTokenKey['value']}`
        }
    };

    var GetBungieNetUserById = await axios.get(`https://www.bungie.net/Platform/User/GetBungieNetUserById/${components['membership_id']}/`, AxiosConfig);
    userComponents['BungieNetUser'] = GetBungieNetUserById.data['Response'];

    var GetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/0/`, AxiosConfig);
    userComponents['DestinyUserMemberships'] = GetMembershipsById.data['Response']['destinyMemberships'];

    // Index for primaryMembershipId and membershipType
    var PrimaryMembershipId = userComponents['DestinyUserMemberships'][0]['membershipId'];
    var MembershipType = userComponents['DestinyUserMemberships'][0]['membershipType'];

    var GetProfileComponents = await axios.get(`https://www.bungie.net/Platform/Destiny2/${MembershipType}/Profile/${PrimaryMembershipId}/?components=200`, AxiosConfig);
    userComponents['DestinyUserCharacters'] = GetProfileComponents.data['Response'];
    localStorage.setItem('userComponents', JSON.stringify(userComponents));
};


const ParseUserCharacters = async () => {
    var userComponents = JSON.parse(localStorage.getItem('userComponents')),
    CharacterIndex = Object.values(userComponents['DestinyUserCharacters']);

    document.getElementById('displayName').innerHTML = userComponents['BungieNetUser']['uniqueName'];

    // if (CharacterIndex[0]['emblemBackgroundPath']) {
    //     document.getElementById('userEmblem1').style.display = 'inline';
    //     document.getElementById('emblemPath1').src = `https://www.bungie.net${CharacterIndex[0]['emblemBackgroundPath']}`;
    // };
    // if (CharacterIndex[1]['emblemBackgroundPath']) {
    //     document.getElementById('userEmblem2').style.display = 'inline';
    //     document.getElementById('emblemPath2').src = `https://www.bungie.net${CharacterIndex[1]['emblemBackgroundPath']}`;
    // };
    // if (CharacterIndex[2]['emblemBackgroundPath']) {
    //     document.getElementById('userEmblem3').style.display = 'inline';
    //     document.getElementById('emblemPath3').src = `https://www.bungie.net${CharacterIndex[2]['emblemBackgroundPath']}`;
    // };
};


const GetLocalStorageSize = async () => {
    
    var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;

    while (i--) { values.push(localStorage.getItem(keys[i])); };

    log('[Usage Bytes]: ', encodeURI(JSON.stringify(values)).split(/%..|./).length - 1);
};


const GetUserClan = async () => {
    var accessTokenKey = JSON.parse(localStorage.getItem('accessToken'));
    var components = JSON.parse(localStorage.getItem('components'));
    var userComponents = JSON.parse(localStorage.getItem('userComponents'));
    const AxiosConfig = {
        headers: {
            "X-API-Key": 'e62a8257ba2747d4b8450e7ad469785d',
            Authorization: `Bearer ${accessTokenKey['value']}`
        }
    };

    var MembershipType = userComponents['DestinyUserMemberships'][0]['membershipType'];

    const LinkedProfiles = await axios.get(`https://www.bungie.net/Platform/Destiny2/${MembershipType}/Profile/${components['membership_id']}/LinkedProfiles/?getAllMemberships=true`, AxiosConfig);
    var LinkedMembershipType = LinkedProfiles['data']['Response']['bnetMembership']['membershipType'];

    const GetGroupsForMember = await axios.get(`https://www.bungie.net/Platform/GroupV2/User/${LinkedMembershipType}/${components['membership_id']}/0/1/`, AxiosConfig);

    userComponents['DestinyUserClan'] = GetGroupsForMember['data']['Response']['results'][0]['group'];
    localStorage.setItem('userComponents', JSON.stringify(userComponents));
};


(async () => {
    // var userComponents = JSON.parse(localStorage.getItem('userComponents')),
    // accessTokenKey = JSON.parse(localStorage.getItem('accessToken')),
    // refreshTokenKey = JSON.parse(localStorage.getItem('refreshToken')),
    // components = JSON.parse(localStorage.getItem('components'));

    // Authorization Process
    if (await AuthorizeBungie()) {

        // Utils n shit
        await GetDestinyManifest();
        await FetchBungieUserDetails();
        // await GetLocalStorageSize();

        // User Data
        await ParseUserCharacters();
        // await GetUserClan();
        
        // Stop loading sequence
        document.getElementById('slider').style.display = 'none';
        log('-> API Fetch Complete!');
    } 
    else {
        // 404
    };
})();