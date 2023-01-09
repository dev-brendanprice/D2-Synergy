import { 
    charBounties,
    MainEntryPoint, 
    eventFilters,
    itemDisplay,
    accentColor } from '../user.js';
import { 
    CacheAuditItem, 
    CacheReturnItem,
    Logout } from './ModuleScript.js';
import { LoadCharacter } from './LoadCharacter.js';


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


// Add all event listeners
export async function AddEventListeners() {

    // Bounties navbar control
    AddListener('navBarBountiesButton', 'click', function () {
        
        let containersToHide = containerNames.filter(x => x !== this.getAttribute('data-containerName'));
        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(this.getAttribute('data-containerName')).style.display = 'block';
    });


    // Challenges navbar control
    AddListener('navBarChallengesButton', 'click', function () {
        
        let containersToHide = containerNames.filter(x => x !== this.getAttribute('data-containerName'));
        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(this.getAttribute('data-containerName')).style.display = 'block';
    });


    // Statistics navbar control
    AddListener('navBarStatisticsButton', 'click', function () {
        
        let containersToHide = containerNames.filter(x => x !== this.getAttribute('data-containerName'));
        for (let container of containersToHide) {
            document.getElementById(`${container}`).style.display = 'none';
        };
        document.getElementById(this.getAttribute('data-containerName')).style.display = 'block';
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
        document.getElementById('settingsSubMenuContainer').style.display = 'none';
        document.getElementById('settingsContainerMobile').style.display = 'block';
    });


    // Character buttons
    for (let i=0; i <= 2; i++) {
        AddListener(`charContainer${i}`, 'click', () => {
            LoadCharacter(i);
        });
    };


    // Title button (secret setting activation)
    AddListener('navBarTitle', 'click', function () {
        secretCount++;
        if (secretCount >= 7) {
            document.getElementById('settingsSecretContainer').style.display = 'block';
            CacheAuditItem('isSecretOn', true);
        };
    });


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
            CacheAuditItem('isRefreshOnFocusToggled', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheAuditItem('isRefreshOnFocusToggled', false);
    });


    // Refresh on interval checkbox
    let refreshOnInterval;
    AddListener('checkboxRefreshOnInterval', 'change', function () {

        if (this.checked) {

            CacheAuditItem('isRefreshOnIntervalToggled', true);
            refreshOnInterval = setInterval(() => {

                // true = passive refresh
                MainEntryPoint(true)
                .catch((error) => {
                    console.error(error);
                });
            }, 120_000);

            document.getElementById('loadingIcon').style.display = 'none';
            document.getElementById('loadingText').style.marginTop = '-65px';
            return;
        };

        // Uncheck = clear interval and localStorage value
        CacheAuditItem('isRefreshOnIntervalToggled', false);
        clearInterval(refreshOnInterval);
    });


    // Use secret icons checkbox
    AddListener('checkboxUseSecretIcons', 'click', function () {
        
        if (this.checked) {
            CacheAuditItem('isSecretOn', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheAuditItem('isSecretOn', false);
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
        CacheAuditItem('defaultContentView', this.value);
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
    // AddListener('accessibilityFontSizeSlider', 'input', function () {
    //     itemDisplay.UpdateItemSize(this.value);
    // });


    // Custom color input
    AddListener('settingCustomColorInput', 'input', function () {
        accentColor.UpdateAccentColor(this.value);
    });
};


// Configure defaults/Loads data from localStorage
export async function BuildWorkspace() {

    // let fubar = document.querySelector(':root');
    // let variable = (getComputedStyle(fubar).getPropertyValue('--fontSize')).split('px')[0];
    // let bru = variable * 1.4;
    // document.getElementById('fontSizeTest').style.fontSize = `${bru}px`;

    let rangeSlider = document.getElementById('accessibilityImageSizeSlider'),
        bountyImage = document.getElementById('accessibilityImageDemo');

    
    // Put version number in navbar and settings footer
    document.getElementById('navBarVersion').innerHTML = `${import.meta.env.version}`;
    document.getElementById('settingsFooterVersionField').innerHTML = `${import.meta.env.version}`;

    // Configure accent color
    await CacheReturnItem('accentColor')
    .then((result) => {
        accentColor.UpdateAccentColor(result);
    })
    .catch((error) => {
        CacheAuditItem('accentColor', '#ED4D4D');
        accentColor.UpdateAccentColor('#ED4D4D');
    });
    
    // Push cache results for itemDisplaySize to variables
    await CacheReturnItem('itemDisplaySize')
    .then((result) => {
        itemDisplay.UpdateItemSize(result);
    })
    .catch((error) => {
        CacheAuditItem('itemDisplaySize', 55);
        itemDisplay.UpdateItemSize(55);
    });

    // Get state of secret setting
    CacheReturnItem('isSecretOn')
    .then((result) => {
        if (result) {
            document.getElementById('settingsSecretContainer').style.display = 'block';
        };
    });

    // Slider section values
    rangeSlider.value = itemDisplay.itemDisplaySize;
    bountyImage.style.width = `${itemDisplay.itemDisplaySize}px`;

    // Set checkboxes to chosen state, from localStorage (userCache)
    document.getElementById('checkboxRefreshOnInterval').checked = await CacheReturnItem('isRefreshOnIntervalToggled');
    document.getElementById('checkboxRefreshWhenFocused').checked = await CacheReturnItem('isRefreshOnFocusToggled');


    // Push cache results for defaultContenteView to variabGles
    await CacheReturnItem('defaultContentView')
    .then((result) => {

        // Set default view if there is none saved already
        if (!result) {
            CacheAuditItem('defaultContentView', 'bountiesContainer');
            document.getElementById(`bountiesContainer`).style.display = 'block';
            document.getElementById('defaultViewDropdown').value = 'bountiesContainer';
            return;
        };
        log(result);
        
        // Filter out the content view that is not the default or the saved one
        containerNames.forEach(value => {
            log(value);
            if (value !== result) {
                document.getElementById(value).style.display = 'none';
                return;
            };

            document.getElementById(value).style.display = 'block';
            document.getElementById('defaultViewDropdown').value = value;
        });
    })
    .catch((error) => {
        console.error(error);
    });

};


// DEPRECATED
// async function AddEventListenersDeprecated() {

//     log('AddEventListeners START');
//     // Add listeners for buttons
//     for (let a = 0; a <= 2; a++) {
//         document.getElementById(`charContainer${a}`).addEventListener('click', () => {
//             LoadCharacter(a);
//         });
//     };

//     // Click on title to show secret setting
//     document.getElementById('navBarTitle').addEventListener('click', () => {
//         secretCount++;
//         if (secretCount >= 5) {
//             document.getElementById('secretIconCheckboxContainer').style.display = 'block';
//             CacheAuditItem('isSecretOn', true);
//         };
//     });

//     // Hover events for "Current Yield"
//     document.getElementById('statsTitleQuery').addEventListener('mousemove', () => {
//         document.getElementById('queryDiv').style.display = 'block';
//     });
//     document.getElementById('statsTitleQuery').addEventListener('mouseleave', () => {
//         document.getElementById('queryDiv').style.display = 'none';
//     });

//     // Hover events for "Net Breakdown"
//     // Shared wisdom bonus hover
//     const statSharedWisdom = document.getElementById('statSharedWisdom');
//     statSharedWisdom.addEventListener('mouseover', () => {
//         document.getElementById('sharedWisdomPopupContainer').style.display = 'inline-block';
//     });
//     statSharedWisdom.addEventListener('mouseleave', () => {
//         document.getElementById('sharedWisdomPopupContainer').style.display = 'none';
//     });

//     // Ghost mod bonus hover
//     const statGhostMod = document.getElementById('statGhostMod');
//     statGhostMod.addEventListener('mouseover', () => {
//         document.getElementById('ghostModPopupContainer').style.display = 'inline-block';
//     });
//     statGhostMod.addEventListener('mouseleave', () => {
//         document.getElementById('ghostModPopupContainer').style.display = 'none';
//     });

//     // Bonus XP hover
//     const statBonusXp = document.getElementById('statBonusXp');
//     statBonusXp.addEventListener('mouseover', () => {
//         document.getElementById('BonusXpPopupContainer').style.display = 'inline-block';
//     });
//     statBonusXp.addEventListener('mouseleave', () => {
//         document.getElementById('BonusXpPopupContainer').style.display = 'none';
//     });

//     // Remove filters button
//     document.getElementById('removeFiltersID').addEventListener('click', () => {

//         // Loop over charBounties and reverse filtered items
//         charBounties.forEach(bounty => {
//             if (eventFilters.grayedOutBounties) {
//                 eventFilters.grayedOutBounties.forEach(greyHash => {
//                     document.getElementById(`${bounty.hash}`).style.opacity = 'unset';
//                     document.getElementById(`item_${bounty.hash}`).style.opacity = 'unset';
//                 });
//             };
//         });
//         eventFilters.grayedOutBounties = []; // Clear array


//         // Loop over bounty filters and reverse selected filers
//         Object.keys(eventFilters.filterDivs).forEach(filter => {
//             eventFilters.filterDivs[filter].element.style.color = 'rgb(138, 138, 138)';
//         });
//     });

//     // Click event for "Bounties" side button
//     document.getElementById('cgBounties').addEventListener('click', () => {

//         CacheReturnItem('defaultContentView')
//         .then(result => {

//             // display: none the current view
//             document.getElementById(result).style.display = 'none';

//             // Show the bounties view
//             document.getElementById('bountiesContainer').style.display = 'block';

//             // Save the current view to cache
//             CacheAuditItem('defaultContentView', 'bountiesContainer');
//         });
//     });

//     // Click event for "Seasonal Challenges" side button
//     document.getElementById('cgSeasonalChalls').addEventListener('click', () => {

//         CacheReturnItem('defaultContentView')
//         .then(result => {

//             // display: none the current view
//             document.getElementById(result).style.display = 'none';

//             // Show the seasonalChallenges view
//             document.getElementById('seasonalChallengesContainer').style.display = 'block';

//             // Save the current view to cache
//             CacheAuditItem('defaultContentView', 'seasonalChallengesContainer');
//         });
//     });

//     // Toggle item filters button(s) (reverse container style)
//     document.getElementById('btnHideFilters').addEventListener('click', () => {

//         let filterContentContainer = document.getElementById('filterContentContainer');

//         // Check if boolean is true/false - change content
//         if (filterContentContainer.style.display === 'block') {
//             filterContentContainer.style.display = 'none';
//         }
//         else if (filterContentContainer.style.display === 'none') {
//             filterContentContainer.style.display = 'block';
//         };
//     });


//     // Settings toggles input listeners
//     document.getElementById('checkboxRefreshWhenFocused').addEventListener('change', function () {
        
//         if (this.checked) {
//             CacheAuditItem('isRefreshOnFocusToggled', true);
//         }
//         else {
//             CacheAuditItem('isRefreshOnFocusToggled', false);
//         };
//     });

//     function passiveReload () {
//         if (!document.hidden) {
//             main(true)
//             .catch((error) => {
//                 console.error(error);
//             });
//         };
//     };

//     // When the user changes focuses the tab again, reload
//     document.addEventListener('visibilitychange', function () {

//         if (!document.hidden) {
//             CacheReturnItem('isRefreshOnFocusToggled')
//             .then(result => {

//                 if (result === true) {
//                     document.getElementById('loadingIcon').style.display = 'none';
//                     document.getElementById('loadingText').style.marginTop = '-65px';
//                     passiveReload();
//                 };
//             });
//         };
//     });

//     // Refresh 2 minute interval event listener
//     let refreshOnInterval;
//     document.getElementById('checkboxRefreshOnInterval').addEventListener('change', function () {

//         if (this.checked) {

//             CacheAuditItem('isRefreshOnIntervalToggled', true);
//             refreshOnInterval = setInterval( function () {
//                 main(true)
//                     .catch((error) => {
//                         console.error(error);
//                     });
//             }, 120_000);

//             document.getElementById('loadingIcon').style.display = 'none';
//             document.getElementById('loadingText').style.marginTop = '-65px';
//         }
//         else if (!this.checked) {

//             CacheAuditItem('isRefreshOnIntervalToggled', false);
//             clearInterval(refreshOnInterval);
//         };

//     });

//     // (Default) Item size range slider
//     let rangeSlider = document.getElementById('itemSizeSlider'), 
//         rangeValueField = document.getElementById('itemSizeField'), 
//         bountyImage = document.getElementById('settingsBountyImage'), 
//         defaultItemSize = 55;

//     // Default value
//     rangeValueField.innerHTML = `${rangeSlider.value}px`;

//     // Input listener for range slider
//     rangeSlider.oninput = function () {

//         bountyImage.style.width = `${this.value}px`;
//         rangeValueField.innerHTML = `${this.value}px`;

//         Array.from(document.getElementsByClassName('bounty')).forEach(element => {
//             element.style.width = `${this.value}px`;
//         });

//         CacheAuditItem('itemDisplaySize', this.value);
//     };

//     // Reset item size button event listener
//     document.getElementById('resetItemSize').addEventListener('click', () => {

//         rangeSlider.value = defaultItemSize;
//         bountyImage.style.width = `${defaultItemSize}px`;
//         rangeValueField.innerHTML = `${defaultItemSize}px`;
//         CacheAuditItem('itemDisplaySize', defaultItemSize);

//         Array.from(document.getElementsByClassName('bounty')).forEach(element => {
//             element.style.width = `${defaultItemSize}px`;
//         });
//     });

//     // Form event for choosing the default content view
//     document.getElementById('defaultViewDropdown').addEventListener('change', () => {

//         const contentViewsThatINeedToChange = [
//             'bountiesContainer', 
//             'seasonalChallengesContainer'
//         ];

//         const selectedValue = document.getElementById('defaultViewDropdown').value;
        
//         // Filter my current content views to display: none if they are not selectedValue
//         contentViewsThatINeedToChange
//         .forEach(value => {

//             if (value !== selectedValue) {
//                 document.getElementById(value).style.display = 'none';
//                 return;
//             };

//             document.getElementById(value).style.display = 'block';
//         });

//         // Save the chosen item to cache and change the current view to the chosen one
//         CacheAuditItem('defaultContentView', selectedValue);
//         document.getElementById(selectedValue).style.display = 'block';
//     });

//     // Add listener for available vendor popup close button
//     document.getElementById('availableVendorPopupClose').addEventListener('click', () => {
//         document.getElementById('availableVendorPopupCanvas').style.display = 'none';
//         document.getElementById('availableVendorPopup').style.display = 'none';
//     });

//     // Add an event listener to the canvas to close the popup (for ease of use)
//     document.getElementById('availableVendorPopupCanvas').addEventListener('click', () => {
//         document.getElementById('availableVendorPopupCanvas').style.display = 'none';
//         document.getElementById('availableVendorPopup').style.display = 'none';
//     });
    

//     // Add listener for next arrow to show previous chunk of seasonal challenges
//     // Add listener for next arrow to show next chunk of seasonal challenges
//     let currentlyShowingChunkIndex = 0;

//     document.getElementById('nextSeasonalChallengePageButton').addEventListener('click', () => {

//         document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'none';
//         if (currentlyShowingChunkIndex === 12) {
//             currentlyShowingChunkIndex = 0;
//         }
//         else {
//             currentlyShowingChunkIndex++;
//         };
//         log(`currentlyShowingChunkIndex: ${currentlyShowingChunkIndex}`);
//         document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'grid';
//     });

//     document.getElementById('previousSeasonalChallengePageButton').addEventListener('click', () => {

//         document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'none';
//         if (currentlyShowingChunkIndex === 0) {
//             currentlyShowingChunkIndex = 12;
//         }
//         else {
//             currentlyShowingChunkIndex--;
//         };
//         log(`currentlyShowingChunkIndex: ${currentlyShowingChunkIndex}`);
//         document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'grid';
//     });

//     log('AddEventListeners END');
// };
