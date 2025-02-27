import axios from 'axios';
import { get, set } from 'idb-keyval';
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

let manifest;


// Return manifest components
const ReturnComponentSuffix = async (entry) => {

    if (!manifest) {
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    };

    let components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];
    return components[entry];
};


// Check if each (required) table exists
const FixTables = async () => {

    // Change notification label content
    document.getElementById('notificationTitle').innerHTML = 'Loading Definitions';
    document.getElementById('notificationMessage').innerHTML = `Parsing definitions`;

    // Omit API key from request
    delete axios.defaults.headers.common['X-API-Key'];

    // Form promises
    let requests = [];

    // Build requests
    for (let def of requiredManifestTables) {

        // Get request url
        let suffix = await ReturnComponentSuffix(def);
        let url = `https://www.bungie.net${suffix}`;

        // Push new promise
        requests.push(
            new Promise((resolve, reject) => {
                axios.get(url)
                    .then(resolve)
                    .catch(reject)
            })
        );
    };

    // Make request
    let result = await Promise.all(requests);

    // Push to idb
    for (let i=0; i<requiredManifestTables.length; i++) {
        set(requiredManifestTables[i], result[i].data);
    };

};


// Check manifest version
export const ValidateManifest = async () => {

    console.log('-> ValidateManifest Called');

    // Fetch manifest
    let localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');

    // Check if definition tables exist, otherwise fetch them
    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);

    // Check for new version, if so delete definitions and re-fetch, then do normal FixTables
    console.log(localStorageManifestVersion, manifest.data.Response.version);
    if (localStorageManifestVersion !== manifest.data.Response.version) {
        
        console.log('📚 New manifest found');
        indexedDB.deleteDatabase('keyval-store'); // Delete definitions
        window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version); // Store current version in localStorage

        // Re-Validate tables
        await FixTables();
    };

    // Remove timeout, just in the case overlapping instructions
    console.log('-> ValidateManifest Finished');
};


// Return passed component
export const ReturnEntry = async (entry) => {

    let res = await get(entry);
    if (!res) {
        await FixTables();
        return await get(entry);
    };

    return res;
};
