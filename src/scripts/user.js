console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
var log = console.log.bind(console);
var localStorage = window.localStorage;


const AuthorizeBungie = async () => {
    var AuthorizationCode = window.location.search.replace('?code=','');
    var components = {};
    var AxiosConfig = {
        headers: {
            "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
            "Content-Type": "application/x-www-form-urlencoded",
        }
    };
    
    try {
        await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AxiosConfig)
        .then(res => {
            components = res.data;
            components['authorization_code'] = AuthorizationCode;
            localStorage.setItem('components', JSON.stringify(components));
        });
    }
    catch (error) {
        log('InvalidParams: @{Resetting Params}');
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
    };
};


const FetchBungieUserDetails = async () => {
    var components = JSON.parse(localStorage.getItem('components'));
    var bungieNetUser = {};
    var AxiosConfig = {
        headers: {
            "X-API-Key": 'e62a8257ba2747d4b8450e7ad469785d',
            Authorization: `Bearer ${components['access_token']}`
        }
    };

    const GetBungieNetUserById = await axios.get(`https://www.bungie.net/Platform/User/GetBungieNetUserById/${components['membership_id']}/`, AxiosConfig);
    bungieNetUser['BungieNetUser'] = GetBungieNetUserById.data['Response'];

    const GetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${components['membership_id']}/0/`, AxiosConfig);
    bungieNetUser['DestinyUserMemberships'] = GetMembershipsById.data['Response'];

    // Find the primarymembershipid and membershiptype for the top most entry (unkown if this is rigid)
    var PrimaryMembershipId = bungieNetUser['DestinyUserMemberships']['destinyMemberships'][0]['membershipId'];
    var MembershipType = bungieNetUser['DestinyUserMemberships']['destinyMemberships'][0]['membershipType'];

    const GetProfileComponents = await axios.get(`https://www.bungie.net/Platform/Destiny2/${MembershipType}/Profile/${PrimaryMembershipId}/?components=200`, AxiosConfig);
    bungieNetUser['DestinyUserComponents'] = GetProfileComponents.data['Response'];
    localStorage.setItem('bungieNetUser', JSON.stringify(bungieNetUser));

    log('API Fetch Complete!');
};


const ParseUserCharacters = async () => {
    var bungieNetUser = JSON.parse(localStorage.getItem('bungieNetUser'));
    var CharacterIndex = Object.values(bungieNetUser['DestinyUserComponents']['characters']['data']);

    document.getElementById('displayName').innerHTML = bungieNetUser['BungieNetUser']['uniqueName'];

    if (CharacterIndex[0]['emblemBackgroundPath']) {
        document.getElementById('userEmblem1').style.display = 'inline';
        document.getElementById('emblemPath1').src = `https://www.bungie.net${CharacterIndex[0]['emblemBackgroundPath']}`;
    };
    if (CharacterIndex[1]['emblemBackgroundPath']) {
        document.getElementById('userEmblem2').style.display = 'inline';
        document.getElementById('emblemPath2').style.display = 'inline';
        document.getElementById('emblemPath2').src = `https://www.bungie.net${CharacterIndex[1]['emblemBackgroundPath']}`;
    };
    if (CharacterIndex[2]['emblemBackgroundPath']) {
        document.getElementById('userEmblem3').style.display = 'inline';
        document.getElementById('emblemPath3').style.display = 'inline';
        document.getElementById('emblemPath3').src = `https://www.bungie.net${CharacterIndex[2]['emblemBackgroundPath']}`;
    };
};


const Main = async () => {
    if (window.location.search.replace('?code=','')) {

        // Authorization Process
        await AuthorizeBungie();
        await FetchBungieUserDetails();
    
        // Fetching User Data Process
        await ParseUserCharacters();
    } 
    else {
        // -- Do 404.html or make an alternate authorization path -- //

        // log('Authorization Failed, Redirecting back to root..')
        // window.location.href = 'http://localhost:4645/D2Synergy-v3.0/src/views/app.html';
    };
};

Main();