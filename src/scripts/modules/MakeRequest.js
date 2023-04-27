import axios from 'axios';
import { GenerateRandomString } from './GenerateRandomString.js';

// Custom wrapper for requests
// @string {url}, @object {config}, @object {utils}
export const MakeRequest = function (url, config, utils = { scriptOrigin: 'user', avoidCache: false }) {
    return new Promise(async (resolve, reject) => {

        // API down, Servers down, or other error
        function CheckForErrorStatus(error) {

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
                window.localStorage.clear();
                window.sessionStorage.clear();
                indexedDB.deleteDatabase('keyval-store');
                window.location.href = 'home.html';

                return error;
            };
        };

        // Append random string as query param to avoid CF cache
        if (utils.avoidCache) {
            url += `&cachebust=${GenerateRandomString(10)}`;
        };

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
