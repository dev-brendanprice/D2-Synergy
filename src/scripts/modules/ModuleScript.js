
/*

    None of these functions are used so they are marked as deprecated, for now.

*/

import { itemTypeKeys } from "./SynergyDefinitions.js";
import { allProgressionProperties, UserProfile } from "../user.js";
import { LoadCharacter } from './LoadCharacter.js';

// Capitalize First letter of string
// @string {string}
export function CapitilizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Get current userCache and remove specified key:value pair
// @string {key}
export async function CacheRemoveItem(key) {

    let userCache = JSON.parse(window.localStorage.getItem('userCache'));
    delete userCache[key];
    window.localStorage.setItem('userCache', JSON.stringify(userCache));
};

// Find percentages between properties of progression items
export function CountProgressionItemProperties(charBounties, seasonalChallenges, options) {

    // -- options allows user options to be passed in
    // like: excluding certain properties from the search, or only searching for bounty properties


    // Track how many times each property appears in progression items
    let progressionPropertiesCount = {};

    // Loop over character bounties
    charBounties.forEach(bounty => {
        
        // Loop over bounty properties
        bounty.props.forEach(prop => {
            if (allProgressionProperties.includes(prop)) {
                progressionPropertiesCount[prop] = progressionPropertiesCount[prop] ? progressionPropertiesCount[prop] + 1 : 1;
            };
        });
    });

    // Loop over seasonal challenges
    seasonalChallenges.forEach(challenge => {
            
        // Loop over challenge properties
        challenge.props.forEach(prop => {
            if (allProgressionProperties.includes(prop)) {
                progressionPropertiesCount[prop] = progressionPropertiesCount[prop] ? progressionPropertiesCount[prop] + 1 : 1;
            };
        });
    });


    // Convert progressionPropertiesCount values into percentages
    let progressionPropertiesPercentages = {};

    for (const prop in progressionPropertiesCount) {
        progressionPropertiesPercentages[prop] = Math.round((progressionPropertiesCount[prop] / (charBounties.length + seasonalChallenges.length)) * 100);
    };

    // Sort progressionPropertiesPercentages by percentage in descending order
    progressionPropertiesPercentages.sort((a,b) => b[1] - a[1]);
    console.log(progressionPropertiesPercentages);
};
