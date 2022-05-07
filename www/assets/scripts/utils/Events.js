import { LoadCharacter, userStruct } from '../user.js';
import { CacheReturnItem, Logout } from './ModuleScript.js';

const AddEventListeners = async () => {

    // Add listeners for buttons
    for (let a=0; a<=2; a++) {
        document.getElementById(`charContainer${a}`).addEventListener('click', () => {
            LoadCharacter(a);
        });
    };

    // Logout button listener
    document.getElementById('navBarLogoutContainer').addEventListener('click', () => {
        Logout();
    });

    // Hover events for "Current Yield" query
    document.getElementById('statsTitleQuery').addEventListener('mousemove', () => {
        document.getElementById('queryDiv').style.display = 'block';
    });
    document.getElementById('statsTitleQuery').addEventListener('mouseleave', () => {
        document.getElementById('queryDiv').style.display = 'none';
    });

    // Remove filters button
    document.getElementById('removeFiltersID').addEventListener('click', () => {

        // Loop over charBounties and reverse filtered items
        userStruct.charBounties.forEach(bounty => {
            if (userStruct.greyOutDivs) {
                userStruct.greyOutDivs.forEach(greyHash => {
                    document.getElementById(`${bounty.hash}`).style.opacity = 'unset';
                    document.getElementById(`item_${bounty.hash}`).style.opacity = 'unset';
                });
            };
        });
        userStruct.greyOutDivs = []; // Clear array

        // Loop over bounty filters and reverse selected filers
        Object.keys(userStruct.filterDivs).forEach(filter => {
            userStruct.filterDivs[filter].element.style.color = 'rgb(138, 138, 138)';
        });
    });

    // Events for character menu buttons
    document.getElementById('cgDefaultLoadouts').addEventListener('click', () => {
        userStruct.objs.currView.style.display = 'none';
        document.getElementById('loadoutsContainer').style.display = 'block';
        userStruct.objs.currView = document.getElementById('loadoutsContainer');
    });
    document.getElementById('cgPursuits').addEventListener('click', () => {
        userStruct.objs.currView.style.display = 'none';
        document.getElementById('pursuitsContainer').style.display = 'block';
        userStruct.objs.currView = document.getElementById('pursuitsContainer');
    });
    document.getElementById('cgLevelsProgression').addEventListener('click', () => {
        userStruct.objs.currView.style.display = 'none';
        document.getElementById('progressionContainer').style.display = 'block';
        userStruct.objs.currView = document.getElementById('progressionContainer');
    });

    document.getElementById('btnSynergyView').addEventListener('click', () => {
        userStruct.objs.currView.style.display = 'none';
        document.getElementById('synergyContainer').style.display = 'block';
        userStruct.objs.currView = document.getElementById('synergyContainer');
    });

    // Toggle item filters button(s)
    document.getElementById('btnHideFilters').addEventListener('click', () => {

        var filterContent = document.getElementById('filterContentContainer').style;
        if (!userStruct.bools.filterToggled) {
            userStruct.bools.filterToggled = true;
            filterContent.display = 'block';
        }
        else if (userStruct.bools.filterToggled) {
            userStruct.bools.filterToggled = false;
            filterContent.display  = 'none';
        };
    });

    // Configure refresh intervals
    setInterval(() => {
        if ((new Date() - userStruct.ints.refreshTime)/1000 > CacheReturnItem('refreshInterval')) {
            LoadCharacter(CacheReturnItem('lastChar'), true);
            userStruct.ints.refreshTime = new Date();
        };
    }, CacheReturnItem('refreshInterval'));
    document.addEventListener('visibilitychange', event => {
        if (document.visibilityState === 'visible') {
            if ((new Date() - userStruct.ints.refreshTime)/1000 > CacheReturnItem('refreshInterval')) {
                LoadCharacter(CacheReturnItem('lastChar'), true);
                userStruct.ints.refreshTime = new Date();
            };
        };
    });
    
};

export { AddEventListeners };