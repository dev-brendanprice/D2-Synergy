import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';
import { GenerateRandomString } from './ModuleScript.js';

const requiredTables = [
    'DestinyInventoryItemDefinition',
    'DestinyObjectiveDefinition',
    'DestinyProgressionDefinition',
    'DestinySeasonDefinition',
    'DestinySeasonPassDefinition'
];

var log = console.log.bind(console),
    manifest;



// Return manifest components
const ReturnComponentSuffix = async (entry) => {

    if (!manifest) {
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    };
    var components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];

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
            let suffix = await ReturnComponentSuffix(table);

            let newTable;
                
            newTable = await axios.get(`https://www.bungie.net${suffix}`)
                .then((res) => {
                    return res;
                })
                .catch((bruh) => {
                    log(bruh);
                    return axios.get(`https://www.bungie.net${suffix}?${GenerateRandomString(4)}=${GenerateRandomString(4)}`)
                });

            set(table, newTable.data);
        };
    };
};



// Check manifest version
const ValidateManifest = async () => {

    // Change load content
    document.getElementById('loadingText').innerHTML = 'Downloading New Manifest';

    // Fetch manifest
    var localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');
    
    // Validate the current existing tables
    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    await ValidateTables();

    // Check manifest version
    if (localStorageManifestVersion !== manifest.data.Response.version) {
        window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version);
    };
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