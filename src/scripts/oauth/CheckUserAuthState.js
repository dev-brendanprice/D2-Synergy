import { AuthorizeUserWithBungie } from './AuthorizeUserWithBungie.js';
import { CheckUserTokens } from './CheckUserTokens.js';
import { log, homeUrl } from '../user.js';
import { ClearApplicationData } from './ClearApplicationData.js';

const urlParams = new URLSearchParams(window.location.search);

// Main OAuth flow mechanism
export async function CheckUserAuthState() {
    
    log('-> CheckUserAuthState Called');

    let rsToken = JSON.parse(window.localStorage.getItem('refreshToken'));
    let acToken = JSON.parse(window.localStorage.getItem('accessToken'));
    let comps = JSON.parse(window.localStorage.getItem('components'));
    let authCode = urlParams.get('code'); // One time use

        // Remove state and auth code from url (clean URL)
        window.history.pushState({}, window.location.host, window.location.pathname);
        
    // Catch errors
    try {

        // If user is new (no components, has authCode) -- Expected behavior
        if (authCode && (!comps || !acToken || !rsToken)) {
            await AuthorizeUserWithBungie(authCode);
        }

        // If user is returning (no components, no authCode)
        else if (!authCode && (!comps || !acToken || !rsToken)) {
            await ClearApplicationData();
            // window.location.href = homeUrl;
        }

        // If user is returning (has components, no authCode) -- Expected behavior
        else if (!authCode && (comps || acToken || rsToken)) {
            await CheckUserTokens();
        }

        // Else, Clear all data and redirect to home
        else {
            await ClearApplicationData();
            window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code`;
        };
    } 
    catch (error) {
        console.error(error);
    };
    log(`-> CheckUserAuthState Finished`);
};