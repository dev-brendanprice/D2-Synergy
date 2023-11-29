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
let serverDown = false;

// Check for empty cached profiles object in localStorage cache
if (!JSON.parse(localStorage.getItem('cachedprofiles'))) {
    localStorage.setItem('cachedprofiles', '[]');
};

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

// Count of rows on grid
let rows = 6; // Edit this value to change cell count
let n = rows * 17;

// Load support page DOM content
async function loadSupportPageContent(definitions) {

    let playeridCounter = 0; // Count index of current playerid
    let promiseArr = [];

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


    // Check if user is in cache, if not -> add to cache
    const cacheArr = JSON.parse(localStorage.getItem('cachedprofiles'));
    const memshipArr = cacheArr.map(v => v.profile.memship);
    for (let memship of playerids) {

        if (memshipArr.includes(memship)) {
            let profile = cacheArr.filter(v => v.profile.memship === memship)[0].profile;
            promiseArr.push(profile);
        }
        else {
            promiseArr.push(LoadPartialProfile(memship, definitions)); // Load profile
        };
    };

    // Loop over promise result array
    let result = await Promise.all(promiseArr);
    for (let i=0; i<n; i++) {

        // Check if i is in the random integer array
        if (ranarr.includes(i)) {

            // Get profile and create cell
            const profile = result.filter(v => v.memship === playerids[playeridCounter])[0];
            createCellDat(profile);


            // Check if memship exists in cache
            let cache = JSON.parse(localStorage.getItem('cachedprofiles')).filter(v => v.profile.memship === playerids[playeridCounter]);
            if (!cache[0]) {

                // Push to cache
                localStorage.setItem('cachedprofiles', JSON.stringify([
                    ...JSON.parse(localStorage.getItem('cachedprofiles') ?? '[]'),
                    { profile }
                ]));
            };

            playeridCounter++; // Increment playeridCounter
        }
        else {

            // Create cell
            let img = document.createElement('img');

            // Add style and content to cell
            img.classList = 'support-cell';
            img.src = './static/images/UI/non_loaded_cell.png';

            // Add cell to DOM
            document.getElementsByClassName('support-page-grid-container')[0].append(img);
        };
    };
};

// Load support page grid (when server is down its empty)
async function loadEmptySupportPageGrid() {

    for (let i=0; i<n; i++) {

        // Create cell
        let img = document.createElement('img');

        // Add style and content to cell
        img.classList = 'support-cell';
        img.src = './static/images/UI/non_loaded_cell.png';

        // Add cell to DOM
        document.getElementsByClassName('support-page-grid-container')[0].append(img);
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

// Clone given element (clears event listeners)
// @HTMLElement {el}, @Boolean {withChildren}
function recreateNode(el, withChildren) {
    if (withChildren) {
        el.parentNode.replaceChild(el.cloneNode(true), el);
    }
    else {
        var newEl = el.cloneNode(false);
        while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
        el.parentNode.replaceChild(newEl, el);
    };
};


// Listen for page ready state
log(document.readyState !== 'loading' ? 'Ready' : 'Unready');
if (document.readyState !== 'loading') {

    // Put version number in navbar
    document.getElementById('version-text').innerHTML = `${import.meta.env.version}`;

    // Toggle home/supporters containers
    function toggleContainers(goHome = false) {

        const supportersContainer = document.getElementById('center-con');
        const homepageContainer = document.getElementById('center-support');
        const supportersButton = document.getElementsByClassName('supportbox-dialogue-main-container')[0];
        const homepageButton = document.getElementsByClassName('supportbox-dialogue-goback-container')[0];

        // If nav icon button is clicked
        if (goHome) {
            homepageContainer.style.display = 'none'; // Toggle containers
            supportersContainer.style.display = 'flex';
            homepageButton.style.display = 'none';
            supportersButton.style.display = 'flex';
            return;
        };

        // Home page is the one that is being shown
        if (homepageContainer.style.display === 'flex') {
            homepageContainer.style.display = 'none'; // Toggle containers
            supportersContainer.style.display = 'flex';
            homepageButton.style.display = 'none';
            supportersButton.style.display = 'flex';
        }
        else {
            homepageContainer.style.display = 'flex'; // Toggle containers
            supportersContainer.style.display = 'none';
            homepageButton.style.display = 'flex';
            supportersButton.style.display = 'none';
        };
    };

    // Support/Home page nav button (vice versa)
    document.getElementsByClassName('supportbox-dialogue-main-container')[0].addEventListener('click', function() {
        toggleContainers();
    });
    document.getElementsByClassName('supportbox-dialogue-goback-container')[0].addEventListener('click', function() {
        toggleContainers();
    });

    // Listen for nav icon container click, show home page container, instead of supporters container
    document.getElementById('nav-icon').addEventListener('click', () => {
        toggleContainers(true);
    });

    // Check for server availability, else do error (error code inside MakeRequest too)
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100`, {headers: {'X-API-Key': apiKey}}, {scriptOrigin: 'index', avoidCache: true})
    .catch((error) => {
        console.error(error);
        if (error.ErrorCode === 5) {
            serverDown = true;
        };
    });

    if (!serverDown) {

        // Request definitions objects (one-off thing, does not affect user.js)
        let navlang = window.navigator.language.split('-')[0];
        let manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
        let components = manifest.data.Response.jsonWorldComponentContentPaths[navlang];

        let seasonDefinitions = await axios.get(`https://www.bungie.net${components.DestinySeasonDefinition}`)
        .catch((error) => {
            console.error(error);
            return axios.get(`https://www.bungie.net${components.DestinySeasonDefinition}?state=${GenerateRandomString(16)}`); // Cache bust if CORS (wildcard error handling)
        });
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

        // Check for a pre-existing session
        CheckSession();

        // Load support page DOM content
        loadSupportPageContent(definitions);

        // Redirect user to bungie.net sign in portal on auth button click
        const stateCode = GenerateRandomString(128);
        const authButtons = document.getElementsByClassName('auth-button');
        for (let btn of authButtons) {
            btn.addEventListener('click', () => {
                localStorage.setItem('stateCode', stateCode);
                window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}&randomqueryparam=${GenerateRandomString(128)}`;
            });
        };
    }
    else {

        // Show server out container
        document.getElementsByClassName('server-out-container')[0].style.display = 'flex';

        // Remove event listeners from authenticate buttons
        const authButtons = document.getElementsByClassName('auth-button');
        for (let btn of authButtons) {
            recreateNode(btn, true);
        };

        // Load empty support page grid when server down
        loadEmptySupportPageGrid();
    };

    // Omit query params from URL on reload
    window.history.pushState({}, window.location.host, `${import.meta.env.HOME_URL}`);
};