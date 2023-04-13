import { 
    MainEntryPoint, 
    itemDisplay,
    accentColor,
    itemDefinitions,
    relationsTable,
    UserProfile } from '../user.js';
import { LoadCharacter } from './LoadCharacter.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { CacheReturnItem } from './CacheReturnItem.js';
import { Logout } from './Logout.js';
import { ParseClass } from './ParseClass.js';
import { getNextTuesday } from './GetNextReset.js';


// Utilities
const log = console.log.bind(console),
      localStorage = window.localStorage;
var secretCount = 0;

// Menu variables
let currentSettingsMenu = 'generalSettingsContainer';
let containerNames = [
    'bountiesContainer',
    'seasonalChallengesContainer',
    'statisticsContainer'
];


// Reverse settings menu display when navbar controls clicked
const ToggleSettingsMenu = function () {
    document.getElementById('subContainer').style.display = 'block';
    document.getElementById('settingsGrid').style.display = 'none';
};


// Event listener wrapper
const AddListener = function (elementName, event, callback, selectorType) {

    try {

        if (elementName === 'window') {
            window.addEventListener(event, callback);
            return;
        };

        if (selectorType === 'class' || selectorType === 'CLASS') {
            for (let element of document.getElementsByClassName(`${elementName}`)) {
                element.addEventListener(event, callback);
            };
            return;
        };

        document.getElementById(`${elementName}`).addEventListener(event, callback);

    }
    catch (error) {
        console.error(error);
    }
    finally {
        return;
    };
};


// Dropdown event wrapper
const AddDropdownEvent = function (dropwdownContent, dropdownArrow, dropdownBoolean) {

    if (!dropdownBoolean.isElementBeingDroppedDown) {

        dropdownBoolean.toggleBoolean();
        let dropdownContentState = getComputedStyle(dropwdownContent);

        // If dropdown is closed, open, else close
        if (dropdownContentState.display === 'none') {
    
            // Rotate arrow
            dropdownArrow.style.transform = 'rotate(0deg)';
    
            // Add class to animate dropdown
            dropwdownContent.style.display = 'block';
            dropwdownContent.className = 'pre';
            window.setTimeout(() => {
                dropwdownContent.className += ' pro';
                dropdownBoolean.toggleBoolean();
            }, 50);
        }
        else if (dropdownContentState.display !== 'none') {
    
            // Rotate arrow
            dropdownArrow.style.transform = 'rotate(90deg)';
    
            // Add class to animate closing dropdown
            dropwdownContent.className = 'pre2';
            window.setTimeout(() => {
                dropwdownContent.className += ' pro2';
    
                // Close dropdown after animation, calculate time to wait
                window.setTimeout(() => {
                    dropwdownContent.style.display = 'none';
                    dropdownBoolean.toggleBoolean();
                }, 200);
            }, 50);
        };
    };
};


// Add all event listeners
export async function AddEventListeners() {
    
    
    // Listen for click event on character selects (multiple use)
    AddListener('characterSelect', 'click', async function () {
        
        let characterId = this.getAttribute('data-character-id');
        LoadCharacter(characterId, UserProfile.characters, false);

    }, 'class');


    // Top and Bottom character selects
    // AddListener('middleCharacterContainer', 'click', async function () {

    //     const typeField = document.getElementById('topCharacterTypeField').innerHTML,
    //           powerLevelField = document.getElementById('topCharacterPowerLevelField').innerHTML;

    //     let currentChar = await CacheReturnItem('currentChar');
    //     let emblemLargeBg = itemDefinitions[currentChar.emblemHash].secondarySpecial;
    //     let emblemPath = itemDefinitions[currentChar.emblemHash].secondaryOverlay;

    //     // Load character
    //     let characterType = ParseClass(document.getElementById('middleCharacterTypeField').innerHTML, true);
    //     LoadCharacter(characterType, UserProfile.characters);

    //     // Replace with top selector elements
    //     document.getElementById('middleCharacterTypeField').innerHTML = typeField;
    //     document.getElementById('middleCharacterContainer').style.backgroundImage = `url(https://www.bungie.net${emblemLargeBg})`;
    //     document.getElementById('middleCharacterIconImg').src = `https://www.bungie.net${emblemPath}`;
    //     document.getElementById('middleCharacterPowerLevelField').innerHTML = powerLevelField;
    // });

    // AddListener('bottomCharacterContainer', 'click', async function () {

    //     const typeField = document.getElementById('topCharacterTypeField').innerHTML,
    //           powerLevelField = document.getElementById('topCharacterPowerLevelField').innerHTML;

    //     let currentChar = await CacheReturnItem('currentChar');
    //     let emblemLargeBg = itemDefinitions[currentChar.emblemHash].secondarySpecial;
    //     let emblemPath = itemDefinitions[currentChar.emblemHash].secondaryOverlay;

    //     // Load character
    //     let characterType = ParseClass(document.getElementById('bottomCharacterTypeField').innerHTML, true);
    //     LoadCharacter(characterType, UserProfile.characters);

    //     // Replace with top selector elements
    //     document.getElementById('bottomCharacterTypeField').innerHTML = typeField;
    //     document.getElementById('bottomCharacterContainer').style.backgroundImage = `url(https://www.bungie.net${emblemLargeBg})`;
    //     document.getElementById('bottomCharacterIconImg').src = `https://www.bungie.net${emblemPath}`;
    //     document.getElementById('bottomCharacterPowerLevelField').innerHTML = powerLevelField;
    // });

    // Include/omit expired bounties checkbox (xp yield only)
    AddListener('checkboxIncludeExpiredBountiesInYield', 'change', function () {

        if (this.checked) {
            CacheChangeItem('includeExpiredBountiesInTable', true);
            relationsTable.toggles.expired = true;
            // relationsTable.BuildTable();
            return;
        };

        CacheChangeItem('includeExpiredBountiesInTable', false);
        relationsTable.toggles.expired = false;
        // relationsTable.BuildTable();

    });

    // Include/omit seasonal challenges from table
    AddListener('checkboxIncludeSeasonalChallengesInTable', 'change', function () {

        if (this.checked) {
            CacheChangeItem('includeSeasonalChallengesInTable', true);
            relationsTable.toggles.challenges = true;
            // relationsTable.BuildTable();
            return;
        };

        CacheChangeItem('includeSeasonalChallengesInTable', false);
        relationsTable.toggles.challenges = false;
        // relationsTable.BuildTable();
    });

    // Include/omit pve keys from table
    AddListener('toggleTypePVE', 'click', function () {

        if (this.checked) {
            CacheChangeItem('includePveInTable', true);
            relationsTable.toggles.pve = true;
            // relationsTable.BuildTable();
            return;
        };

        CacheChangeItem('includePveInTable', false);
        relationsTable.toggles.pve = false;
        // relationsTable.BuildTable();
    });

    // Include/omit pvp keys from table
    AddListener('toggleTypePVP', 'click', function () {

        if (this.checked) {
            CacheChangeItem('includePvpInTable', true);
            relationsTable.toggles.pvp = true;
            // relationsTable.BuildTable();
            return;
        };

        CacheChangeItem('includePvpInTable', false);
        relationsTable.toggles.pvp = false;
        // relationsTable.BuildTable();
    });

    // Warn icon hover -- remove when not needed
    AddListener('warnIcon', 'mouseover', function () {
        document.getElementById('warnHoverContent').style.display = 'block';
    });
    AddListener('warnIcon', 'mouseleave', function () {
        document.getElementById('warnHoverContent').style.display = 'none';
    });

    // Help interface tooltip for enforce relation affinity
    AddListener('tooltipEnforceRelationAffinity', 'mouseover', function () {
        document.getElementById('tooltipEnforceContent').style.display = 'block';
    });
    AddListener('tooltipEnforceRelationAffinity', 'mouseleave', function () {
        document.getElementById('tooltipEnforceContent').style.display = 'none';
    });

    // Help interface tooltip for enforce relation affinity
    AddListener('tooltipIncludeSinglePoints', 'mouseover', function () {
        document.getElementById('tooltipIncludeSinglePointContent').style.display = 'block';
    });
    AddListener('tooltipIncludeSinglePoints', 'mouseleave', function () {
        document.getElementById('tooltipIncludeSinglePointContent').style.display = 'none';
    });

    // Bounties navbar control
    AddListener('navBarBountiesButton', 'click', function () {

        // Toggle settings page in the case that it is open (accessibility)
        ToggleSettingsMenu();
        
        // Toggle corresponding pages
        let containerName = this.getAttribute('data-containerName');
        let containersToHide = containerNames.filter(x => x !== containerName);

        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(containerName).style.display = 'block';

        // Store the page as this is the page that was last visited (until it is changed)
        CacheChangeItem('lastVisitedPage', containerName);
    });


    // Challenges navbar control
    AddListener('navBarChallengesButton', 'click', function () {

        // Toggle settings page in the case that it is open (accessibility)
        ToggleSettingsMenu();
        
        // Toggle corresponding pages
        let containerName = this.getAttribute('data-containerName');
        let containersToHide = containerNames.filter(x => x !== containerName);

        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(containerName).style.display = 'block';

        // Store the page as this is the page that was last visited (until it is changed)
        CacheChangeItem('lastVisitedPage', containerName);
    });


    // Statistics navbar control
    AddListener('navBarStatisticsButton', 'click', function () {

        // Toggle settings page in the case that it is open (accessibility)
        ToggleSettingsMenu();
        
        // Toggle corresponding pages
        let containerName = this.getAttribute('data-containerName');
        let containersToHide = containerNames.filter(x => x !== containerName);

        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(containerName).style.display = 'block';

        // Store the page as this is the page that was last visited (until it is changed)
        CacheChangeItem('lastVisitedPage', containerName);
    });


    // Logout button
    AddListener('navBarLogoutIcon', 'click', function () {
        Logout();
    });


    // Settings button
    AddListener('navBarSettingsIcon', 'click', function () {

        let containerThatDoesNotContainSettings = document.getElementById('subContainer'),
            settingsGridContainer = document.getElementById('settingsGrid');

        if (containerThatDoesNotContainSettings.style.display === 'none') {
            settingsGridContainer.style.display = 'none';
            containerThatDoesNotContainSettings.style.display = 'block';
            return;
        };

        settingsGridContainer.style.display = 'flex';
        containerThatDoesNotContainSettings.style.display = 'none';
    });


    // Settings back button
    AddListener('settingsBackButtonContainer', 'click', function () {
        document.getElementById('subContainer').style.display = 'block';
        document.getElementById('settingsGrid').style.display = 'none';
    });


    // Settings back button
    AddListener('settingsSubMenuBackButtonContainer', 'click', function () {

        window.scrollTo(0, 0);
        
        document.getElementById('settingsSubMenuContainer').style.display = 'none';
        document.getElementById('settingsContainerMobile').style.display = 'block';
    });


    // Title button (secret setting activation)
    // AddListener('navBarTitle', 'click', function () {
    //     secretCount++;
    //     if (secretCount >= 7) {
    //         document.getElementById('settingsSecretContainer').style.display = 'block';
    //         CacheChangeItem('isSecretOn', true);
    //     };
    // });


    // General settings button
    AddListener('GeneralSettingsButton', 'click', function () {
        document.getElementById(`${currentSettingsMenu}`).style.display = 'none';
        currentSettingsMenu = 'generalSettingsContainer';
        document.getElementById('generalSettingsContainer').style.display = 'block';

        if (window.innerWidth <= 1050) {
            document.getElementById('settingsSubMenuContainer').style.display = 'block';
            document.getElementById('settingsContainerMobile').style.display = 'none';
        };
    });


    // Accessibility settings button
    AddListener('AccessibilitySettingsButton', 'click', function () {
        document.getElementById(`${currentSettingsMenu}`).style.display = 'none';
        currentSettingsMenu = 'accessibilitySettingsContainer';
        document.getElementById('accessibilitySettingsContainer').style.display = 'block';

        if (window.innerWidth <= 1050) {
            document.getElementById('settingsSubMenuContainer').style.display = 'block';
            document.getElementById('settingsContainerMobile').style.display = 'none';
        };
    });


    // Logout settings button
    AddListener('LogoutSettingsButton', 'click', function () {
        document.getElementById(`${currentSettingsMenu}`).style.display = 'none';
        currentSettingsMenu = 'logoutSettingsContainer';
        document.getElementById('logoutSettingsContainer').style.display = 'block';

        if (window.innerWidth <= 1050) {
            document.getElementById('settingsSubMenuContainer').style.display = 'block';
            document.getElementById('settingsContainerMobile').style.display = 'none';
        };
    });


    // Clear cache settings button
    AddListener('clearCacheSettingsButton', 'click', function () {
        window.localStorage.removeItem('userCache');
        indexedDB.deleteDatabase('keyval-store');
        window.location.reload();
    });


    // Logout settings button
    AddListener('logoutSettingsButton', 'click', function () {
        Logout();
    });


    // Refresh on tab focus checkbox
    AddListener('checkboxRefreshWhenFocused', 'click', function () {

        if (this.checked) {
            CacheChangeItem('isRefreshOnFocusToggled', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheChangeItem('isRefreshOnFocusToggled', false);
    });


    // Refresh on interval checkbox
    let refreshOnInterval;
    AddListener('checkboxRefreshOnInterval', 'change', function () {

        if (this.checked) {

            CacheChangeItem('isRefreshOnIntervalToggled', true);
            refreshOnInterval = setInterval(() => {

                // true = passive refresh
                MainEntryPoint(true)
                .catch((error) => {
                    console.error(error);
                });
            }, 120_000);

            return;
        };

        // Uncheck = clear interval and localStorage value
        CacheChangeItem('isRefreshOnIntervalToggled', false);
        clearInterval(refreshOnInterval);
    });


    // Remember last page checkbox
    AddListener('checkboxRememberLastpage', 'change', function () {

        if (this.checked) {

            // Toggle boolean
            CacheChangeItem('isRememberLastPageToggled', true);

            // Grey out default page dropdown and disable it
            document.getElementById('defaultViewDropdownContainer').style.opacity = '50%';
            document.getElementById('defaultViewDropdown').options[0].disabled = true;
            document.getElementById('defaultViewDropdown').options[1].disabled = true;
            document.getElementById('defaultViewDropdown').options[2].disabled = true;
            return;
        };

        // Uncheck = clear localStorage value
        CacheChangeItem('isRememberLastPageToggled', false);

        // un-Grey out default page dropdown and disable it
        document.getElementById('defaultViewDropdownContainer').style.opacity = '100%';
        document.getElementById('defaultViewDropdown').options[0].disabled = false;
        document.getElementById('defaultViewDropdown').options[1].disabled = false;
        document.getElementById('defaultViewDropdown').options[2].disabled = false;
    });


    // Use secret icons checkbox
    AddListener('checkboxUseSecretIcons', 'click', function () {
        
        if (this.checked) {
            CacheChangeItem('isSecretOn', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheChangeItem('isSecretOn', false);
    });


    // Mobile settings context menu button
    AddListener('contextMenuSettingsMobile', 'click', function() {
        document.getElementById('settingsGrid').style.display = 'flex';
        document.getElementById('subContainer').style.display = 'none';
    });


    // Dropdown selection
    AddListener('defaultViewDropdown', 'change', function () {
        log(this.value);
        const contentViewsThatINeedToChange = [
            'bountiesContainer', 
            'seasonalChallengesContainer',
            'statisticsContainer'
        ];
        
        // Turn off all other views, that is not the chosen ones
        contentViewsThatINeedToChange.forEach(elementID => {

            if (elementID !== this.value) {
                document.getElementById(elementID).style.display = 'none';
                return;
            };

            document.getElementById(elementID).style.display = 'block';
        });

        // Save the chosen item to cache and change the current view to the chosen one
        CacheChangeItem('defaultContentView', this.value);
        document.getElementById(this.value).style.display = 'block';
    });


    // Accent color change
    AddListener('settingsAccentColorButton', 'click', function () {
        accentColor.UpdateAccentColor(this.getAttribute('data-color'));
    }, 'class');

    
    // Refresh on tab focus
    AddListener('window', 'focus', function () {
        
        const isRefreshOnFocusToggled = JSON.parse(localStorage.getItem('userCache')).isRefreshOnFocusToggled;
        if (isRefreshOnFocusToggled) {
            MainEntryPoint(true)
            .catch((error) => {
                console.error(error);
            });
        };
    });


    // Accessibility image size range slider 
    AddListener('accessibilityImageSizeSlider', 'input', function () {
        itemDisplay.UpdateItemSize(this.value);
    });


    // Accessibility image size reset
    AddListener('accessibilityImageDemoReset', 'click', function () {
        itemDisplay.UpdateItemSize(55);
        document.getElementById('accessibilityImageSizeSlider').value = 55;
    });


    // Accessibility accent color reset
    AddListener('accessibilityAccentColorReset', 'click', function () {
        accentColor.UpdateAccentColor('#ED4D4D');
        document.getElementById('settingCustomColorInput').value = '#ED4D4D';
    });


    // Accessibility font size range slider 
    AddListener('accessibilityFontSizeSlider', 'input', function () {
        // Change font size multiplier CSS variable
        let root = document.querySelector(':root');
        root.style.setProperty('--fontSizeMultiplier', `1.${this.value}`);
    });


    // Custom color input
    AddListener('settingCustomColorInput', 'input', function () {
        accentColor.UpdateAccentColor(this.value);
    });


    // Mobile navbar bounties button
    AddListener('bountiesMenuMobile', 'click', function() {

        ToggleSettingsMenu();

        let containersToHide = containerNames.filter(x => x !== this.getAttribute('data-containerName'));
        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(this.getAttribute('data-containerName')).style.display = 'block';
    });

    // Mobile navbar challenges button
    AddListener('seasonalMenuMobile', 'click', function() {

        ToggleSettingsMenu();

        let containersToHide = containerNames.filter(x => x !== this.getAttribute('data-containerName'));
        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(this.getAttribute('data-containerName')).style.display = 'block';
    });

    // Mobile navbar statistics button
    AddListener('statsMenuMobile', 'click', function() {

        ToggleSettingsMenu();
        
        let containersToHide = containerNames.filter(x => x !== this.getAttribute('data-containerName'));
        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(this.getAttribute('data-containerName')).style.display = 'block';
    });

    // Dropdown selection for yields
    AddListener('dropdownYield', 'click', function () {

        // This boolean is an attempt to block on subsequent clicks whilst the dropdown is being toggled
        var dropdownBoolean = {
            isElementBeingDroppedDown: false,
            toggleBoolean: function () {
                this.isElementBeingDroppedDown = !this.isElementBeingDroppedDown;
            }
        };

        let dropdownContent = document.getElementById('yieldDropdownContainer'),
            arrow = document.getElementById('arrowYield');

        AddDropdownEvent(dropdownContent, arrow, dropdownBoolean);
    });

    // Dropdown selecton for modifiers
    AddListener('dropdownModifiers', 'click', function () {

        // This boolean is an attempt to block on subsequent clicks whilst the dropdown is being toggled
        var dropdownBoolean = {
            isElementBeingDroppedDown: false,
            toggleBoolean: function () {
                this.isElementBeingDroppedDown = !this.isElementBeingDroppedDown;
            }
        };

        let dropdownContent = document.getElementById('modifiersDropdownContainer'),
            arrow = document.getElementById('arrowModifiers');

        AddDropdownEvent(dropdownContent, arrow, dropdownBoolean);
    });

    
    /*
        Previous and Next arrows for seasonal challenges
        Get maximum chunks that will be held in seasonalChallengeItems
        ^ This value will the be the last index (page)
    */
    let currentIndex = 0;
    let lastIndex = Math.trunc(UserProfile.misc.challengesCount / 6) - 1;

    // Show next chunk of seasonal challenges
    AddListener('nextSeasonalChallengePageButton', 'click', function () {

        // Hide current page
        document.getElementById(`challengeChunk${currentIndex}`).style.display = 'none';

        // If first page, set index to last page
        if (currentIndex === lastIndex) {
            currentIndex = 0;
        }

        // Else, decrement index
        else {
            currentIndex++;
        };

        // Show current page
        document.getElementById(`challengeChunk${currentIndex}`).style.display = 'grid';
    });

    // Show previous chunk of seasonal challenges
    AddListener('previousSeasonalChallengePageButton', 'click', function () {

        // Hide current page
        document.getElementById(`challengeChunk${currentIndex}`).style.display = 'none';

        // If first page, set index to last page
        if (currentIndex === 0) {
            currentIndex = lastIndex;
        }

        // Else, decrement index
        else {
            currentIndex--;
        };

        // Show current page
        document.getElementById(`challengeChunk${currentIndex}`).style.display = 'grid';
    });

    // Button to dismiss the popup div
    AddListener('popupDismissButton', 'click', function () {
        document.getElementById('loadpopupContainer').style.display = 'none';
        document.getElementById('loadpopupBackplate').style.display = 'none';
    });

    // Click on whitespace to close popup
    AddListener('loadpopupBackplate', 'click', function () {
        document.getElementById('loadpopupContainer').style.display = 'none';
        document.getElementById('loadpopupBackplate').style.display = 'none';
    });

    // Show "What's New" popup
    AddListener('checkboxShowPopup', 'change', function () {

        // Toggle boolean
        if (this.checked) {
            CacheChangeItem('showPopup', true);
            return;
        };

        // Uncheck = clean localStorage value
        CacheChangeItem('showPopup', false);
    });
};

// {"key":"#ED4D4D","accentColor":"#ED4D4D","includeSeasonalChallengesInTable":true,"defaultContentView":"bountiesContainer","lastChar":"2305843009263012379","currentChar":{"membershipId":"4611686018447977370","membershipType":1,"characterId":"2305843009263012379","dateLastPlayed":"2023-03-27T23:59:35Z","minutesPlayedThisSession":"2","minutesPlayedTotal":"71510","light":1795,"stats":{"144602215":18,"392767087":100,"1735777505":100,"1935470627":1795,"1943323491":37,"2996146975":40,"4244567218":80},"raceHash":2803282938,"genderHash":3111576190,"classHash":3655393761,"raceType":1,"classType":0,"genderType":0,"emblemPath":"/common/destiny2_content/icons/09778fd6deb3a4cb60f57659d3715328.jpg","emblemBackgroundPath":"/common/destiny2_content/icons/aaca6252f13a969b8185d747e4dc5e7c.jpg","emblemHash":4077939647,"emblemColor":{"red":19,"green":18,"blue":20,"alpha":255},"levelProgression":{"progressionHash":1716568313,"dailyProgress":0,"dailyLimit":0,"weeklyProgress":0,"weeklyLimit":0,"currentProgress":0,"level":50,"levelCap":50,"stepIndex":50,"progressToNextLevel":0,"nextLevelAt":0},"baseCharacterLevel":50,"percentToNextLevel":0,"titleRecordHash":1384029371},"lastVisitedPage":"bountiesContainer","showPopup":true}

// Configure defaults/Loads data from localStorage
export async function BuildWorkspace() {

    // Get time until weekly reset (timezone specific ofc)
    document.getElementById('timeUntilWeeklyReset').innerHTML = `Weekly Reset: ${getNextTuesday()}`;

    let rangeSlider = document.getElementById('accessibilityImageSizeSlider');
    let bountyImage = document.getElementById('accessibilityImageDemo');
    let showPopupBool = false; // default

    // Scroll to top of page (idk but it wasn't sticking to the top)
    window.scrollTo(0, 0);

    // Change popup top bar colour to what is saved in localStorage
    await CacheReturnItem('accentColor')
    .then((result) => {
        accentColor.UpdateAccentColor(result);
    })
    .catch((error) => {
        CacheChangeItem('accentColor', '#ED4D4D');
        accentColor.UpdateAccentColor('#ED4D4D');
        console.error(error);
    });
    
    // Put version number in navbar and settings footer
    document.getElementById('navBarVersion').innerHTML = `${import.meta.env.version}`;
    document.getElementById('settingsFooterVersionField').innerHTML = `${import.meta.env.version}`;
    document.getElementById('popupVersion').innerHTML = `${import.meta.env.version}`;

    // Check if load is first time load on this version
    await CacheReturnItem('storedVersion')
    .then((result) => {

        // If stored version is not set, set it
        if (result === undefined) {
            CacheChangeItem('storedVersion', import.meta.env.version);
        }

        // If stored version !== equal to the current version
        else if (result !== import.meta.env.version) {

            // Toggle boolean and set stored version to current
            showPopupBool = true;
            CacheChangeItem('storedVersion', import.meta.env.version);
        };

    })
    .catch((error) => {
        console.error(error);
    });

    // Check if its first time visit
    await CacheReturnItem('isFirstTimeVisit')
    .then((result) => {

        // Is first time load
        if (result === undefined) {

            // Show corresponding content in popup
            document.getElementById('firstTimeLoadPopupContent').style.display = 'block';

            // Toggle boolean
            CacheChangeItem('isFirstTimeVisit', false);
            return;
        };

    })
    .catch((error) => {
        console.error(error);
    });

    // Check if popup should be shown
    await CacheReturnItem('showPopup')
    .then((result) => {

        // Show popup container
        if (result) {
            if (showPopupBool) {
                document.getElementById('loadpopupContainer').style.display = 'block';
                document.getElementById('loadpopupBackplate').style.display = 'block';
            };
            document.getElementById('checkboxShowPopup').checked = true;
            return;
        };

        // If no result, set to false
        document.getElementById('checkboxShowPopup').checked = false;
    })
    .catch((error) => {
        console.error(error);
    });
    
    // Push cache results for itemDisplaySize to variables
    await CacheReturnItem('itemDisplaySize')
    .then((result) => {
        itemDisplay.UpdateItemSize(result);
    })
    .catch((error) => {
        CacheChangeItem('itemDisplaySize', 55);
        itemDisplay.UpdateItemSize(55);
    });

    // Get state of secret setting
    CacheReturnItem('isSecretOn')
    .then((result) => {
        if (result) {
            document.getElementById('settingsSecretContainer').style.display = 'block';
        };
    });

    // Defaults for checkboxIncludeSeasonalChallengesInTable
    CacheReturnItem('includeSeasonalChallengesInTable')
    .then((result) => {

        // If there is no result, set default to true
        if (!result) {
            CacheChangeItem('includeSeasonalChallengesInTable', true);
            document.getElementById('checkboxIncludeSeasonalChallengesInTable').checked = true;
        };

        // If there is a result, set checkbox to result
        document.getElementById('checkboxIncludeSeasonalChallengesInTable').checked = result;
    });

    // Slider section values
    rangeSlider.value = itemDisplay.itemDisplaySize;
    bountyImage.style.width = `${itemDisplay.itemDisplaySize}px`;

    // Set checkboxes to chosen state, from localStorage (userCache)
    // Using ternary in the case that a boolean is not returned from CacheReturnItem
    document.getElementById('toggleTypePVP').checked = await CacheReturnItem('includePvpInTable') ? true : false;
    document.getElementById('toggleTypePVE').checked = await CacheReturnItem('includePveInTable') ? true : false;
    document.getElementById('checkboxRefreshWhenFocused').checked = await CacheReturnItem('isRefreshOnFocusToggled') ? true : false;
    document.getElementById('checkboxRefreshOnInterval').checked = await CacheReturnItem('isRefreshOnIntervalToggled') ? true : false;
    document.getElementById('checkboxIncludeExpiredBountiesInYield').checked = await CacheReturnItem('includeExpiredBountiesInYield') ? true : false;
    document.getElementById('checkboxIncludeExpiredBountiesInTable').checked = await CacheReturnItem('includeExpiredBountiesInTable') ? true : false;
    document.getElementById('checkboxIncludeSeasonalChallengesInYield').checked = await CacheReturnItem('includeSeasonalChallengesInYield') ? true : false;
    document.getElementById('checkboxIncludeSeasonalChallengesInTable').checked = await CacheReturnItem('includeSeasonalChallengesInTable') ? true : false;

    // Check if rememberLastPage is true
    await CacheReturnItem('isRememberLastPageToggled')
    .then((result) => {

        // Set the checkbox state using the boolean stored in localStorage
        if (result) {

            document.getElementById('checkboxRememberLastpage').checked = result;

            // Change the dropdown box above to correct state
            document.getElementById('defaultViewDropdownContainer').style.opacity = '50%';
            document.getElementById('defaultViewDropdown').options[0].disabled = true;
            document.getElementById('defaultViewDropdown').options[1].disabled = true;
            document.getElementById('defaultViewDropdown').options[2].disabled = true;
        };
    })
    .catch((error) => {
        console.error(error);
    });



    // Parse defaultContentView results and push to DOM
    await CacheReturnItem('defaultContentView')
    .then((result) => {

        // Set default view if there is none saved already
        if (!result) {
            CacheChangeItem('defaultContentView', 'bountiesContainer');
            document.getElementById(`bountiesContainer`).style.display = 'block';
            document.getElementById('defaultViewDropdown').value = 'bountiesContainer';
            return;
        };
    })
    .catch((error) => {
        console.error(error);
    });

    // Check if last page is being remembered, if so make the default the last visited page
    await CacheReturnItem('isRememberLastPageToggled')
    .then((result) => {

        // If true, hide all pages (elegantly!) then show the last visited one
        if (result) {
            CacheReturnItem('lastVisitedPage')
            .then((pageName) => {
                document.getElementById('bountiesContainer').style.display = 'none';
                document.getElementById('seasonalChallengesContainer').style.display = 'none';
                document.getElementById('statisticsContainer').style.display = 'none';
                document.getElementById(pageName).style.display = 'block';
            })
            .catch((error) => {
                return error;
            });
        };
    })
    .catch((error) => {
        console.error(error);
    });

    // Unfold Yield dropdown
    let yieldDropdownContainer = document.getElementById('yieldDropdownContainer'),
        yieldDropdownArrow = document.getElementById('arrowYield');

    yieldDropdownContainer.style.display = 'block'
    yieldDropdownContainer.className = 'pre';
    yieldDropdownContainer.className += ' pro';
    yieldDropdownArrow.style.transform = 'rotate(0deg)';

    // Unfold Modifiers dropdown
    let modifiersDropdownContainer = document.getElementById('modifiersDropdownContainer'),
        modifiersDropdownArrow = document.getElementById('arrowModifiers');

    modifiersDropdownContainer.style.display = 'flex';
    modifiersDropdownContainer.className = 'pre';
    modifiersDropdownContainer.className += ' pro';
    modifiersDropdownArrow.style.transform = 'rotate(0deg)';

};
