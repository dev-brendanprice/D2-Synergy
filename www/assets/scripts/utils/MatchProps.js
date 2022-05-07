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

    var bountyPropCount = {};


// Push the props onto charBounties
const PushProps = async () => {

    // Clear counters
    bountyPropCount = {};

    // Loop over charBounties and append counters
    for (let i=0; i < userStruct.charBounties.length; i++) {

        let hash = userStruct.charBounties[i].hash,
            entry = bountyHashes[hash];
        var counters = {};

        for (let prop in entry) {

            if (entry[prop].length !== 0) {

                var propNames = [];
                for (let foo of entry[prop]) {

                    var arr = {};
                    if (prop === 'Destination') {
                        arr=Destination;
                    }
                    else if (prop === 'ActivityMode') {
                        arr=ActivityMode;
                    }
                    else if (prop === 'DamageType') {
                        arr=DamageType;
                    }
                    else if (prop === 'ItemCategory') {
                        arr=ItemCategory;
                    }
                    else if (prop === 'AmmoType') {
                        arr=AmmoType;
                    }
                    else if (prop === 'KillType') {
                        arr=KillType;
                    };
                    propNames.push(arr[foo]);
                };
                log(propNames);

                // Wtf does this even do?
                for (let bar of propNames) {

                    if (bountyPropCount[bar] === undefined) {
                        bountyPropCount[bar] = 0;
                        bountyPropCount[bar] += 1;
                    }
                    else if (bountyPropCount[bar] !== undefined) {
                        bountyPropCount[bar] += 1;
                    };

                    if (counters[bar] === undefined) {
                        counters[bar] = 0;
                        counters[bar] += 1;
                    }
                    else if (counters[bar] !== undefined) {
                        counters[bar] += 1;
                    };

                    userStruct.charBounties[i].props.push(bar);
                };
            };
        };
    };
};


export { bountyPropCount, PushProps };