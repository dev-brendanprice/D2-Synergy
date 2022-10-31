console.log('%cD2 SYNERGY', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

// Import modules
import axios from 'axios';
import { ValidateManifest, ReturnEntry } from './utils/ValidateManifest.js';
import {
    VerifyState,
    ParseChar,
    StartLoad,
    StopLoad,
    MakeBountyElement,
    RedirUser,
    InsertSeperators,
    ParseBounties,
    PushToDOM,
    Logout,
    SortByGroup,
    SortByType,
    SortBountiesByType,
    CalcXpYield,
    ReturnSeasonPassProgressionStats,
    ReturnSeasonPassLevel,
    LoadPrimaryCharacter,
    CacheAuditItem,
    AddNumberToElementInner,
    CreateFilters,
    CacheReturnItem,
    parsePropertyNameIntoWord,
    ReturnAllSeasonChallenges } from './utils/ModuleScript.js';
import {
    itemTypeKeys,
    vendorKeys,
    baseYields,
    petraYields,
    CurrentlyAddedVendors,
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType } from './utils/SynergyDefinitions.js';
import { bountyPropertiesCount, PushProps } from './utils/MatchProps.js';
import { AddEventListeners } from './utils/Events.js';


// Validate state parameter
VerifyState();

// Start load sequence
StartLoad();

// Put version number in navbar
document.getElementById('navBarVersion').innerHTML = `${import.meta.env.version}`;

// Add click even listener to logout button
document.getElementById('navBarLogoutContainer').addEventListener('click', () => {
    Logout();
});

// Utilities
const urlParams = new URLSearchParams(window.location.search),
    sessionStorage = window.sessionStorage,
    localStorage = window.localStorage,
    log = console.log.bind(console),
    startTime = new Date();


let cachedDataInCurrentTab = {};


// Defintion objects
export let progressionDefinitions = {},
    presentationNodeDefinitions = {},
    seasonPassDefinitions = {},
    objectiveDefinitions = {},
    destinyUserProfile = {},
    seasonDefinitions = {},
    recordDefinitions = {},
    vendorDefinitions = {},
    itemDefinitions = {};

// User data
let destinyMembershipId,
    characterRecords,
    membershipType,
    characters;

// Profile data
let CurrentSeasonHash,
    ProfileProgressions,
    seasonPassInfo = {},
    seasonPassLevel = 0,
    prestigeProgressionSeasonInfo,
    seasonProgressionInfo = {};

// Object holds all bounties, by vendor, that are to be excluded from permutations
export let excludedBountiesByVendor = {};


// Declare global vars and exports
let characterLoadToggled = false; // Used to lockout character select button during load
export var charBounties = [];
export var contentView = { // Contains the element that is the currently selected content page
    currentView: {},
    UpdateView: function(element) {
        this.currentView = element;
    }
};
export var eventBooleans = {
    areFiltersToggled: false,
    ReverseBoolean: function(bool) {
        bool = !bool;
        return bool;
    }
};
export var eventFilters = {
    filterDivs: {},
    grayedOutBounties: [],
    UpdateFilters: function(value) {
        this.filterDivs = value;
    }
};

// Authorization information
export const homeUrl = import.meta.env.HOME_URL,
             axiosHeaders = {
                 ApiKey: import.meta.env.API_KEY,
                 Authorization: import.meta.env.AUTH
             },
             clientId = import.meta.env.CLIENT_ID;

// Set default axios header
axios.defaults.headers.common = {
    "X-API-Key": `${axiosHeaders.ApiKey}`
};


// Assign element fields for user settings
export let itemDisplaySize;
let rangeSlider = document.getElementById('itemSizeSlider'),
    rangeValueField = document.getElementById('itemSizeField'),
    bountyImage = document.getElementById('settingsBountyImage');

// Push cache results for itemDisplaySize to variables
await CacheReturnItem('itemDisplaySize')
    .then((result) => {
        itemDisplaySize = result;
    })
    .catch((error) => {
        CacheAuditItem('itemDisplaySize', 55);
        itemDisplaySize = 55;
    });

// Slider section values
rangeSlider.value = itemDisplaySize;
rangeValueField.innerHTML = `${itemDisplaySize}px`;
bountyImage.style.width = `${itemDisplaySize}px`;

// Set checkboxes to chosen state, from localStorage (userCache)
document.getElementById('checkboxRefreshOnInterval').checked = await CacheReturnItem('isRefreshOnIntervalToggled');
document.getElementById('checkboxRefreshWhenFocused').checked = await CacheReturnItem('isRefreshOnFocusToggled');


// Push cache results for defaultContenteView to variables
await CacheReturnItem('defaultContentView')
    .then((result) => {
        
        if (result) {

            // Change the current view based on what is fetched from cache
            contentView.UpdateView(document.getElementById(`${result}`));

            // Set selection for the defaultContentView dropdown menu
            document.getElementById('defaultViewDropdown').value = `${result}`;

            // Show the left hand statistics container
            if (result === 'pursuitsContainer') {
                document.getElementById('statsContainer').style.display = 'block';
            }
            else {
                document.getElementById('seasonalStatsContainer').style.display = 'block';
            };
        }
        else {

            // Set the main container to show bounties by default
            CacheAuditItem('defaultContentView', 'pursuitsContainer');
            contentView.UpdateView(document.getElementById('pursuitsContainer'));

            // Set default selection for the defaultContentView dropdown menu
            document.getElementById('defaultViewDropdown').value = 'pursuitsContainer';

            // Show the left hand statistics container
            document.getElementById('statsContainer').style.display = 'block';
        };
    })
    .catch((error) => {
        console.error(error);
    });


// Main OAuth flow mechanism
export async function OAuthFlow() {

    log('OAuthFlow START');

    let rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        acToken = JSON.parse(localStorage.getItem('accessToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        authCode = urlParams.get('code'); // ONLY place where authCode is to be fetched from

        // Remove state and auth code from url
        window.history.pushState({}, document.title, window.location.pathname);

    // Wrap in try.except for error catching
    try {
        // If user has no localStorage items and the code is incorrect
        if (authCode && (!comps || !acToken || !rsToken)) {
            await BungieOAuth(authCode);
        }
        // User has no credentials, fired before other conditions
        else if (!authCode && (!comps || !acToken || !rsToken)) {
            window.location.href = homeUrl;
        }

        // If user has authorized beforehand, but came back through empty param URL
        // If user has code and localStorage components
        else if (!authCode || authCode && (comps || acToken || rsToken)) {
            await CheckComponents();
        }

        // When user comes back with localStorage components but without param URL
        else if (!authCode && (comps || acToken || rsToken)) {
            await CheckComponents();
        }

        // Otherwise, redirect the user back to the 'Authorize' page
        else {
            window.location.href = homeUrl;
        };
    } catch (error) {
        console.error(error); // display error page, with error and options for user
    };
    log('OAuthFlow END');
    log(`-> OAuth Flow Complete! [Elapsed: ${(new Date() - startTime)}ms]`);
};


// Authorize with Bungie.net
// @string {authCode}
export async function BungieOAuth (authCode) {

    let AccessToken = {},
        RefreshToken = {},
        components = {},
        AuthConfig = {
            headers: {
                Authorization: `Basic ${axiosHeaders.Authorization}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        log(axiosHeaders.Authorization);

    // Authorize user and get credentials (first time sign-on (usually))
    await axios.post('https://www.bungie.net/platform/app/oauth/token', `grant_type=authorization_code&code=${authCode}`, AuthConfig)
        .then(res => {
            let data = res.data;

            log(res);

            components['membership_id'] = data['membership_id'];
            components['token_type'] = data['token_type'];
            components['authorization_code'] = authCode;

            AccessToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
            AccessToken['expires_in'] = data['expires_in'];
            AccessToken['value'] = data['access_token'];

            RefreshToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
            RefreshToken['expires_in'] = data['refresh_expires_in'];
            RefreshToken['value'] = data['refresh_token'];

            localStorage.setItem('accessToken', JSON.stringify(AccessToken));
            localStorage.setItem('components', JSON.stringify(components));
            localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));

            log('-> Authorized with Bungie.net!');
        })
        .catch(err => {
            if (err.response.data['error_description'] == 'AuthorizationCodeInvalid' || err.response.data['error_description'] == 'AuthorizationCodeStale') {
                window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code`;
            }
            else {
                console.error(err);
            };
        });
};


// Check tokens for expiration
export async function CheckComponents () {
    
    let acToken = JSON.parse(localStorage.getItem('accessToken')),
        rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        RefreshToken = {},
        AccessToken = {},
        components = {},
        AuthConfig = {
            headers: {
                Authorization: `Basic ${axiosHeaders.Authorization}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };


    // Remove invalid localStorage items & Redirect if items are missing
    var keyNames = ['value', 'inception',  'expires_in', 'membership_id', 'token_type', 'authorization_code'],
        cKeys = ['membership_id', 'token_type', 'authorization_code'],
        tokenKeys = ['inception', 'expires_in', 'value'];


    Object.keys(rsToken).forEach(item => {
        if (!keyNames.includes(item)) delete rsToken[item], localStorage.setItem('refreshToken', JSON.stringify(rsToken))
    });
    Object.keys(acToken).forEach(item => {
        if (!keyNames.includes(item)) delete acToken[item], localStorage.setItem('accessToken', JSON.stringify(acToken));
    });
    Object.keys(comps).forEach(item => {
        if (!keyNames.includes(item)) delete comps[item], localStorage.setItem('components', JSON.stringify(comps));
    });

    Object.keys(tokenKeys).forEach(item => {
        if (!Object.keys(rsToken).includes(tokenKeys[item])) RedirUser(homeUrl, 'rsToken=true');
        if (!Object.keys(acToken).includes(tokenKeys[item])) RedirUser(homeUrl, 'acToken=true');
    });
    Object.keys(cKeys).forEach(item => {
        if (!Object.keys(comps).includes(cKeys[item])) RedirUser(homeUrl, 'comps=true');
    });



    // Check if either tokens have expired
    let isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1,
        isRsTokenExpired = (rsToken.inception + rsToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    if (isAcTokenExpired || isRsTokenExpired) {

        // Temporary deletion => Default headers are added back after OAuthFlow mechanisms
        delete axios.defaults.headers.common['X-API-Key'];

        // Change load content
        document.getElementById('loadingText').innerHTML = 'Refreshing Tokens';

        // If either tokens have expired
        isAcTokenExpired ? log('-> Access token expired..') : log('-> Refresh token expired..');
        await axios.post('https://www.bungie.net/Platform/App/OAuth/token/', `grant_type=refresh_token&refresh_token=${rsToken.value}`, AuthConfig)
            .then(res => {
                let data = res.data;

                components["membership_id"] = data["membership_id"];
                components["token_type"] = data["token_type"];
                components["authorization_code"] = comps["authorization_code"];

                AccessToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
                AccessToken['expires_in'] = data['expires_in'];
                AccessToken['value'] = data['access_token'];

                RefreshToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
                RefreshToken['expires_in'] = data['refresh_expires_in'];
                RefreshToken['value'] = data['refresh_token'];

                localStorage.setItem('accessToken', JSON.stringify(AccessToken));
                localStorage.setItem('components', JSON.stringify(components));
                localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));
            });
        isAcTokenExpired ? log('-> Access Token Refreshed!') : log('-> Refresh Token Refreshed!');
    };
    log('-> Tokens Validated!');
};


// Fetch bungie user data
export async function FetchBungieUserDetails() {

    log('FetchBungieUserDetails START');

    // Change load content
    document.getElementById('loadingText').innerHTML = 'Fetching Profile Data';
    await CheckComponents();

    let components = JSON.parse(localStorage.getItem('components')),
        axiosConfig = {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}`,
                "X-API-Key": `${axiosHeaders.ApiKey}`
            }
        };
        log(JSON.parse(localStorage.getItem('accessToken')).value);
        

    // Variables to check/store
    membershipType = sessionStorage.getItem('membershipType'),
    destinyMembershipId = JSON.parse(sessionStorage.getItem('destinyMembershipId')),
    destinyUserProfile = JSON.parse(sessionStorage.getItem('destinyUserProfile'));

    // Compare each variable that represents cached data
    if (!membershipType || !membershipType) {

        // GetBungieNetUserById (uses 254 as membershipType)
        await axios.get(`https://www.bungie.net/Platform/Destiny2/254/Profile/${components.membership_id}/LinkedProfiles/?getAllMemberships=true`, axiosConfig)
            .then(response => {

                // Store in memory again
                destinyMembershipId = response.data.Response.profiles[0].membershipId;
                membershipType = response.data.Response.profiles[0].membershipType;

                // Cache in sessionStorage
                sessionStorage.setItem('membershipType', membershipType);
                sessionStorage.setItem('destinyMembershipId', JSON.stringify(destinyMembershipId));
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // Check if destinyUserProfile is cached
    // If it is not cached then this means it is the first time the user has accessed this page
    // Otherwise, it is a refresh and we go to the else
    if (!destinyUserProfile) {

        // GetProfile (uses membershipType & destinyMembershipId)
        await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=100,104,200,201,202,205,300,301,305,900`, axiosConfig)
        .then(response => {
                
                // Store in memory again
                log(response)
                destinyUserProfile = response.data.Response;

                // Parse data from destinyUserProfile
                CurrentSeasonHash = destinyUserProfile.profile.data.currentSeasonHash;
                ProfileProgressions = destinyUserProfile.profileProgression.data;

                // Cache in sessionStorage
                sessionStorage.setItem('destinyUserProfile', JSON.stringify(destinyUserProfile));
        })
        .catch((error) => {
            console.error(error);
        });
    }
    else {
        // Parse data from destinyUserProfile
        CurrentSeasonHash = destinyUserProfile.profile.data.currentSeasonHash;
        ProfileProgressions = destinyUserProfile.profileProgression.data;
    };

    // Load characters from cache
    if (membershipType && destinyMembershipId && destinyUserProfile) {

        // Loop over characters
        characters = destinyUserProfile.characters.data;
        for (let item in characters) {
            let char = characters[item];
            document.getElementById(`classBg${char.classType}`).src = `https://www.bungie.net${char.emblemBackgroundPath}`;
            document.getElementById(`classType${char.classType}`).innerHTML = `${ParseChar(char.classType)}`;
            document.getElementById(`classLight${char.classType}`).innerHTML = `${char.light}`;
        };

        // Change DOM content
        document.getElementById('charactersContainer').style.display = 'inline-block';
        document.getElementById('categories').style.display = 'block';
        // document.getElementById('statsContainer').style.display = 'block';
    };
    log('FetchBungieUserDetails END');
};


// Load character from specific index
// @int {classType}, @boolean {isRefresh}
export async function LoadCharacter(classType) {

    if (!characterLoadToggled) {

        log('LoadPrimaryCharacter START');

        // Configure load sequence
        document.getElementById('loadingText').innerHTML = 'Indexing Character';

        // Toggle character load
        characterLoadToggled = true;
        CacheAuditItem('lastChar', classType);

        // Globals in this scope
        let CharacterProgressions,
            CharacterInventories,
            CharacterObjectives,
            CharacterEquipment,
            characterId,
            ItemSockets;


        // Clear (emtpy fields that are going to change) DOM content
        document.getElementById('loadingContentContainer').style.display = 'block';
        document.getElementById('contentDisplay').style.display = 'none';
        document.getElementById('noItemsTooltip').style.display = 'none';
        document.getElementById('bountyItems').innerHTML = '';
        document.getElementById('overlays').innerHTML = '';
        document.getElementById('filters').innerHTML = '';
        document.getElementById('ctgDestination').innerHTML = 'There are no (specific) relations for destinations.';
        document.getElementById('ctgActivityMode').innerHTML = 'There are no (specific) relations for activities.';
        document.getElementById('ctgItemCategory').innerHTML = 'There are no (specific) relations for weapon types.';
        document.getElementById('ctgKillType').innerHTML = 'There are no (specific) relations for kill types.';

        // Set all percentage based fields back to zero
        let classes = document.getElementsByClassName('propertyPercentageField');
        for (const item of classes) {
            item.innerHTML = '0%';
        };

        // Filter out other classes that are not classType
        for (let char in characters) {
            if (characters[char].classType !== classType) {
                document.getElementById(`charContainer${characters[char].classType}`).classList.add('elBlur');
            }
            else if (characters[char].classType === classType) {
                document.getElementById(`charContainer${characters[char].classType}`).classList.remove('elBlur');
            };

            document.getElementById(`charContainer${characters[char].classType}`).style.display = 'block';
        };

        // Get chosen character and save index
        for (let entry in destinyUserProfile.characters.data) {

            let character = destinyUserProfile.characters.data[entry];
            if (character.classType === classType) {
                characterId = character.characterId;
            };
        };

        // Get character-specific data from destinyUserProfile cache
        CharacterProgressions = destinyUserProfile.characterProgressions.data[characterId].progressions;
        CharacterEquipment = destinyUserProfile.characterEquipment.data[characterId].items;
        CharacterObjectives = destinyUserProfile.itemComponents.objectives.data;
        CharacterInventories = destinyUserProfile.characterInventories.data;
        CurrentSeasonHash = destinyUserProfile.profile.data.currentSeasonHash;
        characterRecords = destinyUserProfile.characterRecords.data[characterId].records;
        ItemSockets = destinyUserProfile.itemComponents.sockets.data;


        // Iterate over CharacterInventories[characterId].items
        let charInventory = CharacterInventories[characterId].items, 
            amountOfBounties = 0;

        // Make array with specified groups
        let bountyArr = {};
        vendorKeys.forEach(key => {
            bountyArr[key] = [];
        });

        // Loop over inventory items and emit bounties
        log('loadCharacter parsing bounties');
        let parsedBountiesResponse = ParseBounties(charInventory, CharacterObjectives, itemDefinitions, objectiveDefinitions);
        charBounties = parsedBountiesResponse.charBounties;
        amountOfBounties = parsedBountiesResponse.amountOfBounties;
        log(charBounties);
        log(amountOfBounties);

        // Translate objective hashes to objective strings
        Object.keys(charBounties).forEach(bounty => {
            
            let objHashes = charBounties[bounty].objectives.objectiveHashes;
            charBounties[bounty].objectiveDefinitions = [];

            for (let objHash of objHashes) {
                charBounties[bounty].objectiveDefinitions.push(objectiveDefinitions[objHash]);
            };
        });

        // Sort bounties by group (vanguard, gunsmith etc)
        bountyArr = SortByGroup(charBounties, bountyArr, vendorKeys);

        // Sort bounties by type (weekly, daily etc)
        bountyArr = SortByType(bountyArr, SortBountiesByType);

        // Push sorted bounties to the page
        PushToDOM(bountyArr, amountOfBounties, MakeBountyElement);

        // Calculate XP yield from (active) bounties
        let totalXpYield = CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields);

        // Ghost mod bonus Xp modifier variable
        let ghostModBonusXp = 0;

        // Fetch equipped ghost mods
        CharacterEquipment.forEach(v => {
            if (v.bucketHash === 4023194814) { // Ghost bucket hash

                let itemPlugSet = ItemSockets[v.itemInstanceId].sockets;

                Object.keys(itemPlugSet).forEach(v => {

                    let plugHash = itemPlugSet[v].plugHash;
                    if (plugHash === 1820053069) { // Flickering Ligt - 2%
                        ghostModBonusXp = 2;
                    }
                    else if (plugHash === 1820053068) { // Little Light - 3%
                        ghostModBonusXp = 3;
                    }
                    else if (plugHash === 1820053071) { // Hopeful Light - 5%
                        ghostModBonusXp = 5;
                    }
                    else if (plugHash === 1820053070) { // Burning Light - 8%
                        ghostModBonusXp = 8;
                    }
                    else if (plugHash === 1820053065) { // Guiding Light - 10%
                        ghostModBonusXp = 10;
                    }
                    else if (plugHash === 1820053064) { // Blinding Light - 12%
                        ghostModBonusXp = 12;
                    };
                });
            };
        });

        // Get season pass info
        log(seasonDefinitions[CurrentSeasonHash], CurrentSeasonHash)
        seasonProgressionInfo = CharacterProgressions[seasonDefinitions[CurrentSeasonHash].seasonPassProgressionHash];
        seasonPassInfo = seasonPassDefinitions[seasonDefinitions[CurrentSeasonHash].seasonPassHash];
        prestigeProgressionSeasonInfo = CharacterProgressions[seasonPassInfo.prestigeProgressionHash];
        seasonPassLevel = await ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo);

        let seasonPassRewardsTrack = progressionDefinitions[seasonPassInfo.rewardProgressionHash].rewardItems, rewardsTrack = {};

        // Iterate through rewards track and formalize into a clean(er) array structure
        seasonPassRewardsTrack.forEach(v => {

            if (!rewardsTrack[v.rewardedAtProgressionLevel]) {
                rewardsTrack[v.rewardedAtProgressionLevel] = [];
            };
            rewardsTrack[v.rewardedAtProgressionLevel].push(v.itemHash);
        });

        // Call function to get progressions for season pass XP and bonus stats
        const seasonPassProgressionStats = await ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, itemDefinitions);

        // Season Pass innerHTML changes
        AddNumberToElementInner('seasonPassXpToNextRank', InsertSeperators(seasonPassProgressionStats.progressToNextLevel));
        AddNumberToElementInner('seasonPassXpToMaxRank', InsertSeperators(seasonPassProgressionStats.xpToMaxSeasonPassRank));
        AddNumberToElementInner('seasonPassFireteamBonus', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
        AddNumberToElementInner('seasonPassRankLevel', seasonPassProgressionStats.seasonPassLevel);
        AddNumberToElementInner('seasonPassXpBonus', `${seasonPassProgressionStats.bonusXpValue}%`); // +12 for bonus large xp modifier

        // Pass in stats for the net breakdown section
        AddNumberToElementInner('sharedWisdomValue', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
        AddNumberToElementInner('ghostModValue', `${ghostModBonusXp}%`);
        AddNumberToElementInner('bonusXpValue', `${seasonPassProgressionStats.bonusXpValue}%`);

        // Bright Engram innerHTML changes
        // AddNumberToElementInner('totalBrightEngramsEarned', InsertSeperators(seasonProgressionStats[1]));
        // AddNumberToElementInner('XpToNextEngram', InsertSeperators(seasonProgressionStats[0]));

        // Add all the modifiers together, append 1 and times that value by the base total XP
        const totalXpBonusPercent = ((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp) / 100) + 1; // Format to 1.x
        AddNumberToElementInner('totalNetXpField', `${InsertSeperators(totalXpYield * totalXpBonusPercent)}`);


        // Get statistics for subheadings
        let amountOfExpiredBounties = 0, amountOfCompletedBounties = 0;

        // Count completed and expired bounties
        for (let bounty of charBounties) {
            if (bounty.isComplete) {
                amountOfCompletedBounties++;
            }
            else if (bounty.isExpired) {
                amountOfExpiredBounties++;
            };
        };

        // Push subheading statistics
        AddNumberToElementInner('expiredBountiesAmountField', amountOfExpiredBounties);
        AddNumberToElementInner('completedBountiesAmountField', amountOfCompletedBounties);
        AddNumberToElementInner('currentSeasonNameField', seasonPassInfo.displayProperties.name);

        // Check if ghost mods are slotted, turn off checkmark if not
        if (!ghostModBonusXp) {
            document.getElementById('ghostModCheckmark').style.display = 'none';
            document.getElementById('ghostModCross').style.display = 'inline-block';
        }
        else {
            document.getElementById('ghostModCheckmark').style.display = 'inline-block';
            document.getElementById('ghostModCross').style.display = 'none';
        };

        // Check if shared wisdom is not equal to 0, turn off checkmark if not
        if (!seasonPassProgressionStats.sharedWisdomBonusValue) {
            document.getElementById('sharedWisdomCheckmark').style.display = 'none';
            document.getElementById('sharedWisdomCross').style.display = 'inline-block';
        }
        else {
            document.getElementById('sharedWisdomCheckmark').style.display = 'inline-block';
            document.getElementById('sharedWisdomCross').style.display = 'none';
        };

        // Check if bonus xp is not equal to 0, turn off checkmark if not
        if (!seasonPassProgressionStats.bonusXpValue) {
            document.getElementById('bonusXpCheckmark').style.display = 'none';
            document.getElementById('bonusXpCross').style.display = 'inline-block';
        }
        else {
            document.getElementById('bonusXpCheckmark').style.display = 'inline-block';
            document.getElementById('bonusXpCross').style.display = 'none';
        };

        // Get artifact info -- check if profile has artifact
        let artifact;
        if (ProfileProgressions.seasonalArtifact) {

            // Change corresponding HTML elements to display stats
            artifact = ProfileProgressions.seasonalArtifact;

            if (artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel !== 0) {
                AddNumberToElementInner('artifactXpToNextUnlock', InsertSeperators(artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel));
            }
            else {
                document.getElementById('artifactStatsSecondContainer').style.display = 'none';
            };

            AddNumberToElementInner('artifactStatsArtifactBonus', `+${artifact.powerBonus}`);
            AddNumberToElementInner('artifactXpToNextPowerBonus', InsertSeperators(artifact.powerBonusProgression.nextLevelAt - artifact.powerBonusProgression.progressToNextLevel));
        }
        else if (!ProfileProgressions.seasonalArtifact) {

            // Change corresponding HTML elements to display stats
            document.getElementById('artifactStatsFirstContainer').style.display = 'none';
            document.getElementById('artifactStatsSecondContainer').style.display = 'none';
            document.getElementById('artifactStatsThirdMetricContainer').style.display = 'none';
            document.getElementById('artifactStatsNoArtifactIsPresent').style.display = 'block';
        };

        // Check if there are no bounties
        if (amountOfBounties === 0) {

            // Toggle no items tooltip
            document.getElementById('noItemsTooltip').innerHTML = `You don't have bounties on this character. How dare you. (-(-_(-_-)_-)-)`;
            document.getElementById('noItemsTooltip').style.display = 'inline-block';

            // Hide filters content
            document.getElementById('btnHideFilters').style.display = 'none';
            document.getElementById('filterContentContainer').style.display = 'none';

            // Make potential yeild stats 0 by default
            AddNumberToElementInner('totalXpField', 0);
            AddNumberToElementInner('totalSpLevelsField', 0);

            // Change subheading field to show amount of bounties
            AddNumberToElementInner('bountiesAmountField', 0);
        }
        else if (amountOfBounties > 0) {

            // Set default style for toggle button filter and filter(s) container
            document.getElementById('btnHideFilters').style.display = 'block';
            document.getElementById('filterContentContainer').style.display = 'none';

            // Hide toggle filters button if there is only one bounty
            if (amountOfBounties === 1) {
                document.getElementById('btnHideFilters').style.display = 'none';
                document.getElementById('filterContentContainer').style.display = 'none';
            };

            // Change subheading field to show amount of bounties
            AddNumberToElementInner('bountiesAmountField', `${amountOfBounties}`);

            // Change potential yield stats since there are bounties present
            AddNumberToElementInner('totalXpField', InsertSeperators(totalXpYield));
            AddNumberToElementInner('totalSpLevelsField', totalXpYield / 100000);
        };

        // Load synergyDefinitions and match against bounties, if charBounties is not empty
        log(charBounties.length);
        if (charBounties.length !== 0) {
            await PushProps();
            await CreateFilters(charBounties, bountyPropertiesCount);
            await FindBountyPermutations(charBounties, bountyPropertiesCount);
        };
        characterLoadToggled = false;

        // Stop loading sequence
        StopLoad();

        // Toggle elements
        contentView.currentView.style.display = 'block';
        document.getElementById('contentDisplay').style.display = 'inline-block';
    };
    log('LoadPrimaryCharacter END');
};


// Load seasonal challenges, sort via completion amount, and push to HTML
export async function LoadSeasonalChallenges() {

    // Clear HTML fields
    document.getElementById('outstandingChallengesAmountField').innerHTML = '';
    document.getElementById('completedChallengesAmountField').innerHTML = '';
    document.getElementById('challengesAmountField').innerHTML = '';

    // Get all seasonal challenges
    let allSeasonalChallenges = await ReturnAllSeasonChallenges(2809059433, seasonDefinitions, recordDefinitions, presentationNodeDefinitions);

    // Parse seasonal challenges into corresponding objects
    let completedChallenges = {},
        notCompletedChallenges = {},
        allSeasonalChallengesAndTheirDivs = {};

    for (const recordHash in characterRecords) {

        const objectives = characterRecords[recordHash].objectives;
        if (objectives && objectives.length > 0) {

            if (objectives.every((objective) => objective.complete)) {
                completedChallenges[recordHash] = {};
                completedChallenges[recordHash].displayProperties = recordDefinitions[recordHash].displayProperties;
                completedChallenges[recordHash].objectives = objectives;
            }
            else {
                notCompletedChallenges[recordHash] = {};
                notCompletedChallenges[recordHash].displayProperties = recordDefinitions[recordHash].displayProperties;
                notCompletedChallenges[recordHash].objectives = objectives;
            };
        };
    };

    // Create HTML elements for all challenges
    for (const challengeHash in allSeasonalChallenges) {

        // Create HTML element for challenge
        let challengeContainer = document.createElement('div'),
            challengeIcon = document.createElement('img'),
            challengeName = document.createElement('div'),
            challengeBreakline = document.createElement('hr'),
            challengeDescription = document.createElement('div'),
            challengeProgressContainer = document.createElement('div'),
            challengeProgressTrack = document.createElement('div'),
            challengeProgressPercentBar = document.createElement('div');

        // Set attributes for challenge container
        challengeContainer.className = 'challengeContainer';
        challengeContainer.id = `${challengeHash}`;
        challengeIcon.className = 'challengeIcon';
        challengeName.className = 'challengeName';
        challengeBreakline.className = 'challengeBreakline';
        challengeDescription.className = 'challengeDescription';
        challengeProgressContainer.className = 'challengeProgressContainer';
        challengeProgressTrack.className = 'challengeProgressTrack';
        challengeProgressPercentBar.className = 'challengeProgressPercentBar';

        // Set attributes for content
        challengeDescription.innerHTML = allSeasonalChallenges[challengeHash].displayProperties.description;
        challengeName.innerHTML = allSeasonalChallenges[challengeHash].displayProperties.name;
        challengeIcon.src = `https://www.bungie.net${allSeasonalChallenges[challengeHash].displayProperties.icon}`;
        challengeContainer.style.userSelect = 'none';

        // Check if challenge is completed
        if (completedChallenges[challengeHash]) {
            challengeContainer.style.border = '1px solid #b39a36';
        };

        // Append all the content together
        challengeProgressContainer.appendChild(challengeProgressTrack);
        challengeProgressContainer.appendChild(challengeProgressPercentBar);
        challengeContainer.appendChild(challengeIcon);
        challengeContainer.appendChild(challengeName);
        challengeContainer.appendChild(challengeBreakline);
        challengeContainer.appendChild(challengeDescription);
        challengeContainer.appendChild(challengeProgressContainer);

        // Store the challenge and its div
        allSeasonalChallengesAndTheirDivs[challengeHash] = {};
        allSeasonalChallengesAndTheirDivs[challengeHash].container = challengeContainer;
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge = allSeasonalChallenges[challengeHash];

        // Append objectives to the challenge
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives = [];

        if (notCompletedChallenges[challengeHash] || completedChallenges[challengeHash]) {

            let challengeObjectives;

            // Parse non-completed objectives
            if (Object.keys(notCompletedChallenges).includes(challengeHash)) {

                challengeObjectives = notCompletedChallenges[challengeHash].objectives;
                for (const objective in challengeObjectives) {
                    allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(notCompletedChallenges[challengeHash].objectives[objective]);
                };
            };

            // Parse completed objectives
            if (Object.keys(completedChallenges).includes(challengeHash)) {

                challengeObjectives = completedChallenges[challengeHash].objectives;
                for (const objective in challengeObjectives) {
                    allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(completedChallenges[challengeHash].objectives[objective]);
                };
            };
        };

        // Check if the challenge is completed, set isComplete to true in guard statement, otherwise false by default
        // This is to make it easier to check if the challenge is complete, as opposed to comparing with completedChallenges
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = false;
        if (completedChallenges[challengeHash]) {
            allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = true;
        };

        // Sort challenge completion progress as a percentage of the total completion value
        let challengeObjectiveProgressTotal = 0,
            challengeObjectiveCompletionTotal = 0,
            challengeObjectives = allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives;

        for (const objective of challengeObjectives) {
            challengeObjectiveProgressTotal += objective.progress;
            challengeObjectiveCompletionTotal += objective.completionValue;
        };

        // Calculate progress as a percentage, if objective is "0/1" then it is a boolean, 
        // so set progress to 0% (if not complete) or 100% (if complete)
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage = (challengeObjectiveProgressTotal / challengeObjectiveCompletionTotal) * 100;

        // Change width of challengeProgressPercentBar based on completion percentage
        if (allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage >= 100) {
            challengeProgressPercentBar.style.width = '100%';
        }
        else {
            challengeProgressPercentBar.style.width = `${allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage}%`;
        };
    };

    // Sort challenges by completion percentage, in ascending order
    let sortedChallenges = Object.values(allSeasonalChallengesAndTheirDivs).sort((a, b) => a.challenge.completionPercentage - b.challenge.completionPercentage);
    log(Object.entries(sortedChallenges));

    // Slice the array of challenges into chunks of 6
    let chunkedChallenges = [];
    for (let i=0; i<Object.keys(sortedChallenges).length; i+=6) {
        chunkedChallenges.push(sortedChallenges.slice(i, i+6));
    };

    // Create HTML elements for each chunk of challenges
    for (let i=0; i<chunkedChallenges.length; i++) {
        
        // Create container thath olds the current chunk of 6 challenges
        let chunkContainer = document.createElement('div');
        chunkContainer.className = 'chunkPage';
        chunkContainer.id = `challengeChunk${i}`;
        
        // If it's the first iteration then, show the container, otherwise hide it
        if (i === 0) {
            chunkContainer.style.display = 'grid';
        }
        else {
            chunkContainer.style.display = 'none';
        };

        // Append each challenge, from the chunk, to the chunk container
        for (const chunk of chunkedChallenges[i]) {
            chunkContainer.appendChild(chunk.container);
        };

        // Append the chunk container to seasonalChallengeItems
        document.getElementById('seasonalChallengeItems').appendChild(chunkContainer);
    };

    // Append challenges to the DOM
    // for (const challenge of sortedChallenges) {
    //     document.getElementById('seasonalChallengeItems').appendChild(challenge.container);
    // };

    // Push HTML fields
    document.getElementById('outstandingChallengesAmountField').innerHTML = `${Object.keys(notCompletedChallenges).length}`;
    document.getElementById('completedChallengesAmountField').innerHTML = `${Object.keys(completedChallenges).length}`;
    document.getElementById('challengesAmountField').innerHTML = `${Object.keys(allSeasonalChallenges).length}`;
};


// Find permutations of bounties
async function FindBountyPermutations(charBounties) {

    const propertyCategories = {
        Destination: Destination,
        ActivityMode: ActivityMode,
        DamageType: DamageType,
        ItemCategory: ItemCategory,
        AmmoType: AmmoType,
        KillType: KillType
    };

    var categorized = {
        Destination: [],
        ActivityMode: [],
        DamageType: [],
        ItemCategory: [],
        AmmoType: [],
        KillType: []
    };

    var highestPropertyInEachCategory = {
        Destination: {
            propertyName: '',
            propertyCount: 0
        },
        ActivityMode: {
            propertyName: '',
            propertyCount: 0
        },
        DamageType: {
            propertyName: '',
            propertyCount: 0
        },
        ItemCategory: {
            propertyName: '',
            propertyCount: 0
        },
        AmmoType: {
            propertyName: '',
            propertyCount: 0
        },
        KillType: {
            propertyName: '',
            propertyCount: 0
        }
    };

    var permutedPropertiesByCategory = {
        Destination: {},
        ActivityMode: {},
        DamageType: {},
        ItemCategory: {},
        AmmoType: {},
        KillType: {}
    };


    // Determine what category a specified property is in
    function determineCategory(propertyName) {
        for (const category in propertyCategories) {
            if (propertyCategories[category].includes(propertyName)) {
                return category;
            };
        };
    };


    // Sort each property into categories
    for (const prp in bountyPropertiesCount) {
        
        for (const ctg in propertyCategories) {

            // Filter properties by category and find the highest count for each property
            if (propertyCategories[ctg].includes(prp)) {

                categorized[ctg].push(prp);
                // log(propertyCategories[ctg], ctg, prp);

                let highestPropertyCategory = highestPropertyInEachCategory[ctg];
                if (highestPropertyCategory.propertyCount < bountyPropertiesCount[prp]) {
                    highestPropertyCategory.propertyName = prp;
                    highestPropertyCategory.propertyCount = bountyPropertiesCount[prp];
                };

                // Percentage of bounties that have this property
                permutedPropertiesByCategory[ctg][prp] = Math.round((bountyPropertiesCount[prp] / charBounties.length) * 100);
            };
        };
    };

    // Turn our object into an array so we can sort it
    log(permutedPropertiesByCategory);
    let propertyNamesByPercentage = [];
    for (var ctg in permutedPropertiesByCategory) {
        for (var prp in permutedPropertiesByCategory[ctg]) {
            propertyNamesByPercentage.push([prp, permutedPropertiesByCategory[ctg][prp]]);
        };
    };

    // Sort the array by the percentage of bounties that have this property in descending order
    propertyNamesByPercentage.sort((a,b) => b[1] - a[1]);
    log(permutedPropertiesByCategory);

    // Check if name fields are going to contain anything
    for (const ctg in permutedPropertiesByCategory) {

        // if there are properties in this category then show add the name field data
        if (Object.keys(permutedPropertiesByCategory[ctg]).length !== 0) {

            // Field data object
            let fieldData = {};

            // Clear innerHTML of specified element
            document.getElementById(`ctg${ctg}`).innerHTML = '';
            document.getElementById(`ctg${ctg}`).style.fontStyle = 'normal';

            // Push the sorted properties to the DOM
            for (const keyValueArray of propertyNamesByPercentage) {
                
                const percent = keyValueArray[1],
                      propertyName = keyValueArray[0];

                log(determineCategory(keyValueArray[0]));

                var percentageFieldToChange = document.getElementById(`percentage${propertyName}`);
                if (percentageFieldToChange) {
                    percentageFieldToChange.innerHTML = `${percent}%`;
                };

                // document.getElementById(`ctg${determineCategory(keyValueArray[0])}`).innerHTML += `${propertyName} (${percent}%) `;
            };

            // dev
            for (const ctg in permutedPropertiesByCategory) {
                log('first');
                for (const propertyName in permutedPropertiesByCategory[ctg]) {
                    log('second');
                    document.getElementById(`ctg${ctg}`).innerHTML += `${propertyName} (${permutedPropertiesByCategory[ctg][propertyName]}%) `;
                };
            };
        };
    };

    // Push CurrentlyAddedVendors to the popup menu
    for (const item in CurrentlyAddedVendors) {
        
        let newListItem = document.createElement('li');

        newListItem.innerHTML = item;
        document.getElementById('vendorsList').appendChild(newListItem);
    };
};


// Anonymous function for main
// @boolean {isPassiveReload}
export async function main(isPassiveReload) {

    // Check for passive reload
    if (isPassiveReload) {
        startTime = new Date();
        StartLoad();
        log(`-> Passive Reload Started..`);
    };

    // OAuth Flow
    await OAuthFlow();

    // Add default headers back, in case OAuthFlow needed a refresh
    axios.defaults.headers.common = { "X-API-Key": `${axiosHeaders.ApiKey}` };

    // Fetch bungie user details
    await FetchBungieUserDetails();

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
    await LoadPrimaryCharacter(characters);

    // Load seasonal challenges
    await LoadSeasonalChallenges();

    // Check for passive reload
    if (isPassiveReload) {
        StopLoad();
        log(`-> Passive Reload Complete! [Elapsed: ${(new Date() - startTime)}ms]`);
    }
    else if (!isPassiveReload) {
        // Don't add the event listeners again when passive reloading
        await AddEventListeners();
    };

    // Log currently support vendors
    console.table('Supported Vendors:', CurrentlyAddedVendors);
};

// Run main after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
    main()
    .catch((error) => {
        console.error(error);
    });
});
