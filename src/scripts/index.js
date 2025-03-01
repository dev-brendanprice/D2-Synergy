import { MakeRequest } from './modules/MakeRequest.js';
import { loadSupportPageContent, loadEmptySupportPageGrid } from './modules/LoadSupportPage.js';

console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @_brendanprice on Twitter.');

const localStorage = window.localStorage;
const client_id = import.meta.env.CLIENT_ID;
const api_key = import.meta.env.API_KEY;
let serverDown = false; // nuke this boolean please

// make sure cachedprofiles has empty array if it doesnt exist
let cachedprofiles = localStorage.getItem('cachedprofiles');
if (!cachedprofiles) {
    localStorage.setItem('cachedprofiles', '[]');
    loadDefsForSuportPage();
}
else {
    loadSupportPageContent();
};

// Check localStorage to determine if user has signed in already
async function CheckSession() {

    const acToken = JSON.parse(localStorage.getItem('accessToken'));
    const rsToken = JSON.parse(localStorage.getItem('refreshToken'));
    const comps = JSON.parse(localStorage.getItem('components'));

    // Redirect user through if localStorage has items
    if (acToken && rsToken && comps) {
        console.log('-> Session Exists, Redirecting..');
        window.location.href = 'user';
    };
};

// Generate a random string for state code
// @int {len}
function GenerateRandomString(len) {

    let result = '';
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

// load definitions for supporter page
async function loadDefsForSuportPage() {

    // self definitions fetch
    async function fetchDefinition(definitionPath) {
    
        const url = `https://www.bungie.net${definitionPath}?cachebust=${GenerateRandomString(8)}`;
        return await fetch(url)
            .then(response => response.json())
            .then(data => { return data; });
    };
        
    // request definitions for supporters section
    let manifest = await fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/`, { method: 'get' })
        .then(res => res.json())
        .then(response => { return response; });
    
    let navigatorLanguage = window.navigator.language.split('-')[0];
    let components = manifest.Response.jsonWorldComponentContentPaths[navigatorLanguage];
        
    // get season and season pass definitions
    let seasonDefinitions = await fetchDefinition(components.DestinySeasonDefinition);
    let seasonPassDefinitions = await fetchDefinition(components.DestinySeasonPassDefinition);
        
    // get commendations and record definitions
    let commendationsNodeDefinitions = await fetchDefinition(components.DestinySocialCommendationNodeDefinition);
    let recordDefinitions = await fetchDefinition(components.DestinyRecordDefinition);
        
    // Load support page DOM content
    loadSupportPageContent({
        seasonDefinitions: seasonDefinitions,
        seasonPassDefinitions: seasonPassDefinitions,
        commendationsNodeDefinitions: commendationsNodeDefinitions,
        recordDefinitions: recordDefinitions
    });
};


// Listen for page ready state
async function main() {
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
            toggleContainers(true);
        });
    
        // Listen for nav icon container click, show home page container, instead of supporters container
        document.getElementById('nav-icon').addEventListener('click', () => {
            toggleContainers(true);
        });
    
        // Check for bnet api availability, else do error (error code inside MakeRequest too)
        MakeRequest(`https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100`, {headers: {'X-API-Key': api_key}}, {scriptOrigin: 'index', avoidCache: true})
        .then((response) => {
            // console.log(response);
            if (response.status === 200) console.log('bnet available');
        })
        .catch((error) => {
            console.error(error);
            if (error.ErrorCode === 5) {
                serverDown = true;
            };
        });
    
        if (!serverDown) {
    
            // Check for a pre-existing session
            CheckSession();
    
            // Redirect user to bungie.net sign in portal on auth button click
            const stateCode = GenerateRandomString(128);
            const authButtons = document.getElementsByClassName('auth-button');
            for (let btn of authButtons) {
                btn.addEventListener('click', () => {
                    localStorage.setItem('stateCode', stateCode);
                    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${client_id}&response_type=code&state=${stateCode}`;
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
};
main();