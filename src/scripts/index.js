import { MakeRequest } from './modules/MakeRequest.js';

console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @_devbrendan on Twitter.');

const log = console.log.bind(console);
const localStorage = window.localStorage;
const clientId = import.meta.env.CLIENT_ID;
const apiKey = import.meta.env.API_KEY;

// Check for a pre-existing session
CheckSession();



// Check localStorage to determine if user has signed in already
async function CheckSession() {

    const acToken = JSON.parse(localStorage.getItem('accessToken'));
    const rsToken = JSON.parse(localStorage.getItem('refreshToken'));
    const comps = JSON.parse(localStorage.getItem('components'));


    // Indicates if localStorage is missing an item(s)
    if (!(rsToken && acToken && comps)) {
        localStorage.clear();
    };

    // Redirect user through if localStorage has items
    if (acToken && rsToken && comps) {
        log('-> Session Exists, Redirecting..');
        window.location.href = 'user';
    };
};


// Generate a random string for state code
// @int {len}
function GenerateRandomString(len) {

    let result = ' ';
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};


// Check for outage from previous redirect using the isOutage query
function CheckForOutageViaParams() {

    let urlParams = new URLSearchParams(window.location.search);
    let isOutage = urlParams.get('isOutage');

    if (isOutage) {
        document.getElementById('serverDeadContainer').style.display = 'block';
    };
};


// Listen for DOM load
window.addEventListener('DOMContentLoaded', function () {

    // Check for outage via the query params of a previous redirect
    CheckForOutageViaParams();

    const stateCode = GenerateRandomString(128);

    // Put version number in navbar
    document.getElementById('navBarVersion').innerHTML = `${import.meta.env.version}`;

    // Redirect user to Bungie.net on a clean slate
    document.getElementById('btnAuthorize').addEventListener('click', () => {
        localStorage.setItem('stateCode', stateCode);
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}&randomqueryparam=${GenerateRandomString(128)}`;
    });

    // Check for server availability, else do error (error code inside MakeRequest too)
    MakeRequest(`https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100`, {headers: {'X-API-Key': apiKey}}, {scriptOrigin: 'index', avoidCache: true})
    .catch((error) => {
        console.error(error);
    });

    // Omit query params from URL on reload
    window.history.pushState({}, window.location.host, 'welcome');
});
