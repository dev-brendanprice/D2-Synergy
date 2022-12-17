import { 
    charBounties,
    MainEntryPoint, 
    eventFilters,
    itemDisplay } from '../user.js';
import { 
    CacheAuditItem, 
    CacheReturnItem,
    Logout } from './ModuleScript.js';
import { LoadCharacter } from './LoadCharacter.js';


// Utilities
const log = console.log.bind(console),
      localStorage = window.localStorage;
var secretCount = 0;


// Event listener wrapper
export const AddListener = function (elementName, event, callback, selectorType) {

    if (elementName === 'window') {
        window.addEventListener(event, callback);
        return;
    };

    switch (selectorType) {

        case 'class' || 'CLASS':
            document.getElementsByClassName(`${elementName}`).addEventListener(event, callback);

        default:
            document.getElementById(`${elementName}`).addEventListener(event, callback);
    };
};


export async function AddEventListeners() {

    // Logout button
    AddListener('navBarLogoutIcon', 'click', function () {
        Logout();
    });


    // Settings button
    AddListener('navBarSettingsIcon', 'click', function () {
        log('bruh');
        document.getElementById('userMainContainer').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'block';
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
            document.getElementById('secretIconCheckboxContainer').style.display = 'block';
            CacheAuditItem('isSecretOn', true);
        };
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


    // Refresh on focus text click
    AddListener('textRefreshWhenFocused', 'click', function () {

        let checkbox = document.getElementById('checkboxRefreshWhenFocused');
        checkbox.checked = !checkbox.checked;

        if (checkbox.checked) {
            CacheAuditItem('isRefreshOnFocusToggled', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheAuditItem('isRefreshOnFocusToggled', false);
    });


    // Close button click
    AddListener('settingsMenuButton', 'click', function () {
        
        CacheReturnItem('defaultContentView')
        .then((defaultContentView) => {
            log(defaultContentView);
        });
    });


    // Refresh on interval text click
    AddListener('textRefreshOnInterval', 'click', function () {

        let checkbox = document.getElementById('checkboxRefreshOnInterval');
        checkbox.checked = !checkbox.checked;
        
        if (checkbox.checked) {

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


    // Dropdown selection
    AddListener('defaultViewDropdown', 'change', function () {

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


    // Item size slider
    AddListener('itemSizeSlider', 'change', function () {
        CacheAuditItem('itemDisplaySize', parseInt(this.value));
        document.getElementById('itemSizeField').innerHTML = `${this.value}px`;
        document.getElementById('settingsBountyImage').style.width = `${this.value}px`;
    });


    // Item size reset button
    AddListener('resetItemSize', 'click', function () {
        CacheAuditItem('itemDisplaySize', 55);
        document.getElementById('itemSizeSlider').value = 55;
        document.getElementById('itemSizeField').innerHTML = '55px';
        document.getElementById('settingsBountyImage').style.width = '55px';
    });

    
    // Refresh on tab focus
    AddListener('window', 'focus', function () {
        
        let boolean = JSON.parse(localStorage.getItem('userCache')).isRefreshOnFocusToggled;
        if (boolean) {
            MainEntryPoint(true)
            .catch((error) => {
                console.error(error);
            });
        };
    });


    // Bounties tab click
    AddListener('navBarBountiesButton', 'click', function () {
        document.getElementById('statisticsContainer').style.display = 'none';
        document.getElementById('seasonalChallengesContainer').style.display = 'none';
        document.getElementById('bountiesContainer').style.display = 'block';
    });


    // Secret setting checkbox
    AddListener('checkboxToggleSecretIcons', 'change', function () {
            
        if (this.checked) {
            CacheAuditItem('isSecretOn', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheAuditItem('isSecretOn', false);
    });


    // Secret setting text click
    AddListener('textToggleSecretIcons', 'click', function () {
            
        let checkbox = document.getElementById('checkboxToggleSecretIcons');
        checkbox.checked = !checkbox.checked;

        if (checkbox.checked) {
            CacheAuditItem('isSecretOn', true);
            return;
        };

        // Uncheck = clear localStorage value
        CacheAuditItem('isSecretOn', false);
    });
};


// Configure defaults/Loads data from localStorage
export async function BuildWorkspace() {

    let rangeSlider = document.getElementById('itemSizeSlider'),
        rangeValueField = document.getElementById('itemSizeField'),
        bountyImage = document.getElementById('settingsBountyImage');
    
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
            document.getElementById('secretIconCheckboxContainer').style.display = 'block';
        };
    });

    // Slider section values
    rangeSlider.value = itemDisplay.itemDisplaySize;
    rangeValueField.innerHTML = `${itemDisplay.itemDisplaySize}px`;
    bountyImage.style.width = `${itemDisplay.itemDisplaySize}px`;

    // Set checkboxes to chosen state, from localStorage (userCache)
    document.getElementById('checkboxRefreshOnInterval').checked = await CacheReturnItem('isRefreshOnIntervalToggled');
    document.getElementById('checkboxRefreshWhenFocused').checked = await CacheReturnItem('isRefreshOnFocusToggled');


    // Push cache results for defaultContenteView to variabGles
    await CacheReturnItem('defaultContentView')
    .then((result) => {

        const contentViewsThatINeedToChange = [
            'bountiesContainer', 
            'seasonalChallengesContainer',
            'statisticsContainer'
        ];

        // Set default view if there is none saved already
        if (!result) {
            CacheAuditItem('defaultContentView', 'bountiesContainer');
            document.getElementById(`bountiesContainer`).style.display = 'block';
            document.getElementById('defaultViewDropdown').value = 'bountiesContainer';
            return;
        };
        
        // Filter out the content view that is not the default or the saved one
        contentViewsThatINeedToChange
        .forEach(value => {

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



export async function AddEventListenersDeprecated() {

    log('AddEventListeners START');
    // Add listeners for buttons
    for (let a = 0; a <= 2; a++) {
        document.getElementById(`charContainer${a}`).addEventListener('click', () => {
            LoadCharacter(a);
        });
    };

    // Click on title to show secret setting
    document.getElementById('navBarTitle').addEventListener('click', () => {
        secretCount++;
        if (secretCount >= 5) {
            document.getElementById('secretIconCheckboxContainer').style.display = 'block';
            CacheAuditItem('isSecretOn', true);
        };
    });

    // Hover events for "Current Yield"
    document.getElementById('statsTitleQuery').addEventListener('mousemove', () => {
        document.getElementById('queryDiv').style.display = 'block';
    });
    document.getElementById('statsTitleQuery').addEventListener('mouseleave', () => {
        document.getElementById('queryDiv').style.display = 'none';
    });

    // Hover events for "Net Breakdown"
    // Shared wisdom bonus hover
    const statSharedWisdom = document.getElementById('statSharedWisdom');
    statSharedWisdom.addEventListener('mouseover', () => {
        document.getElementById('sharedWisdomPopupContainer').style.display = 'inline-block';
    });
    statSharedWisdom.addEventListener('mouseleave', () => {
        document.getElementById('sharedWisdomPopupContainer').style.display = 'none';
    });

    // Ghost mod bonus hover
    const statGhostMod = document.getElementById('statGhostMod');
    statGhostMod.addEventListener('mouseover', () => {
        document.getElementById('ghostModPopupContainer').style.display = 'inline-block';
    });
    statGhostMod.addEventListener('mouseleave', () => {
        document.getElementById('ghostModPopupContainer').style.display = 'none';
    });

    // Bonus XP hover
    const statBonusXp = document.getElementById('statBonusXp');
    statBonusXp.addEventListener('mouseover', () => {
        document.getElementById('BonusXpPopupContainer').style.display = 'inline-block';
    });
    statBonusXp.addEventListener('mouseleave', () => {
        document.getElementById('BonusXpPopupContainer').style.display = 'none';
    });

    // Remove filters button
    document.getElementById('removeFiltersID').addEventListener('click', () => {

        // Loop over charBounties and reverse filtered items
        charBounties.forEach(bounty => {
            if (eventFilters.grayedOutBounties) {
                eventFilters.grayedOutBounties.forEach(greyHash => {
                    document.getElementById(`${bounty.hash}`).style.opacity = 'unset';
                    document.getElementById(`item_${bounty.hash}`).style.opacity = 'unset';
                });
            };
        });
        eventFilters.grayedOutBounties = []; // Clear array


        // Loop over bounty filters and reverse selected filers
        Object.keys(eventFilters.filterDivs).forEach(filter => {
            eventFilters.filterDivs[filter].element.style.color = 'rgb(138, 138, 138)';
        });
    });

    // Click event for "Bounties" side button
    document.getElementById('cgBounties').addEventListener('click', () => {

        CacheReturnItem('defaultContentView')
        .then(result => {

            // display: none the current view
            document.getElementById(result).style.display = 'none';

            // Show the bounties view
            document.getElementById('bountiesContainer').style.display = 'block';

            // Save the current view to cache
            CacheAuditItem('defaultContentView', 'bountiesContainer');
        });
    });

    // Click event for "Seasonal Challenges" side button
    document.getElementById('cgSeasonalChalls').addEventListener('click', () => {

        CacheReturnItem('defaultContentView')
        .then(result => {

            // display: none the current view
            document.getElementById(result).style.display = 'none';

            // Show the seasonalChallenges view
            document.getElementById('seasonalChallengesContainer').style.display = 'block';

            // Save the current view to cache
            CacheAuditItem('defaultContentView', 'seasonalChallengesContainer');
        });
    });

    // Toggle item filters button(s) (reverse container style)
    document.getElementById('btnHideFilters').addEventListener('click', () => {

        let filterContentContainer = document.getElementById('filterContentContainer');

        // Check if boolean is true/false - change content
        if (filterContentContainer.style.display === 'block') {
            filterContentContainer.style.display = 'none';
        }
        else if (filterContentContainer.style.display === 'none') {
            filterContentContainer.style.display = 'block';
        };
    });


    // Settings toggles input listeners
    document.getElementById('checkboxRefreshWhenFocused').addEventListener('change', function () {
        
        if (this.checked) {
            CacheAuditItem('isRefreshOnFocusToggled', true);
        }
        else {
            CacheAuditItem('isRefreshOnFocusToggled', false);
        };
    });

    function passiveReload () {
        if (!document.hidden) {
            main(true)
            .catch((error) => {
                console.error(error);
            });
        };
    };

    // When the user changes focuses the tab again, reload
    document.addEventListener('visibilitychange', function () {

        if (!document.hidden) {
            CacheReturnItem('isRefreshOnFocusToggled')
            .then(result => {

                if (result === true) {
                    document.getElementById('loadingIcon').style.display = 'none';
                    document.getElementById('loadingText').style.marginTop = '-65px';
                    passiveReload();
                };
            });
        };
    });

    // Refresh 2 minute interval event listener
    let refreshOnInterval;
    document.getElementById('checkboxRefreshOnInterval').addEventListener('change', function () {

        if (this.checked) {

            CacheAuditItem('isRefreshOnIntervalToggled', true);
            refreshOnInterval = setInterval( function () {
                main(true)
                    .catch((error) => {
                        console.error(error);
                    });
            }, 120_000);

            document.getElementById('loadingIcon').style.display = 'none';
            document.getElementById('loadingText').style.marginTop = '-65px';
        }
        else if (!this.checked) {

            CacheAuditItem('isRefreshOnIntervalToggled', false);
            clearInterval(refreshOnInterval);
        };

    });

    // (Default) Item size range slider
    let rangeSlider = document.getElementById('itemSizeSlider'), 
        rangeValueField = document.getElementById('itemSizeField'), 
        bountyImage = document.getElementById('settingsBountyImage'), 
        defaultItemSize = 55;

    // Default value
    rangeValueField.innerHTML = `${rangeSlider.value}px`;

    // Input listener for range slider
    rangeSlider.oninput = function () {

        bountyImage.style.width = `${this.value}px`;
        rangeValueField.innerHTML = `${this.value}px`;

        Array.from(document.getElementsByClassName('bounty')).forEach(element => {
            element.style.width = `${this.value}px`;
        });

        CacheAuditItem('itemDisplaySize', this.value);
    };

    // Reset item size button event listener
    document.getElementById('resetItemSize').addEventListener('click', () => {

        rangeSlider.value = defaultItemSize;
        bountyImage.style.width = `${defaultItemSize}px`;
        rangeValueField.innerHTML = `${defaultItemSize}px`;
        CacheAuditItem('itemDisplaySize', defaultItemSize);

        Array.from(document.getElementsByClassName('bounty')).forEach(element => {
            element.style.width = `${defaultItemSize}px`;
        });
    });

    // Form event for choosing the default content view
    document.getElementById('defaultViewDropdown').addEventListener('change', () => {

        const contentViewsThatINeedToChange = [
            'bountiesContainer', 
            'seasonalChallengesContainer'
        ];

        const selectedValue = document.getElementById('defaultViewDropdown').value;
        
        // Filter my current content views to display: none if they are not selectedValue
        contentViewsThatINeedToChange
        .forEach(value => {

            if (value !== selectedValue) {
                document.getElementById(value).style.display = 'none';
                return;
            };

            document.getElementById(value).style.display = 'block';
        });

        // Save the chosen item to cache and change the current view to the chosen one
        CacheAuditItem('defaultContentView', selectedValue);
        document.getElementById(selectedValue).style.display = 'block';
    });

    // Add listener for available vendor popup close button
    document.getElementById('availableVendorPopupClose').addEventListener('click', () => {
        document.getElementById('availableVendorPopupCanvas').style.display = 'none';
        document.getElementById('availableVendorPopup').style.display = 'none';
    });

    // Add an event listener to the canvas to close the popup (for ease of use)
    document.getElementById('availableVendorPopupCanvas').addEventListener('click', () => {
        document.getElementById('availableVendorPopupCanvas').style.display = 'none';
        document.getElementById('availableVendorPopup').style.display = 'none';
    });
    

    // Add listener for next arrow to show previous chunk of seasonal challenges
    // Add listener for next arrow to show next chunk of seasonal challenges
    let currentlyShowingChunkIndex = 0;

    document.getElementById('nextSeasonalChallengePageButton').addEventListener('click', () => {

        document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'none';
        if (currentlyShowingChunkIndex === 12) {
            currentlyShowingChunkIndex = 0;
        }
        else {
            currentlyShowingChunkIndex++;
        };
        log(`currentlyShowingChunkIndex: ${currentlyShowingChunkIndex}`);
        document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'grid';
    });

    document.getElementById('previousSeasonalChallengePageButton').addEventListener('click', () => {

        document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'none';
        if (currentlyShowingChunkIndex === 0) {
            currentlyShowingChunkIndex = 12;
        }
        else {
            currentlyShowingChunkIndex--;
        };
        log(`currentlyShowingChunkIndex: ${currentlyShowingChunkIndex}`);
        document.getElementById(`challengeChunk${currentlyShowingChunkIndex}`).style.display = 'grid';
    });

    log('AddEventListeners END');
};
