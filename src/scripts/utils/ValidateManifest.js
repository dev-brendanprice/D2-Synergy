import axios from 'axios';
import { get, set } from 'idb-keyval';
import { GenerateRandomString } from './ModuleScript.js';

const requiredTables = [
    'DestinySeasonDefinition',
    'DestinyInventoryItemDefinition',
    'DestinyObjectiveDefinition',
    'DestinyProgressionDefinition',
    'DestinySeasonPassDefinition',
    'DestinyPlugSetDefinition'
];

var log = console.log.bind(console),
    manifest;



// Return manifest components
const ReturnComponentSuffix = async (entry) => {

    if (!manifest) {
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    };
    var components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];
    log(components);

    return components[entry];
};



// Check if each (required) table exists
const ValidateTables = async () => {

    for (var table of requiredTables) {

        var entry = await get(table);
        if (!entry) {

            // Omit API key from request
            delete axios.defaults.headers.common['X-API-Key'];

            // Request/Set new table
            let suffix = await ReturnComponentSuffix(table),
                newTable;
                
            newTable = await axios.get(`https://www.bungie.net${suffix}`)
                .then((res) => {
                    return res;
                })
                .catch((bruh) => {
                    log(bruh)
                    return axios.get(`https://www.bungie.net${suffix}?${GenerateRandomString(4)}=${GenerateRandomString(4)}`)
                });

            log(newTable);
            set(table, newTable.data);
        };
    };
};



// Check manifest version
const ValidateManifest = async () => {
    
    // Change load content
    let loadContent = document.getElementById('loadingText');
    loadContent.innerHTML = 'Downloading New Manifest';

    // Add timeout function for long(er) waits :/
    let newLoadContentTimeout = setTimeout(() => {

        loadContent.innerHTML = 'Sorry this is taking so long, We are nearly there...';
        setTimeout(() => {
            loadContent.innerHTML = 'Again, really sorry for the long wait. Try logging out, logging back in, and restarting it all eh?'
        }, 7_000);
    }, 10_000);

    // Fetch manifest
    var localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');
    
    // Validate the current existing tables
    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    await ValidateTables();

    // Check manifest version
    if (localStorageManifestVersion !== manifest.data.Response.version) {
        window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version);
    };

    // Remove timeout, just in the case overlapping instructions
    clearTimeout(newLoadContentTimeout);
};



// Return passed component
const ReturnEntry = async (entry) => {

    var res = await get(entry);
    if (!res) {
        await ValidateTables();
        res = await get(entry);
    };

    return res;
};



export { ValidateManifest, ReturnEntry };