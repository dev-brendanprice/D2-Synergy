import { charBounties, excludedBountiesByVendor } from '../user.js';
import bountyHashes from '../../data/bounties.json';
import {
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType,
    VendorHashesByLabel } from './SynergyDefinitions.js';

    const log = console.log.bind(console),
        tableForPropertyDefinitions = {
        'Destination': Destination,
        'ActivityMode': ActivityMode,
        'DamageType': DamageType,
        'ItemCategory': ItemCategory,
        'AmmoType': AmmoType,
        'KillType': KillType
    };

    export let bountyPropertiesCount = {};


// Push properties to bounty in arguments
// @object {bountyEntry}, @string {propertyName}, @int {i}
export async function PushIndexesFromProperty(bountyEntry, propertyName, i) {

    // bountyPropCount - increment count for every property that passes through

    // Get array of indexes from specified property
    let propertyIndexArray = bountyEntry[propertyName];

    // Apply all indexes to current property
    if (propertyIndexArray.length === 0) {
        
        // Loop over the property definitions and apply indexes to the bounty using SynergyDefinitions.js
        let definitionsForProperty = tableForPropertyDefinitions[propertyName];

        // Loop over the property definitions and apply all indexes to the bounty using SynergyDefinitions.js
        definitionsForProperty.forEach(index => {

            // Push property to the .props obj on the bounty
            charBounties[i].props.push(index);

            // Make changes to the property counters
            // If the counter does not exist, set to one
            // log(bountyPropertiesCount[index]);
            if (!bountyPropertiesCount[index]) {
                bountyPropertiesCount[index] = 1;
            }

            // If the counter does exist, increment by one
            else { 
                bountyPropertiesCount[index] = bountyPropertiesCount[index] + 1;
            };
        });
    }

    // Apply specified indexes to property
    else {

        // Get definitions for property
        const definitionsForProperty = tableForPropertyDefinitions[propertyName];

        // Loop over the property definitions and apply indexes to the bounty using SynergyDefinitions.js
        propertyIndexArray.forEach(index => {

            let propertyDefinition;

            // This if statement checks if an index is higher than what a definition can translate
            // In which case it will default to the highest index available on the definition (please dont do this in the heuristics)
            if (index > (definitionsForProperty.length - 1)) {
                propertyDefinition = definitionsForProperty[definitionsForProperty.length - 1];
            }
            else {
                propertyDefinition = definitionsForProperty[index];
            };
            
            // Push property to the .props obj on the bounty
            charBounties[i].props.push(propertyDefinition);

            // Make changes to the property counters, If the counter does not exist, set to one
            if (!bountyPropertiesCount[propertyDefinition]) {
                bountyPropertiesCount[propertyDefinition] = 1;
            }

            // If the counter does exist, increment by one
            else {
                bountyPropertiesCount[propertyDefinition] = bountyPropertiesCount[propertyDefinition] + 1;
            };
        });
    };
};


// Push the props onto charBounties
export async function PushProps() {

    // Push indexes to the props array on the bounty
    async function PushPropsToBounty(bountyEntry, i) {
        for (const property in bountyEntry) {

            if ('Destination' in bountyEntry) {
                await PushIndexesFromProperty(bountyEntry, property, i);
            }
            else if ('ActivityMode' in bountyEntry) {
                await PushIndexesFromProperty(bountyEntry, property, i);
            }
            else if ('DamageType' in bountyEntry) {
                await PushIndexesFromProperty(bountyEntry, property, i);
            }
            else if ('ItemCategory' in bountyEntry) {
                await PushIndexesFromProperty(bountyEntry, property, i);
            }
            else if ('AmmoType' in bountyEntry) {
                await PushIndexesFromProperty(bountyEntry, property, i);
            }
            else if ('KillType' in bountyEntry) {
                await PushIndexesFromProperty(bountyEntry, property, i);
            };
        };
    };

    // Clear counters
    bountyPropertiesCount = {};

    // Loop over charBounties to append heuristics
    for (let i=0; i < charBounties.length; i++) {

        // Get the specific bounty entry via from bounties.json
        let bountyEntry = bountyHashes[charBounties[i].hash];

        // In case the bounty has not been added to the definitions
        // Check if there are any bounties to be excluded
        // Ignore the bounty if it's in the excludedBountiesByVendor object (the bounty hasnt been added)
        charBounties[i].inventory.stackUniqueLabel.split('.').forEach(async (labelSubstring) => {

            // Loop over vendor labels and check if the substring is in the label
            for (const vendorLabel in VendorHashesByLabel) {
                if (labelSubstring === vendorLabel) {

                    // Check if the vendor is in the excludedBountiesByVendor object
                    // Ignore the bounty if it exists in the array value of the key:value pair
                    if (Object.keys(excludedBountiesByVendor).includes(vendorLabel)) {
                        if (!excludedBountiesByVendor[vendorLabel].includes(charBounties[i].hash)) {

                            // Push properties onto bounty
                            await PushPropsToBounty(bountyEntry, i);
                        };
                    }
                    else {
                        // Push properties onto bounty
                        await PushPropsToBounty(bountyEntry, i);
                    };
                };
            };
        });
    };

    // Sort bounty props in descending order
    Object.keys(bountyPropertiesCount).sort((a,b) => bountyPropertiesCount[a] - bountyPropertiesCount[b]);
    log(bountyPropertiesCount);
    log(excludedBountiesByVendor);
};
