console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

var log = console.log.bind(console),
    localStorage = window.localStorage,
    clientId = 38074;


// Generate state parameter
var GenerateState = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};

// Check localStorage to determine if user has signed in already
var CheckSession = () => {

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


// Check for session
CheckSession();


// Main
window.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btnAuthorize').addEventListener('click', () => {
        var stateCode = GenerateState(128);
        localStorage.setItem('stateCode', stateCode);
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}`;
    });
});
