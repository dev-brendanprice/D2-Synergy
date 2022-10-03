import { charBounties, userStruct } from '../user.js';
import { bountyHashes } from '../../data/bounties.js';
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

    export let bountyPropCount = {};


// Push properties to bounty in arguments
// @object {bountyEntry}, @string {propertyName}, @int {i}
export async function PushIndexesFromProperty(bountyEntry, propertyName, i) {

    let propertyIndexArray = bountyEntry[propertyName];

    if (Object.keys(propertyIndexArray).length !== 0) {

        // Add only specified indexes, inside the property
        let propertyDefinition = tableForPropertyDefinitions[propertyName];

        propertyIndexArray.forEach(index => {

            let typeOfProperty = propertyDefinition[index];
            
            // Push to charBounties global object
            charBounties[i].props.push(typeOfProperty);

            // Push to property counters
            if (!bountyPropCount[typeOfProperty]) {
                bountyPropCount[typeOfProperty] = 1;
            }
            else if (bountyPropCount[typeOfProperty]) {
                bountyPropCount[typeOfProperty] += 1;
            };
        });
    }
    else if (Object.keys(propertyIndexArray).length === 0) {

        // Add all indexes, inside the property, to the bounty
        let propertyDefinition = tableForPropertyDefinitions[propertyName];

        propertyDefinition.forEach(typeOfProperty => {
            
            // Push to charBounties global object
            charBounties[i].props.push(typeOfProperty);

            // Push to property counters
            if (!bountyPropCount[typeOfProperty]) {
                bountyPropCount[typeOfProperty] = 1;
            }
            else if (bountyPropCount[typeOfProperty]) {
                bountyPropCount[typeOfProperty] += 1;
            };
        });
    };
};


// Push the props onto charBounties
export async function PushProps() {

    // Clear counters
    bountyPropCount = {};

    // Loop over charBounties and append heuristics
    for (let i=0; i < charBounties.length; i++) {

        let bountyEntry = bountyHashes[charBounties[i].hash];

        for (let property in bountyEntry) {

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
