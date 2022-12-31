import axios from 'axios';

const log = console.log.bind(console);

const localStorage = window.localStorage,
    sessionStorage = window.sessionStorage;


// Custom wrapper for requests
export const MakeRequest = function (url, config, utils) {
    return new Promise(async (resolve, reject) => {
        
        // Defaults (safe measure)
        utils.scriptOrigin = utils.scriptOrigin || 'user';
        utils.avoidCache = utils.avoidCache || false;

        // API down, Servers down, or other error
        function CheckForErrorStatus(error, promise) {

            // If .response is transformed/appended via error
            if (error.response.data || error.response.data.ErrorCode === 5) {
                
                // Check for server down on index page
                if (utils.scriptOrigin === 'index') {

                    document.getElementById('btnAuthorize').disabled = true;
                    document.getElementById('btnAuthorize').innerHTML = 'BNet API Unavailable';
                    document.getElementById('serverDeadContainer').style.display = 'block';
                    
                    return error;
                };

                // Else, check for server down on any other page (user.html)
                localStorage.clear();
                sessionStorage.clear();
                indexedDB.deleteDatabase('keyval-store');
                window.location.href = 'index.html';

                return error;
            };
        };

        // Append random string as query param to CF cache
        utils.avoidCache ? `${url}?=${GenerateRandomString(10)}` : null;

        // Make request, return if successful, else check for error status
        await axios.get(url, config)
        .then((response) => {
            resolve(response);
        })
        .catch((error) => {
            reject(CheckForErrorStatus(error, {resolve, reject}).response.data);
        });
    });
};


// Generate random string for query param when avoiding cache
export function GenerateRandomString(len) {
    let result = ' ',
        characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};
