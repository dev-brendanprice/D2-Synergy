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
    DescriptorSpecifics,
    pveActivityModes,
    pvpActivityModes } from './modules/SynergyDefinitions.js';
import { AddEventListeners, BuildWorkspace } from './modules/Events.js';
import { MakeRequest } from './modules/MakeRequest.js';
import { CheckUserAuthState } from './oauth/CheckUserAuthState.js';
import { FetchBungieUser } from './oauth/FetchBungieUser.js';
import { ParsePropertyNameIntoWord } from './modules/ParsePropertyNameIntoWord.js';
import { VerifyState } from './oauth/VerifyState.js';
import { LoadCharacters } from './modules/LoadCharacters.js';
import { CacheChangeItem } from './modules/CacheChangeItem.js';
import { StopLoad } from './modules/StopLoad.js';
import { StartLoad } from './modules/StartLoad.js';
// import { PostMessage, PostMessageSync, RegisterServiceWorker } from './sw/RegisterServiceWorker.js';

console.log(`%cD2 SYNERGY ${import.meta.env.version}`, 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @_brendanprice on Twitter.');

// Validate state parameter + start load animation
VerifyState();
StartLoad();


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

// Does not apply to axios requests automatically
export const requestHeaders = {
    ApiKey: import.meta.env.API_KEY,
    Authorization: import.meta.env.AUTH
};

// Set default axios header
axios.defaults.headers.common = {
    "X-API-Key": `${requestHeaders.ApiKey}`
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

// Progression properties sorted via pvp/pve
export var progressionPropertiesPVE = {
    ...EnemyModifiers,
    ...EnemyType,
    ...pveActivityModes
};
export var progressionPropertiesPVP = {
    ...pvpActivityModes,
    ...['GuardianKills']
};

// User profile variables
export var UserProfile = {

    destinyUserProfile: {},
    destinyMembershipId: undefined,
    membershipType: undefined,
    characters: [],
    currentSeasonHash: undefined,
    progressions: { bounties:{}, challenges: {} },
    misc: { bountiesCount: 0, challengesCount: 0 },

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
        this.currentSeasonHash = hash;
    },
    AssignProgressions: function(type, data) {

        // Loop through data and append each one
        data.forEach(item => {
            this.progressions[type][item.hash] = item;

            // Increment misc counter for item type
            this.misc[`${type}Count`]++;
        });
    },
    AssignMisc: function(key, val) {
        this.misc[key] = val;
    }
};

// User progressions - might deprecate
export const UserProfileProgressions = {

    ProfileProgressions: {},

    AssignProfileProgressions: function(progressions) {
        this.ProfileProgressions = progressions;
    }
};

// User XP modifiers
export const UserXpModifiers = {

    // Store as (whole number) percentages
    seasonPass: 0,
    sharedWisdom: 0,
    wellRested: 0,
    ghostMod: 0,

    AssignModifier: function(type, val) {
        this[type] = val;
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

        // Check for rainbow accent style (CSS animation)
        if (color === 'Rainbow') {

            // Add rainbow classes to all required elements
            document.getElementById('topColorBar').classList.add('rainbow'); // Change top color bar class
            document.getElementById('notificationTopBgLine').classList.add('rainbow'); // Notifcation top color bar
            document.getElementById('colorBar').classList.add('rainbow'); // Popup color bar
            document.getElementById('checkboxUseModifiersSlider').classList.add('rainbow'); // Checkbox bg
            document.getElementById('logoutTextInSettings').classList.add('rainbow-text'); // Settings "logout" subtext
            document.getElementById('logoutSettingsButton').classList.add('rainbow'); // Settings logout button

            // Range sliders
            for (const element of document.getElementsByClassName('settingRange')) {
                element.classList.add('rainbow-accent');
            };

            // Checkboxes
            for (const element of document.getElementsByClassName('settingCheckbox')) {
                element.classList.add('rainbow-accent');
            };
        }
        else {

            // Remove rainbow classes from all required elements
            document.getElementById('topColorBar').classList.remove('rainbow'); // Remove top color bar class
            document.getElementById('notificationTopBgLine').classList.remove('rainbow'); // Notifcation top color bar
            document.getElementById('colorBar').classList.remove('rainbow'); // Popup color bar
            document.getElementById('checkboxUseModifiersSlider').classList.remove('rainbow'); // Checkbox bg
            document.getElementById('logoutTextInSettings').classList.remove('rainbow-text'); // Settings "logout" subtext
            document.getElementById('logoutSettingsButton').classList.remove('rainbow'); // Settings logout button

            // Range sliders
            for (const element of document.getElementsByClassName('settingRange')) {
                element.classList.remove('rainbow-accent');
            };

            // Checkboxes
            for (const element of document.getElementsByClassName('settingCheckbox')) {
                element.classList.remove('rainbow-accent');
            };
        };

        // Update global & cache
        this.currentAccentColor = color;
        CacheChangeItem('accentColor', color);

        // Change DOM elements
        document.getElementById('topColorBar').style.backgroundColor = color;
        document.getElementById('topColorBar').style.boxShadow = `0px 0px 10px 1px ${color}`;
        document.getElementById('notificationTopBgLine').style.backgroundColor = color;
        document.getElementById('notificationTopBgLine').style.boxShadow = `0px 0px 10px 1px ${color}`;
        document.getElementById('colorBar').style.backgroundColor = color;
        document.getElementById('colorBar').style.boxShadow = `0px 0px 10px 1px ${color}`;
        document.getElementById('checkboxUseModifiersSlider').style.backgroundColor = color;
        document.getElementById('logoutTextInSettings').style.color = color;
        document.getElementById('logoutSettingsButton').style.backgroundColor = color;
        
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

// Season pass level for specific rewards (array based)
export var seasonPassLevelStructure = {

    sharedWisdomLevels: [],

    AssignLevelStructure: function(type, arr) {
        this[type] = arr;
    }
};

// User transistory data
export var userTrasistoryData = {

    highestSeasonPassRankInFireteam: 0,

    AssignTransistoryData: function(type, val) {
        this[type] = val;
    }
};

// Profile wide class
export var profileWideData = {

    allYieldData: {
        artifact: {},
        xp: 0,
        seasonPassLevels: 0,
        artifactPowerBonusLevels: 0,
        artifactModLevels: 0
    },

    storedChars: [],

    AddYieldData: function(keyname, data) {
        this.allYieldData[keyname] += data;
    },
    AddStoredChar: function(id) {
        this.storedChars.push(id);
    }
};


// First point of entry
// @boolean {isPassiveReload}
export async function MainEntryPoint(isPassiveReload) {

    // Check for passive reload
    if (isPassiveReload) {
        StartLoad(isPassiveReload);
        console.log(`-> Passive Reload Called`);
    };

    // Change notification label content
    document.getElementById('notificationTitle').innerHTML = 'Loading Bungie Data';
    document.getElementById('notificationMessage').innerHTML = 'Waiting for Bungie.net';

    // OAuth Flow
    await CheckUserAuthState();

    // Add default headers back, in case OAuthFlow needed a refresh
    axios.defaults.headers.common = { "X-API-Key": `${requestHeaders.ApiKey}` };

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
    await LoadCharacters(UserProfile.characters);

    // Check for passive reload
    if (isPassiveReload) {
        StopLoad();
        console.log(`-> Passive Reload Finished`);
        return;
    };

    // Don't add the event listeners again when passive reloading
    await AddEventListeners();
    return;
};

 

// Run after DOM load
document.addEventListener('DOMContentLoaded', async () => {

    // Test server availability
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/1/Profile/4611686018447977370/?components=100`, {headers: {"X-API-Key": requestHeaders.ApiKey}}, {avoidCache: true})
        .then((response) => {
            // console.log(response);
            if (response.status === 200) console.log('bnet available');
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
    // await RegisterServiceWorker()
    //     .catch((error) => {
    //         console.error(`🥝 Service Worker Error: ${error}`);
    //     });

    // Run main
    MainEntryPoint()
        .catch((error) => {
            console.error(error);
        });
});
