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
        function CheckForErrorStatus(response, promise) {
            
            if (response.data.Response) {
                document.getElementById('websiteAlphaNotice').style.display = 'none';
            }

            // Clear localStorage, sessionStorage, idb and redirect user to index.html
            else if (response.response.data.ErrorCode === 5 || response.response.data.ErrorStatus === 'SystemDisabled') {

                // Check for script origin
                switch (utils.scriptOrigin) {

                    case 'index':
                        document.getElementById('serverDeadContainer').style.display = 'block';
                        document.getElementById('websiteAlphaNotice').style.display = 'none';
                        break;

                    default:
                        localStorage.clear();
                        sessionStorage.clear();
                        indexedDB.deleteDatabase('keyval-store');
                        window.location.href = 'index.html';
                };
            };

            // Do resolve
            promise.resolve(response.response);
        };

        // Check for boolean value to avoid cached data, force a new request
        utils.avoidCache ? `${url}?=${GenerateRandomString(10)}` : url;

        // Check for method type
        switch (config.method) {

            case 'POST' || 'post':
                await axios.post(url, config)
                    .then((response) => {
                        CheckForErrorStatus(response, {resolve, reject});
                    })
                    .catch((error) => {
                        CheckForErrorStatus(error, {resolve, reject});
                    });

            default:
                await axios.get(url, config)
                    .then((response) => {
                        CheckForErrorStatus(response, {resolve, reject});
                    })
                    .catch((error) => {
                        CheckForErrorStatus(error, {resolve, reject});
                    });
        };
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