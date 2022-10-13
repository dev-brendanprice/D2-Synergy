import { 
    LoadCharacter,
    charBounties,
    contentView,
    main, 
    eventFilters } from '../user.js';
import { 
    CacheAuditItem, 
    CacheReturnItem, 
    Logout } from './ModuleScript.js';

const log = console.log.bind(console);

export async function AddEventListeners() {
    log('AddEventListeners START');
    // Add listeners for buttons
    for (let a = 0; a <= 2; a++) {
        document.getElementById(`charContainer${a}`).addEventListener('click', () => {
            LoadCharacter(a);
        });
    };

    // Logout button listener
    document.getElementById('navBarLogoutContainer').addEventListener('click', () => {
        Logout();
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

    // Click event for "View Synergy" button
    document.getElementById('btnSynergyView').addEventListener('click', () => {

        document.getElementById('pursuitsContainer').style.display = 'none';
        document.getElementById('synergyContainer').style.display = 'block';
        contentView.UpdateView(document.getElementById('synergyContainer'));
    });

    // Click event for "Bounties" side button
    document.getElementById('cgPursuits').addEventListener('click', () => {

        document.getElementById('synergyContainer').style.display = 'none';
        document.getElementById('pursuitsContainer').style.display = 'block';
        contentView.UpdateView(document.getElementById('pursuitsContainer'));
    });

    // Click event for "Synergy" side button
    document.getElementById('cgSynergy').addEventListener('click', () => {

        document.getElementById('pursuitsContainer').style.display = 'none';
        document.getElementById('synergyContainer').style.display = 'block';
        contentView.UpdateView(document.getElementById('synergyContainer'));
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
        CacheAuditItem('itemDisplaySize', this.value);

        Array.from(document.getElementsByClassName('bounty')).forEach(element => {
            element.style.width = `${this.value}px`;
        });
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
        
        let selectedValue = document.getElementById('defaultViewDropdown').value;
        CacheAuditItem('defaultContentView', selectedValue);
    });

    log('AddEventListeners END');
};
