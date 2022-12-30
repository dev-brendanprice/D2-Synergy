import * as __SNOWPACK_ENV__ from '../_snowpack/env.js';

console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @_devbrendan on Twitter.');

import { MakeRequest } from './modules/MakeRequest.js';

const log = console.log.bind(console),
      localStorage = window.localStorage,
      clientId = __SNOWPACK_ENV__.CLIENT_ID,
      apiKey = __SNOWPACK_ENV__.API_KEY;



// Check localStorage to determine if user has signed in already
async function CheckSession() {

    var acToken = JSON.parse(localStorage.getItem('accessToken')),
        rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        urlParam = new URLSearchParams(window.location.search);


    // Indicates if localStorage is missing an item(s)
    if (!(urlParam.get('rsToken') && urlParam.get('acToken') && urlParam.get('comps'))) {
        localStorage.clear();
    };

    // Redirect user through if localStorage has items
    if (acToken && rsToken && comps) {
        log('-> Session Exists, Redirecting..');
        window.location.href = 'user.html';
    };
};


// Generate a random string for state code
async function GenerateRandomString(len) {
    let result = ' ',
        characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};


// Main
window.addEventListener('DOMContentLoaded', () => {

    // Check for server availability
    MakeRequest('https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100', { headers: { 'X-API-Key': apiKey } }, {scriptOrigin: 'index', avoidCache: false})
        .catch((error) => {

            console.error(error);
            if (!response.data.Response.systems.Destiny2.enabled) {
                document.getElementById('serverDeadContainer').style.display = 'block';
                return;
            };
        });

    // Put version number in navbar
    document.getElementById('navBarVersion').innerHTML = `${__SNOWPACK_ENV__.version}`;

    // Check for a pre-existing session
    CheckSession();

    // Listen for authorize button click
    document.getElementById('btnAuthorize').addEventListener('click', () => {

        const stateCode = GenerateRandomString(128);
        localStorage.setItem('stateCode', stateCode);
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}`;

        // Check for server availability
        MakeRequest('https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100', { headers: { 'X-API-Key': apiKey } }, {scriptOrigin: 'index', avoidCache: false})
        .then((response) => {
            
            // Do main stuff
            if (response.status === 200) {
                const stateCode = GenerateRandomString(128);
                localStorage.setItem('stateCode', stateCode);
                window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}`;
            };

            // Else throw error
            throw new Error('Servers are down!');

        })
        .catch((error) => {

            // Do error stuff
            console.error(error);
            if (!response.data.Response.systems.Destiny2.enabled) {
                document.getElementById('serverDeadContainer').style.display = 'block';
                return;
            };
        });
    });
});

