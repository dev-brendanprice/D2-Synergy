console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

var log = console.log.bind(console),
    localStorage = window.localStorage;


// Generate state parameter
var GenerateState = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};

// Check tokens for expiration
var CheckSession = () => {
    
    var acToken = JSON.parse(localStorage.getItem('accessToken')),
        rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        AuthConfig = {
            headers: {
                Authorization: `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
                "Content-Type": "application/x-www-form-urlencoded",
            }
        };
    
    
    if (acToken && rsToken && comps) {
        // Redirect user to user.html if they had already logged in
        window.location.href = 'user.html';
    };

    log('-> Tokens Validated!');
};



window.addEventListener('DOMContentLoaded', () => {

    // Check tokens for expiration
    CheckSession();

    document.getElementById('btnAuthorize').addEventListener('click', () => {
        var stateCode = GenerateState(128);
        localStorage.setItem('stateCode', stateCode);
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code&state=${stateCode}`;
    });
});