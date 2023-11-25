import { MakeRequest } from './modules/MakeRequest.js';
import { LoadPartialProfile } from './modules/LoadPartialProfile.js';
import { createCellDat } from './modules/CreateCellData.js';
import { playerids } from '.././data/supporterMessages.js';
import axios from 'axios';

console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @_brendanprice on Twitter.');

const log = console.log.bind(console);
const localStorage = window.localStorage;
const clientId = import.meta.env.CLIENT_ID;
const apiKey = import.meta.env.API_KEY;

// Check for a pre-existing session
CheckSession();


// Check for empty cached profiles object in localStorage cache
if (!JSON.parse(localStorage.getItem('cachedprofiles'))) {
    localStorage.setItem('cachedprofiles', '[]');
};


// Request definitions objects (one-off thing, does not affect user.js)
let navlang = window.navigator.language.split('-')[0];
let manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
let components = manifest.data.Response.jsonWorldComponentContentPaths[navlang];

let seasonDefinitions = await axios.get(`https://www.bungie.net${components.DestinySeasonDefinition}`);
seasonDefinitions = seasonDefinitions.data;
let seasonPassDefinitions = await axios.get(`https://www.bungie.net${components.DestinySeasonPassDefinition}`);
seasonPassDefinitions = seasonPassDefinitions.data;
let commendationsNodeDefinitions = await axios.get(`https://www.bungie.net${components.DestinySocialCommendationNodeDefinition}`);
commendationsNodeDefinitions = commendationsNodeDefinitions.data;
let recordDefinitions = await axios.get(`https://www.bungie.net${components.DestinyRecordDefinition}`);
recordDefinitions = recordDefinitions.data;

// Make obj
let definitions = {
    seasonDefinitions: seasonDefinitions,
    seasonPassDefinitions: seasonPassDefinitions,
    commendationsNodeDefinitions: commendationsNodeDefinitions,
    recordDefinitions: recordDefinitions
};


// Load support page DOM content
loadSupportPageContent(definitions);



// Check localStorage to determine if user has signed in already
async function CheckSession() {

    const acToken = JSON.parse(localStorage.getItem('accessToken'));
    const rsToken = JSON.parse(localStorage.getItem('refreshToken'));
    const comps = JSON.parse(localStorage.getItem('components'));

    // Redirect user through if localStorage has items
    if (acToken && rsToken && comps) {
        log('-> Session Exists, Redirecting..');
        window.location.href = 'user';
    };
};


// Load support page DOM content
async function loadSupportPageContent(definitions) {

    // Count of rows on grid
    let rows = 6; // Edit this value to change cell count
    let n = rows * 17;

    let playeridCounter = 0; // Count index of current playerid

    // Arr with numbers, denoting to random coords on the grid
    let ranarr = [];
    for (let i=0; i<playerids.length; i++) {

        // Ensure that no duplicate numbers are pushed
        function addInt() {
            let ranint = Math.floor(Math.random() * n);
            if (ranarr.includes(ranint)) {
                addInt();
            } else ranarr.push(ranint);
        };
        addInt();
    };


    // Build grid, checking if i (ranarr[i]) is a populated cell
    for (let i=0; i<n; i++) {

        if (!ranarr.includes(i)) {

            // Create element
            let img = document.createElement('img');

            // Add style and content to element
            img.classList = 'support-cell';
            img.src = './static/images/UI/non_loaded_cell.png';

            // Add element to DOM
            document.getElementsByClassName('support-page-grid-container')[0].append(img);
        }
        else {

            // Request user (partial) data
            const playerid = playerids[playeridCounter];

            // Check if user is in cache, if not -> add to cache
            const cacheArr = JSON.parse(localStorage.getItem('cachedprofiles'));
            const memshipArr = cacheArr.map(v => v.profile.memship);
            
            if (!memshipArr.includes(playerid)) {

                // Request profile
                const profile = await LoadPartialProfile(playerid, definitions);
                
                // Add user to cache
                const newcacheArr = [
                    ...JSON.parse(localStorage.getItem('cachedprofiles') ?? '[]'),
                    {profile}
                ];
                localStorage.setItem('cachedprofiles', JSON.stringify(newcacheArr));

                // Create cell data (DOM elements: Cells, onHover)
                createCellDat(profile);
            }
            else {

                // Find corresponding profile object in cache
                let cache = Object.values(JSON.parse(localStorage.getItem('cachedprofiles')));
                let profile = cache.filter(v => v.profile.memship === playerid)[0].profile;

                // Create cell data (DOM elements: Cells, onHover)
                createCellDat(profile);
            };

            playeridCounter++; // Increment playerid counter
        };

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


// Listen for page ready state
log(document.readyState !== 'loading' ? 'Ready' : 'Unready');
if (document.readyState !== 'loading') {

    // Check for outage via the query params of a previous redirect
    // CheckForOutageViaParams();
    // Put version number in navbar
    document.getElementById('version-text').innerHTML = `Alpha ${import.meta.env.version}`;

    // Redirect user to bungie.net sign in portal
    const stateCode = GenerateRandomString(128);
    const authButtons = document.getElementsByClassName('auth-button');
    for (let btn of authButtons) {
        btn.addEventListener('click', () => {
            localStorage.setItem('stateCode', stateCode);
            window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}&randomqueryparam=${GenerateRandomString(128)}`;
        });
    };


    // Support/Home page nav button (vice versa)
    document.getElementsByClassName('supportbox-dialogue-main-container')[0].addEventListener('click', function() {

        // Hide content container
        document.getElementById('center-con').style.display = 'none';
        document.getElementById('center-support').style.display = 'flex';

        // Show/hide buttons
        document.getElementsByClassName('supportbox-dialogue-main-container')[0].style.display = 'none';
        document.getElementsByClassName('supportbox-dialogue-goback-container')[0].style.display = 'flex';
    });
    document.getElementsByClassName('supportbox-dialogue-goback-container')[0].addEventListener('click', function() {

        // Hide content container
        document.getElementById('center-con').style.display = 'flex';
        document.getElementById('center-support').style.display = 'none';

        // Show/hide buttons
        document.getElementsByClassName('supportbox-dialogue-goback-container')[0].style.display = 'none';
        document.getElementsByClassName('supportbox-dialogue-main-container')[0].style.display = 'flex';
    });

    // Check for server availability, else do error (error code inside MakeRequest too)
    // MakeRequest(`https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100`, {headers: {'X-API-Key': apiKey}}, {scriptOrigin: 'index', avoidCache: true})
    // .catch((error) => {
    //     console.error(error);
    // });

    // Omit query params from URL on reload
    window.history.pushState({}, window.location.host, `${import.meta.env.HOME_URL}`);
};