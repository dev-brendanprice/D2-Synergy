import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

const requiredTables = [
    'DestinyInventoryItemDefinition',
    'DestinyObjectiveDefinition',
    'DestinySeasonDefinition',
    'DestinySeasonPassDefinition'
];

var log = console.log.bind(console),
    manifest;



// Return manifest components
const ReturnComponentSuffix = async (entry) => {

    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    var components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];

    return components[entry];
};



// Check if each (required) table exists
const ValidateTables = async () => {

    for (var table of requiredTables) {

        var entry = await get(table);
        if (!entry) {

            // Avoid CORS policies
            delete axios.defaults.headers.common['X-API-Key'];

            // Request/Set new table
            var suffix = await ReturnComponentSuffix(table),
                newTable = await axios.get(`https://www.bungie.net${suffix}`);

            set(table, newTable.data);
        };
    };
};



// Check manifest version
const ValidateManifest = async () => {

    // Try to use previous response - if it exists
    if (!manifest) {

        // Change load content
        document.getElementById('loadingText').innerHTML = 'Downloading New Manifest';

        // Fetch manifest
        var localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);

        // Check manifest version
        if (localStorageManifestVersion !== manifest.data.Response.version) {
            await ValidateTables();
            window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version);
        };
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