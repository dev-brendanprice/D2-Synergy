import { charBounties } from '../user.js';
import bountyHashes from '../../data/bounties.json';
import {
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType } from './SynergyDefinitions.js';

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

    log(propertyIndexArray);
    // Apply all indexes to current property
    if (propertyIndexArray.length === 0) {
        
        // Loop over the property definitions and apply indexes to the bounty using SynergyDefinitions.js
        let definitionsForProperty = tableForPropertyDefinitions[propertyName];

        // Loop over the property definitions and apply all indexes to the bounty using SynergyDefinitions.js
        definitionsForProperty.forEach(index => {

            // Push property to the .props obj on the bounty
            charBounties[i].props.push(index);
            log(charBounties[i]);

            // Make changes to the property counters
             // If the counter does not exist, set to one
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
        let definitionsForProperty = tableForPropertyDefinitions[propertyName];

        // Loop over the property definitions and apply indexes to the bounty using SynergyDefinitions.js
        propertyIndexArray.forEach(index => {
            
            // Push property to the .props obj on the bounty
            charBounties[i].props.push(definitionsForProperty[index]);
            log(charBounties[i]);

            // Make changes to the property counters
            // If the counter does not exist, set to one
            if (!bountyPropertiesCount[definitionsForProperty[index]]) {
                bountyPropertiesCount[definitionsForProperty[index]] = 1;
            }

            // If the counter does exist, increment by one
            else {
                bountyPropertiesCount[definitionsForProperty[index]] = bountyPropertiesCount[definitionsForProperty[index]] + 1;
            };
        });
    };
};


// Push the props onto charBounties
export async function PushProps() {

    // Clear counters
    bountyPropertiesCount = {};

    // Loop over charBounties to append heuristics
    for (let i=0; i < charBounties.length; i++) {

        // Get the specific bounty entry via from bounties.json
        let bountyEntry = bountyHashes[charBounties[i].hash];
        log(bountyEntry, charBounties.length);
        log(bountyHashes[charBounties[i].hash]);

        // Check if bounty has been implemented yet in bounties.json
        // e.g. Checking if the properties are empty (means the bounty hasnt been implemented but exists as an empty entry in bounties.json)
        // Loop over each property. if all the properties are empty, it is likely that the bounty has not been implemented yet
        if (!(Object.values(bountyEntry).every(item => item.length !== 0))) {

            // Check if property exists in the entry
            // If it doesn't exist then this means the property should be ignored; it doesnt apply to the bounty
            for (let property in bountyEntry) {

                log(property);
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
    };
};
