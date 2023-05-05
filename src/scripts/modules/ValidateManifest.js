import axios from 'axios';
import { get, set } from 'idb-keyval';
import { log } from '../user.js';
import { GenerateRandomString } from './GenerateRandomString.js';

const requiredManifestTables = [
    'DestinySeasonDefinition',
    'DestinyInventoryItemDefinition',
    'DestinyObjectiveDefinition',
    'DestinyProgressionDefinition',
    'DestinySeasonPassDefinition',
    'DestinyRecordDefinition',
    'DestinyPresentationNodeDefinition'
];

var manifest;


// Return manifest components
var ReturnComponentSuffix = async (entry) => {

    if (!manifest) {
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    };

    let components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];
    return components[entry];
};


// Check if each (required) table exists
var FixTables = async (uiCounter=0) => {

    // Change notification label content
    document.getElementById('notificationTitle').innerHTML = 'Loading Definitions';
    document.getElementById('notificationMessage').innerHTML = `Parsing definitions ${uiCounter}/${requiredManifestTables.length}`;

    for (let table of requiredManifestTables) {

        let entry = await get(table);
        if (!entry) {

            // Omit API key from request
            delete axios.defaults.headers.common['X-API-Key'];

            // Request/Set new table
            let suffix = await ReturnComponentSuffix(table);
            let newTable;

            // Bypass cache to avoid expired definitions
            newTable = await axios.get(`https://www.bungie.net${suffix}?cachereset=${GenerateRandomString(4)}`)
                .then((res) => {
                    return res;
                })
                .catch((error) => {
                    console.error(error);
                });

            // Store the response in idb using idb-keyval
            set(table, newTable.data);
        };

        // Increment notification load counter
        uiCounter++;
        document.getElementById('notificationMessage').innerHTML = `Parsing definitions ${uiCounter}/${requiredManifestTables.length}`;
    };
};


// Check manifest version
export var ValidateManifest = async () => {

    log('-> ValidateManifest Called');

    // Fetch manifest
    let localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');

    // Check if definition tables exist, otherwise fetch them
    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);

    // Check for new version, if so delete definitions and re-fetch, then do normal FixTables
    if (localStorageManifestVersion !== manifest.data.Response.version) {
        log('📚 New manifest found');
        indexedDB.deleteDatabase('keyval-store'); // Delete definitions
        window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version); // Store current version in localStorage
    };
    
    // Re-Validate tables
    await FixTables();

    // Remove timeout, just in the case overlapping instructions
    log('-> ValidateManifest Finished');
};


// Return passed component
export var ReturnEntry = async (entry) => {

    let res = await get(entry);
    if (!res) {
        await FixTables();
        return await get(entry);
    };

    return res;
};
