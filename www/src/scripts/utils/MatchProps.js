import { userStruct } from '../user.js';
import { bountyHashes } from './data/bounties.js';
import {
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType } from './SynergyDefinitions.js';

    const log = console.log.bind(console);

    var bountyPropCount = {},
        propTypes = {
            'Destination': Destination,
            'ActivityMode': ActivityMode,
            'DamageType': DamageType,
            'ItemCategory': ItemCategory,
            'AmmoType': AmmoType,
            'KillType': KillType
        }; // This array supersedes the need to use an if statement to check for props


// Push the props onto charBounties
const PushProps = async () => {

    // Clear counters
    bountyPropCount = {};

    // Loop over charBounties and append counters
    for (let i=0; i < userStruct.charBounties.length; i++) {

        let entry = bountyHashes[userStruct.charBounties[i].hash];
        var counters = {};

        for (let prop in entry) {

            if (entry[prop].length !== 0) { // I am changing this so it checks absence

                var propNames = [];
                for (let foo of entry[prop]) {

                    // Push the property to the filter array with the count
                    propNames.push(propTypes[prop][foo]);
                };
                // log(propNames);

                // Loop through all types in propNames
                for (let type of propNames) {

                    // Push each type to the array that is used to visually filter
                    if (bountyPropCount[type] === undefined) {
                        bountyPropCount[type] = 0;
                        bountyPropCount[type] += 1;
                    }
                    else if (bountyPropCount[type] !== undefined) {
                        bountyPropCount[type] += 1;
                    };

                    // I think this is done elsewhere anyways
                    // if (counters[type] === undefined) {
                    //     counters[type] = 0;
                    //     counters[type] += 1;
                    // }
                    // else if (counters[type] !== undefined) {
                    //     counters[type] += 1;
                    // };

                    // Add each type to the userStruct to enable global access
                    userStruct.charBounties[i].props.push(type);
                };
            };
        };
        // log(counters);
    };
};


export { bountyPropCount, PushProps };