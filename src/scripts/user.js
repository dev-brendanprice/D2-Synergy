import axios from 'axios';
import { ValidateManifest, ReturnEntry } from './modules/ValidateManifest.js';
import {
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType,
    EnemyType,
    EnemyModifiers,
    SeasonalCategory,
    LocationSpecifics,
    DescriptorSpecifics } from './modules/SynergyDefinitions.js';
import { AddEventListeners, BuildWorkspace } from './modules/Events.js';
import { MakeRequest } from './modules/MakeRequest.js';
import { CheckUserAuthState } from './oauth/CheckUserAuthState.js';
import { FetchBungieUser } from './oauth/FetchBungieUser.js';
import { ParsePropertyNameIntoWord } from './modules/ParsePropertyNameIntoWord.js';
import { VerifyState } from './oauth/VerifyState.js';
import { LoadPrimaryCharacter } from './modules/LoadPrimaryCharacter.js';
import { CacheChangeItem } from './modules/CacheChangeItem.js';
import { AddTableRow } from './modules/AddTableRow.js';
import { StopLoad } from './modules/StopLoad.js';
import { StartLoad } from './modules/StartLoad.js';

console.log(`%cD2 SYNERGY ${import.meta.env.version}`, 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @_devbrendan on Twitter.');

// Validate state parameter + start load animation
VerifyState();
StartLoad();

// Utilities
export const log = console.log.bind(console);


// Defintion objects
export var progressionDefinitions = {},
        presentationNodeDefinitions = {},
        seasonPassDefinitions = {},
        objectiveDefinitions = {},
        destinyUserProfile = {},
        seasonDefinitions = {},
        recordDefinitions = {},
        vendorDefinitions = {},
        itemDefinitions = {};

// Authorization information
export const homeUrl = import.meta.env.HOME_URL;
export const clientId = import.meta.env.CLIENT_ID;
export const axiosHeaders = { // Does not apply to axios requests automatically
    ApiKey: import.meta.env.API_KEY,
    Authorization: import.meta.env.AUTH
};

// Set default axios header
axios.defaults.headers.common = {
    "X-API-Key": `${axiosHeaders.ApiKey}`
};


// Put all progression properties into one array
export var allProgressionProperties = [];
allProgressionProperties.push(
    ...Destination,
    ...ActivityMode,
    ...DamageType,
    ...ItemCategory,
    ...AmmoType,
    ...KillType,
    ...EnemyType,
    ...EnemyModifiers,
    ...SeasonalCategory,
    ...LocationSpecifics,
    ...DescriptorSpecifics);

// Remove spaces from each property name
allProgressionProperties = allProgressionProperties.map(property => ParsePropertyNameIntoWord(property));

// Progression properties and their corresponding key names
export var progressionPropertyKeyValues = {
    'Destination': Destination,
    'ActivityMode': ActivityMode,
    'DamageType': DamageType,
    'ItemCategory': ItemCategory,
    'AmmoType': AmmoType,
    'KillType': KillType,
    'EnemyType': EnemyType,
    'EnemyModifiers': EnemyModifiers,
    'SeasonalCategory': SeasonalCategory,
    'LocationSpecifics': LocationSpecifics,
    'DescriptorSpecifics': DescriptorSpecifics
};

// User profile variables
// export var destinyMembershipId;
// export var membershipType;
// export var characters;
// export var CurrentSeasonHash;
export var ProfileProgressions;
export var UserProfile = {

    destinyUserProfile: {},
    destinyMembershipId: undefined,
    membershipType: undefined,
    characters: [],
    CurrentSeasonHash: undefined,

    AssignDestinyUserProfile: function(profile) {
        this.destinyUserProfile = profile;
    },
    AssignDestinyMembershipId: function(id) {
        this.destinyMembershipId = id;
    },
    AssignMembershipType: function(type) {
        this.membershipType = type;
    },
    AssignCharacters: function(characters) {
        this.characters = characters;
    },
    AssignCurrentSeasonHash: function(hash) {
        this.CurrentSeasonHash = hash;
    }
};
export const UserProfileProgressions = {

    ProfileProgressions: {},

    AssignProfileProgressions: function(progressions) {
        this.ProfileProgressions = progressions;
    }
};


// Object holds all bounties, by vendor, that are to be excluded from permutations
export var excludedBountiesByVendor = {};

// Declare global vars and exports
export var charBounties = [];

// Currently selected view page
export var contentView = { 
    currentView: {},
    UpdateView: function(element) {
        this.currentView = element;
    }
};

// Item display size global
export var itemDisplay = {
    itemDisplaySize: 55, // Default
    UpdateItemSize: function(size) {

        // Update global & cache
        this.itemDisplaySize = size;
        CacheChangeItem('itemDisplaySize', size);

        // Update dom content
        document.getElementById('accessibilityImageDemo').style.width = `${size}px`;
    }
};

// Accent color global
export var accentColor = {
    currentAccentColor: '#ED4D4D', // Default
    UpdateAccentColor: function(color) {

        // Update global & cache
        this.currentAccentColor = color;
        CacheChangeItem('accentColor', color);

        // Update dom content
        document.getElementById('topColorBar').style.backgroundColor = color;
        document.getElementById('topColorBar').style.boxShadow = `0px 0px 10px 1px ${color}`;
        document.getElementById('notificationTopBgLine').style.backgroundColor = color;
        document.getElementById('notificationTopBgLine').style.boxShadow = `0px 0px 10px 1px ${color}`;
        
        // Range sliders
        for (let element of document.getElementsByClassName('settingRange')) {
            element.style.accentColor = color;
        };
        // Checkboxes
        for (let element of document.getElementsByClassName('settingCheckbox')) {
            element.style.accentColor = color;
        };
    }
};

// Relations table metadata
export var relationsTable = {
    div: {}, // DOM element
    relations: {
        bounties: {},
        challenges: {},
        all: {}
    },
    ClearTable: function() {
        this.div.innerHTML = '';
        this.div.innerHTML = '<tr><th>Item</th><th>Category</th><th>Relation</th></tr>';
    },
    BuildTable: function(type = 'all') {
        
        // Clear table
        this.ClearTable();

        // Check if table will be empty
        if (Object.keys(this.relations[type]).length == 0) {
            AddTableRow(this.div, ['No relations found', '', '']);
            return;
        };

        // Update table, looping over type
        for (let relation in this.relations[type]) {

            let itemName = relation;
            let itemRelation = this.relations[type][relation];
            let itemCategory;
            for (let item in progressionPropertyKeyValues) {

                // If relation is in category, store in category
                if (progressionPropertyKeyValues[item].includes(ParsePropertyNameIntoWord(itemName, true))) {
                    itemCategory = item;
                };
            };

            AddTableRow(this.div, [itemName, ParsePropertyNameIntoWord(itemCategory), `${itemRelation}pts`]);
        };

        // Update relation count
        document.getElementById('relationsTotalField').innerHTML = Object.keys(this.relations[type]).length;
    }
};



// Anonymous function for main
// @boolean {isPassiveReload}
export async function MainEntryPoint(isPassiveReload) {

    // Check for passive reload
    if (isPassiveReload) {
        StartLoad();
        document.getElementById('containerThatHasTheSideSelectionAndContentDisplay').style.display = 'none';
        log(`-> Passive Reload Called`);
    };

    // Change notification label content
    document.getElementById('notificationTitle').innerHTML = 'Loading Bungie Data';
    document.getElementById('notificationMessage').innerHTML = 'Waiting for Bungie.net..';

    // OAuth Flow
    await CheckUserAuthState();

    // Add default headers back, in case OAuthFlow needed a refresh
    axios.defaults.headers.common = { "X-API-Key": `${axiosHeaders.ApiKey}` };

    // Fetch bungie user details
    await FetchBungieUser();

    // Validate and fetch manifest
    await ValidateManifest();

    // Assign defintions to their global counterparts
    progressionDefinitions = await ReturnEntry('DestinyProgressionDefinition');
    seasonPassDefinitions = await ReturnEntry('DestinySeasonPassDefinition');
    objectiveDefinitions = await ReturnEntry('DestinyObjectiveDefinition');
    seasonDefinitions = await ReturnEntry('DestinySeasonDefinition');
    itemDefinitions = await ReturnEntry('DestinyInventoryItemDefinition');
    recordDefinitions = await ReturnEntry('DestinyRecordDefinition');
    presentationNodeDefinitions = await ReturnEntry('DestinyPresentationNodeDefinition');

    // Load first char on profile/last loaded char
    await LoadPrimaryCharacter(UserProfile.characters);

    // Check for passive reload
    if (isPassiveReload) {
        StopLoad();
        document.getElementById('containerThatHasTheSideSelectionAndContentDisplay').style.display = 'flex';
        log(`-> Passive Reload Finished`);
        return;
    };

    // Don't add the event listeners again when passive reloading
    await AddEventListeners();
    return;
};



// Run after DOM load
document.addEventListener('DOMContentLoaded', async () => {

    // Test server availability
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100`, {headers: {"X-API-Key": axiosHeaders.ApiKey}}, {avoidCache: true})
    .then((response) => {
        log(`${response.status}OK - Bungie.net is online`);
    })
    .catch((error) => {
        console.error(error);
    });

    // Build workspace -- default fields etc.
    await BuildWorkspace()
    .catch((error) => {
        console.error(error);
    });

    // Build definitions using service worker
    // RegisterServiceWorker()
    // .catch((error) => {
    //     console.error(`🥝 Service Worker Error: ${error}`);
    // });

    // Run main
    MainEntryPoint()
    .catch((error) => {
        console.error(error);
    });
});
