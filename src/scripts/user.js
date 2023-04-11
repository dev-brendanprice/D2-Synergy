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
    relations: { // Specific to current character
        bounties: {},
        challenges: {},
        all: {}
    },
    toggles: {
        pvp: true,
        pve: true,
        challenges: true,
        expiredBounties: true
    },
    ClearTable: function() {
        
        // Clear relations table
        this.div.innerHTML = '';
        this.div.innerHTML = '<tr><th>Keyword</th><th>Relation</th></tr>';

        let ctgs = ['ActivityMode', 'ItemCategory', 'DamageType', 'KillType', 'EnemyType'];

        // Clear relation squares
        for (let item of ctgs) {
            document.getElementById(`${item}Title`).className = 'relationSquareNormal';
            document.getElementById(`${item}Arrow`).src = './static/ico/neutral_ring.svg';
            document.getElementById(`${item}Arrow`).classList.remove('greenIco');
            document.getElementById(`${item}Text`).innerHTML = '--';
        };
    },
    BuildTable: function() {

        function findAverage(typeString, item) {
            if (item[1] > averageRelationCount) {
                document.getElementById(`${typeString}Title`).className = 'relationSquareGreen';
                document.getElementById(`${typeString}Arrow`).src = './static/ico/blackArrow.svg';
                document.getElementById(`${typeString}Arrow`).classList.add('greenIco');
            }
            else if (item[1] < averageRelationCount) {
                document.getElementById(`${typeString}Title`).className = 'relationSquareOrange';
                document.getElementById(`${typeString}Arrow`).src = './static/ico/orangeArrow.svg';
                document.getElementById(`${typeString}Arrow`).classList.remove('greenIco');
            };
            
            // Change the average up/down green/orange arrow based on the average relation count
            document.getElementById(`${typeString}Text`).innerHTML = item[0];
        };

        /*

            Take relations and push each one as a row to the relations table
            Filter relations based on which toggles are set to true or false

        */

        // Clear table first and init
        this.ClearTable();
        let totalRelationCount = 0;
        let totalItemCount = 0;
        let averageRelationCount = this.relations.averageRelationCount;

        // Iterate over all relations
        Object.keys(this.relations.all).forEach((relation) => {


            // Check if challenges are toggled
            if (!this.toggles.challenges) {

                // Loop over challenges and subtract each challenges' key value from relations.all
                Object.keys(this.relations.challenges).forEach((challengeRelation) => {
                    if (this.relations.challenges[challengeRelation][0] === this.relations.all[relation][0]) {
                        this.relations.all[relation][1] -= this.relations.challenges[challengeRelation][1];
                    };
                });
            };

            // Check if properties have a value of zero -> omit
            if (this.relations.all[relation][1] === 0) {
                delete this.relations.all[relation];
            };
        });

        // Rebuild relations.all objects
        this.relations.all = Object.entries(this.relations.all).map(([key, value]) => value);

        // Sort relations.all via relationCount and descending order, before pushing rows to table
        this.relations.all = Object.values(this.relations.all).sort((a,b) => b[1] - a[1]);


        // Check table relation count(s)
        if (Object.keys(this.relations.all).length === 0) {
            document.getElementById('noRelationsExistElement').style.display = 'block';
            document.getElementById('tblCon').style.display = 'none';
            document.getElementById('relationsTotalField').innerHTML = '0';
            return;
        }
        else {
            document.getElementById('noRelationsExistElement').style.display = 'none';
            document.getElementById('tblCon').style.display = 'block';
        };

        // Iterate over all relations again (after keys are removed otherwise emits undefined)
        Object.keys(this.relations.all).forEach((a) => {

            let itemName = this.relations.all[a][0];
            let itemRelationCount = this.relations.all[a][1];

            // Add property value to relation count
            totalRelationCount += this.relations.all[a][1];

            // Increment item count
            totalItemCount++;

            // Add table row with item data
            AddTableRow(this.div, [itemName, `${itemRelationCount}pts`]);
        });

        // To avoid oddly shaped table cells, check to see how much space is left in container
        // and fill whitespace with empty cells
        if (totalItemCount < 10) {
            let requiredRows = 20 - totalItemCount; // 10 is the max rows before overflow occurs
            for (let i=0; i<requiredRows; i++) {
                AddTableRow(this.div, ['', '']);
            };
        };

        // Update table subheading relation count
        document.getElementById('relationsTotalField').innerHTML = `${totalRelationCount}`;

        let highestActivityMode;
        let highestItemCategory; // e.g. scout rifle
        let highestDamageType;
        let highestKillType;
        let highestEnemyType;

        // Find the highest relation from each category
        // allRelations is sorted so it should find the first match
        this.relations.all.forEach(item => {
            
            let name = ParsePropertyNameIntoWord(item[0], true);

            if (ActivityMode.includes(name)) {
                if (!highestActivityMode) {
                    highestActivityMode = name;
                    findAverage('ActivityMode', item);
                };
            }
            else if (ItemCategory.includes(name)) {
                if (!highestItemCategory) {
                    highestItemCategory = name;
                    findAverage('ItemCategory', item);
                };
            }
            else if (DamageType.includes(name)) {
                if (!highestDamageType) {
                    highestDamageType = name;
                    findAverage('DamageType', item);
                };
            }
            else if (KillType.includes(name)) {
                if (!highestKillType) {
                    highestKillType = name;
                    findAverage('KillType', item);
                };
            }
            else if (EnemyType.includes(name)) {
                if (!highestEnemyType) {
                    highestEnemyType = name;
                    findAverage('EnemyType', item);
                };
            };
        });
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
