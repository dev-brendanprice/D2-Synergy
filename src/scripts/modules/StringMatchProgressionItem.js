import { ActivityMode } from './SynergyDefinitions.js';
import { allProgressionProperties } from '../user.js';
import { ParsePropertyNameIntoWord } from './ParsePropertyNameIntoWord.js';

// String match progressions via displayProperties (pending for refactor and optimization)
// @obj {progressionItem}
export function stringMatchProgressionItem(progressionItem) {

    // Wildcard searches for properties that have other naming conventions/aliases
    const propertyAliases = {
        'Submachine Gun': 'SMG',
        'Season Of The Seraph': `${ParsePropertyNameIntoWord(ActivityMode[29])}`
    };

    // ProgressionItems' displayProperties
    let progressionDescriptor = progressionItem.displayProperties.description,
        matchedProperties = [];
    
    // Loop over allProgressionProperties to match against the item description
    for (let property of allProgressionProperties) {
        
        // Find booleans
        let isPropertyAlias = progressionDescriptor.includes(propertyAliases[property]);
        let isPropertyMatch = progressionDescriptor.toLowerCase().includes(property.toLowerCase());

        // Includes property, is alias of property
        if (isPropertyAlias || isPropertyMatch) {

            // If property is alias, change to *my* standard name
            if (propertyAliases[property]) {
                property = propertyAliases[property];
            };

            // If property exists in matchedProperties
            if (!matchedProperties.some(matchedProperty => matchedProperty.includes(property))) {
                matchedProperties.push(property);
            };
        };
    };

    return matchedProperties;
};