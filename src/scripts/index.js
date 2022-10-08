console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');


const log = console.log.bind(console),
      localStorage = window.localStorage,
      clientId = import.meta.env.CLIENT_ID;

// Generate state parameter
var GenerateState = (len) => {
    let result = ' ';
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};

// Check localStorage to determine if user has signed in already
var CheckSession = async () => {

    var acToken = JSON.parse(localStorage.getItem('accessToken')),
        rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        urlParam = new URLSearchParams(window.location.search);


    // Indicates if localStorage is missing an item(s)
    urlParam.get('rsToken') || urlParam.get('acToken') || urlParam.get('comps') ? localStorage.clear() : null;

    // Redirect user through if localStorage has items
    if (acToken && rsToken && comps) {
        log('-> Session Exists, Redirecting..');
        window.location.href = 'user.html';
    };
};

// Check for server availability
fetch('https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/4289226715/', {headers: {"X-API-Key": import.meta.env.API_KEY}})
    .catch((error) => {
        if (error.response) {

            console.error(error.response);
            if (error.response.status === 503) {
                document.getElementById('serverDeadContainer').style.display = 'block';
            };
        };
    });


// Main
window.addEventListener('DOMContentLoaded', () => {

    // Put version number in navbar
    document.getElementById('navBarVersion').innerHTML = `${import.meta.env.version}`;

    // Listen for authorize button click
    document.getElementById('btnAuthorize').addEventListener('click', () => {
        var stateCode = GenerateState(128);
        localStorage.setItem('stateCode', stateCode);
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}`;
    });

    // Check for a pre-existing session
    CheckSession();
});
