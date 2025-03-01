import { LoadPartialProfile } from './LoadPartialProfile.js';
import { createCellDat } from './CreateCellData.js';
import { playerids } from '../../data/supporterMessages.js';

// Count of rows on grid
let rows = 6;
let n = rows * 17;

// Load support page DOM content
export async function loadSupportPageContent(definitions) {

    const cacheArr = JSON.parse(localStorage.getItem('cachedprofiles'));
    const memshipArr = cacheArr.map(v => v.profile.memship);
    console.log(memshipArr);
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
    for (let memship of playerids) {

        if (memshipArr.includes(memship)) {
            console.log(true);
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
export async function loadEmptySupportPageGrid() {

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