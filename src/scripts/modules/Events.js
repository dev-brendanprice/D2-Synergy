import { 
    MainEntryPoint, 
    itemDisplay,
    accentColor,
    itemDefinitions,
    UserProfile, 
    profileWideData } from '../user.js';
import { LoadCharacter } from './LoadCharacter.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { CacheReturnItem } from './CacheReturnItem.js';
import { Logout } from './Logout.js';
import { ParseClass } from './ParseClass.js';
import { getNextTuesday } from './GetNextReset.js';
import { FetchBungieUser } from '../oauth/FetchBungieUser.js';
import { relationsTable } from './relationsTable.js';


// Misc
const log = console.log.bind(console),
      localStorage = window.localStorage,
      sessionStorage = window.sessionStorage;
let secretCount = 0;

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


// Control states for challenges section
let controlStates = { // defaults
    curGrpName: 'Week 1',
    curDrpName: 'Week_1'
};


// Event listener wrapper
export const AddListener = function (elementName, event, callback, selectorType) {

    try {

        if (elementName === 'window') {
            window.addEventListener(event, callback);
            return;
        };

        if (selectorType || selectorType === 'class' || selectorType === 'CLASS') {
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
        LoadCharacter(characterId, UserProfile.characters, false, false);

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

    // Hide *orange* warning tooltip at bottom of page
    AddListener('warningTooltipCloseButton', 'click', function () {
        document.getElementById('warningTooltip').style.display = 'none';
        sessionStorage.setItem('warningClosed', true);
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
    // AddListener('navBarBountiesButton', 'click', function () {

    //     // Toggle settings page in the case that it is open (accessibility)
    //     ToggleSettingsMenu();
        
    //     // Toggle corresponding pages
    //     let containerName = this.getAttribute('data-containerName');
    //     let containersToHide = containerNames.filter(x => x !== containerName);

    //     for (let container of containersToHide) {
    //         document.getElementById(`${container}`).style.display = 'none';
    //     };
    //     document.getElementById(containerName).style.display = 'block';

    //     // Store the page as this is the page that was last visited (until it is changed)
    //     CacheChangeItem('lastVisitedPage', containerName);
    // });


    // Challenges navbar control
    // AddListener('navBarChallengesButton', 'click', function () {

    //     // Toggle settings page in the case that it is open (accessibility)
    //     ToggleSettingsMenu();
        
    //     // Toggle corresponding pages
    //     let containerName = this.getAttribute('data-containerName');
    //     let containersToHide = containerNames.filter(x => x !== containerName);

    //     for (let container of containersToHide) {
    //         document.getElementById(`${container}`).style.display = 'none';
    //     };
    //     document.getElementById(containerName).style.display = 'block';

    //     // Store the page as this is the page that was last visited (until it is changed)
    //     CacheChangeItem('lastVisitedPage', containerName);
    // });


    // Statistics navbar control
    // AddListener('navBarStatisticsButton', 'click', function () {

    //     // Toggle settings page in the case that it is open (accessibility)
    //     ToggleSettingsMenu();
        
    //     // Toggle corresponding pages
    //     let containerName = this.getAttribute('data-containerName');
    //     let containersToHide = containerNames.filter(x => x !== containerName);

    //     for (let container of containersToHide) {
    //         document.getElementById(`${container}`).style.display = 'none';
    //     };
    //     document.getElementById(containerName).style.display = 'block';

    //     // Store the page as this is the page that was last visited (until it is changed)
    //     CacheChangeItem('lastVisitedPage', containerName);
    // });


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

    // (navbar) Help button
    AddListener('navBarHelpIcon', 'click', function() {
        // Open new tab and focus it
        window.open('https://github.com/brendanprice2003/D2-Synergy/wiki/User-Guide', '_blank').focus();
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
            // refreshOnInterval = setInterval(() => {

            //     // true = passive refresh
            //     MainEntryPoint(true)
            //     .catch((error) => {
            //         console.error(error);
            //     });
            // }, 10_000);

            return;
        };

        // Uncheck = clear interval and localStorage value
        CacheChangeItem('isRefreshOnIntervalToggled', false);
        // clearInterval(refreshOnInterval);
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

    // Secret var goes here
    let secretCounter = 0;

    // Accent color change
    AddListener('settingsAccentColorButton', 'click', function () {

        let type = this.getAttribute('data-color');

        // Change color of bar
        accentColor.UpdateAccentColor(type);
        
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

    // // Dropdown selection for yields
    // AddListener('dropdownYield', 'click', function () {

    //     // This boolean is an attempt to block on subsequent clicks whilst the dropdown is being toggled
    //     var dropdownBoolean = {
    //         isElementBeingDroppedDown: false,
    //         toggleBoolean: function () {
    //             this.isElementBeingDroppedDown = !this.isElementBeingDroppedDown;
    //         }
    //     };

    //     let dropdownContent = document.getElementById('yieldDropdownContainer'),
    //         arrow = document.getElementById('arrowYield');

    //     AddDropdownEvent(dropdownContent, arrow, dropdownBoolean);
    // });

    // // Dropdown selecton for modifiers
    // AddListener('dropdownModifiers', 'click', function () {

    //     // This boolean is an attempt to block on subsequent clicks whilst the dropdown is being toggled
    //     var dropdownBoolean = {
    //         isElementBeingDroppedDown: false,
    //         toggleBoolean: function () {
    //             this.isElementBeingDroppedDown = !this.isElementBeingDroppedDown;
    //         }
    //     };

    //     let dropdownContent = document.getElementById('modifiersDropdownContainer'),
    //         arrow = document.getElementById('arrowModifiers');

    //     AddDropdownEvent(dropdownContent, arrow, dropdownBoolean);
    // });

    
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

    // Modal menu for Bounties, seasonal challenges and statistics section
    let sectionsModalOpen = false;
    AddListener('sectionsDropdownModal', 'click', function () {

        // Check for boolean, open/close accordingly
        let container = document.getElementById('sectionsDropdownButtonsContainer');

        if (sectionsModalOpen) {
            container.style.display = 'none'; // Hide dropdown
            sectionsModalOpen = false;
        }
        else {
            container.style.display = 'flex'; // Show it
            sectionsModalOpen = true;
        };
    });

    // (above) Modal menu buttons
    AddListener('dropdownButtonTextSections', 'click', function () {

        // Get sections that are to be hidden
        let sectionType = this.getAttribute('data-section');
        let sectionName = this.getAttribute('data-sectionName');
        let containersToHide = containerNames.filter(x => x !== sectionType);

        // Loop over other sections and hide
        for (let section of containersToHide) {
            document.getElementById(`${section}`).style.display = 'none';
        };
        document.getElementById(sectionType).style.display = 'block';

        // Change dropdown modal text
        document.getElementsByClassName('dropdownModalText')[0].innerHTML = `${sectionName}`;

        // Hide/show subheading statistics in all states
        if (sectionType === 'bountiesContainer') {
            document.getElementById('bountiesSubheadingStatistics').style.display = 'flex';
            document.getElementById('challengesSubheadingStatistics').style.display = 'none';
        }
        else if (sectionType === 'seasonalChallengesContainer') {
            document.getElementById('bountiesSubheadingStatistics').style.display = 'none';
            document.getElementById('challengesSubheadingStatistics').style.display = 'flex';
        }
        else {
            document.getElementById('bountiesSubheadingStatistics').style.display = 'none';
            document.getElementById('challengesSubheadingStatistics').style.display = 'none';
        };

        // Cache section to, opens as default on load with correct settings
        CacheChangeItem('lastVisitedPage', sectionType);

        // Close modal dropdown, reverse boolean
        document.getElementById('sectionsDropdownButtonsContainer').style.display = 'none';
        document.getElementById('sectionTypeModalText').innerHTML = sectionName;
        sectionsModalOpen = false;

    }, 'class');

    // Modal menu for Bounties, seasonal challenges and statistics section
    let challsFilterModalOpen = false;
    AddListener('groupsDropdownModal', 'click', function () {

        // Check for boolean, open/close accordingly
        let container = document.getElementById('groupsDropdownForChallenges');
        log(challsFilterModalOpen);
        if (challsFilterModalOpen) {
            container.style.display = 'none'; // Hide dropdown
            challsFilterModalOpen = false;
        }
        else {
            container.style.display = 'flex'; // Show it
            challsFilterModalOpen = true;
        };
    });

    // Dropdown for challenge groups (week 1,2,3 or all)
    AddListener('groupsDropdownButtonTextSections', 'click', function () {

        // Show corresponding group container, hide current one
        let selectedGroup = this.getAttribute('data-groupname');
        let previousGroup = controlStates.curGrpName;

        // Hide previously selected groups
        document.getElementById(`compact_${previousGroup}`).style.display = 'none';
        document.getElementById(`wide_${previousGroup}`).style.display = 'none';

        // Show new groups
        document.getElementById(`compact_${selectedGroup}`).style.display = 'block';
        document.getElementById(`wide_${selectedGroup}`).style.display = 'block';

        // Update controlStates arr
        controlStates.curGrpName = `${selectedGroup}`;

        // Hide dropdown list again, change dropdown text, reverse dropdown boolean
        document.getElementById('groupsDropdownForChallenges').style.display = 'none';
        document.getElementById('groupsDropdownText').innerHTML = selectedGroup;
        challsFilterModalOpen = false;

    }, 'class');

    // Controls for next, prev page, different table views/layouts, filter
    AddListener('challengeSectionButtonsTop', 'click', function () {

        // Show corresponding layout, according to control
        let buttonType = this.getAttribute('data-buttonType');
        let layoutSplc = buttonType.split('_')[1] || buttonType;

        // Check button type
        if (layoutSplc === 'compact') {

            document.getElementsByClassName('gridCompact')[0].style.display = 'block';
            document.getElementsByClassName('gridWide')[0].style.display = 'none';

            // Retain border:hover style until opposite button is pressed
            document.getElementById('btnCompact').style.border = '2px solid white';
            document.getElementById('btnWide').style.border = '2px solid gray';
        }

        else if (layoutSplc === 'wide') {

            document.getElementsByClassName('gridWide')[0].style.display = 'block';
            document.getElementsByClassName('gridCompact')[0].style.display = 'none';

            // Retain border:hover style until opposite button is pressed
            document.getElementById('btnWide').style.border = '2px solid white';
            document.getElementById('btnCompact').style.border = '2px solid gray';
        };
        

    }, 'class');
};


// Configure defaults/Loads data from localStorage
export async function BuildWorkspace() {

    // Check if alpha notice warning has been closed
    let isAlphaNoticeClosed = sessionStorage.getItem('warningClosed');
    if (isAlphaNoticeClosed) {
        document.getElementById('warningTooltip').style.display = 'none';
    };

    // Get time until weekly reset (timezone specific ofc)
    document.getElementById('timeUntilWeeklyReset').innerHTML = `Weekly Reset: ${getNextTuesday()}`;

    let rangeSlider = document.getElementById('accessibilityImageSizeSlider');
    let bountyImage = document.getElementById('accessibilityImageDemo');
    let showPopupBool = false; // default

    // Scroll to top of page (idk but it wasn't sticking to the top)
    window.scrollTo(0, 0);
    
    // Put version number in navbar and settings footer
    document.getElementById('navBarVersion').innerHTML = `${import.meta.env.version}`;
    document.getElementById('navBarVersion').style.opacity = 100;
    document.getElementById('settingsFooterVersionField').innerHTML = `${import.meta.env.version}`;
    document.getElementById('popupVersion').innerHTML = `${import.meta.env.version}`;

    // Change top bar colour to localStorage val
    await CacheReturnItem('accentColor')
    .then((result) => {
        if (result !== undefined) {
            accentColor.UpdateAccentColor(result);
        }
        else {
            CacheChangeItem('accentColor', '#ED4D4D');
            accentColor.UpdateAccentColor('#ED4D4D');
        };
    })
    .catch((error) => {
        console.error(error);
    });

    // Check to see if all profiles should be loaded
    // await CacheReturnItem('useProfileWide')
    // .then((res) => {
        
    //     // Check if val doesnt exist
    //     if (res === undefined) {
    //         CacheChangeItem('useProfileWide', false); // Default
    //         profileWideData.AssignProfilewideBool(false);
    //         return;
    //     };

    //     // else
    //     profileWideData.AssignProfilewideBool(res);
    // })
    // .catch((error) => {
    //     console.error(error);
    // });

    // Check if load is first time load on this version
    await CacheReturnItem('storedVersion')
    .then((result) => {

        // set if undefined
        if (result === undefined) {
            showPopupBool = true;
            CacheChangeItem('storedVersion', import.meta.env.version);
        }

        // if current version does not match stored version
        else if (result !== import.meta.env.version) {
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

        if (result === undefined) {

            // If it has not been set, use defaults
            document.getElementById('checkboxShowPopup').checked = true;
            CacheChangeItem('showPopup', true);
            return;
        };

        // If result is false, set .checked to false
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
    document.getElementById('checkboxIncludeExpiredBountiesInYield').checked = await CacheReturnItem('includeExpiredBountiesInYield') ? true : false;
    document.getElementById('checkboxIncludeExpiredBountiesInTable').checked = await CacheReturnItem('includeExpiredBountiesInTable') ? true : false;
    document.getElementById('checkboxIncludeSeasonalChallengesInYield').checked = await CacheReturnItem('includeSeasonalChallengesInYield') ? true : false;
    document.getElementById('checkboxIncludeSeasonalChallengesInTable').checked = await CacheReturnItem('includeSeasonalChallengesInTable') ? true : false;


    // Check if boolean has been set for refreshing on interval
    await CacheReturnItem('isRefreshOnIntervalToggled')
    .then((res) => {

        // Check if this bool has been set, set default, which is false
        if (res === undefined || res) {
            CacheChangeItem('isRefreshOnIntervalToggled', true);
            document.getElementById('checkboxRefreshOnInterval').checked = true;
            return;
        };

        // Else set to false
        document.getElementById('checkboxRefreshOnInterval').checked = false;
    })
    .catch((error) => {
        console.error(error);
    });

    // Refresh on interval
    setInterval( async function() {

        await CacheReturnItem('isRefreshOnIntervalToggled')
        .then((res) => {

            // true = passive refresh
            if (res) {
                MainEntryPoint(true)
                .catch((error) => {
                    console.error(error);
                });
            };

        })
        .catch((error) => {
            console.error(error);
        });

    }, (60_000) * 5);
    
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

        // If true, hide all pages then show the last visited one
        if (result) {
            CacheReturnItem('lastVisitedPage')
            .then((pageName) => {

                // Hide all sections
                document.getElementById('bountiesContainer').style.display = 'none';
                document.getElementById('seasonalChallengesContainer').style.display = 'none';
                document.getElementById('statisticsContainer').style.display = 'none';
                document.getElementById(pageName).style.display = 'block';

                // Hide/show subheading statistics
                if (pageName == 'bountiesContainer') {
                    document.getElementById('bountiesSubheadingStatistics').style.display = 'flex';
                    document.getElementById('challengesSubheadingStatistics').style.display = 'none';
                    document.getElementsByClassName('dropdownModalText')[0].innerHTML = 'Bounties';
                }
                else if (pageName == 'seasonalChallengesContainer') {
                    document.getElementById('bountiesSubheadingStatistics').style.display = 'none';
                    document.getElementById('challengesSubheadingStatistics').style.display = 'flex';
                    document.getElementsByClassName('dropdownModalText')[0].innerHTML = 'Challenges';
                }
                else {
                    document.getElementById('bountiesSubheadingStatistics').style.display = 'none';
                    document.getElementById('challengesSubheadingStatistics').style.display = 'none';
                    document.getElementsByClassName('dropdownModalText')[0].innerHTML = 'Statistics';
                };
            })
            .catch((error) => {
                return error;
            });
        };
    })
    .catch((error) => {
        console.error(error);
    });

    // // Unfold Yield dropdown
    // let yieldDropdownContainer = document.getElementById('yieldDropdownContainer'),
    //     yieldDropdownArrow = document.getElementById('arrowYield');

    // yieldDropdownContainer.style.display = 'block'
    // yieldDropdownContainer.className = 'pre';
    // yieldDropdownContainer.className += ' pro';
    // yieldDropdownArrow.style.transform = 'rotate(0deg)';

    // // Unfold Modifiers dropdown
    // let modifiersDropdownContainer = document.getElementById('modifiersDropdownContainer'),
    //     modifiersDropdownArrow = document.getElementById('arrowModifiers');

    // modifiersDropdownContainer.style.display = 'flex';
    // modifiersDropdownContainer.className = 'pre';
    // modifiersDropdownContainer.className += ' pro';
    // modifiersDropdownArrow.style.transform = 'rotate(0deg)';

};
