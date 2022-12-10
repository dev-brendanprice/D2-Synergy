import { 
    charBounties,
    MainEntryPoint, 
    eventFilters } from '../user.js';
import { 
    CacheAuditItem, 
    CacheReturnItem } from './ModuleScript.js';
import { LoadCharacter } from './LoadCharacter.js';


// Utilities
const log = console.log.bind(console);

// Shhh
var secretCount = 0;

export async function AddEventListeners() {
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

    // Settings and back button
    const userMainContainer = document.getElementById('userMainContainer'),
        settingsContainer = document.getElementById('settingsContainer');

    // User clicks settings button on main page
    document.getElementById('navBarSettingsContainer').addEventListener('click', () => {

        userMainContainer.style.display = 'none';
        settingsContainer.style.display = 'block';
    });

    // User clicks the back button in settings menu
    document.getElementById('backButtonContainer').addEventListener('click', () => {

        userMainContainer.style.display = 'block';
        settingsContainer.style.display = 'none';
    });

    // -- Mobile navbar buttons --
    // User clicks settings button on main page
    document.getElementById('settingsButtonMobile').addEventListener('click', () => {

        userMainContainer.style.display = 'none';
        settingsContainer.style.display = 'block';
    });

    // User clicks the back button in settings menu
    document.getElementById('backButtonContainer').addEventListener('click', () => {

        userMainContainer.style.display = 'block';
        settingsContainer.style.display = 'none';
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
