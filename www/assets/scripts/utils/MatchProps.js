import { userStruct } from '../user.js';
import { bountyHashes } from './data/bounties.js';
import {
    ActivityModeHash,
    DestinationHash,
    DamageTypeHash,
    AmmoType,
    ItemCategory,
    KillType } from './SynergyDefinitions.js';

    const log = console.log.bind(console);

    var propCounts = {},
        bin = []; // Bounties that do not possess any indexes in the heuristics




// Tailing function for CountProps, check params and increment propCount[n]
const IncrementProp = (list, hashes, bool, ref) => {
    
    if (list.length !== 0) {

        // true == hashes is array
        if (bool) {
            for (var item of list) {

                // Increment prop counter
                let n = hashes[item]; // hashes[item] - name e.g. 'Rocket Launcher'
                !propCounts[n] ? propCounts[n]=1 : propCounts[n]=propCounts[n]+1;

                // Append props to respective bounty
                ref.charB[0]['props'] = [];
                ref.charB[0]['props'].push(n);
            };
        }

        // false == hashes is object
        else if (!bool) {
            for (var item of list) {

                // Increment prop counter
                let n = Object.keys(hashes)[item]; // Object.keys(hashes)[item] - name e.g. 'Moon'
                !propCounts[n] ? propCounts[n]=1 : propCounts[n]=propCounts[n]+1;

                // Append props to respective bounty
                ref.charB[0]['props'] = [];
                ref.charB[0]['props'].push(n);
            };
        };
    };
};


// Loop over bunties and append props + increment pop counters
const CountProps = async () => {

    propCounts = {};
    for (var b in userStruct.charBounties) {

        var bounty = userStruct.charBounties[b],
            propNames = bountyHashes[bounty.hash];

        for (var prop in propNames) {

            switch (prop) {
                case 'Destination':
                    IncrementProp(propNames[prop], DestinationHash, false, 
                        {bounty: bounty, charB: userStruct.charBounties}
                    );
                    break;
                case 'ActivityMode':
                    IncrementProp(propNames[prop], ActivityModeHash, false,
                        {bounty: bounty, charB: userStruct.charBounties}
                    );
                    break;
                case 'DamageType':
                    IncrementProp(propNames[prop], DamageTypeHash, false, 
                        {bounty: bounty, charB: userStruct.charBounties}
                    );
                    break;
                case 'ItemCategory':
                    IncrementProp(propNames[prop], ItemCategory, true, 
                        {bounty: bounty, charB: userStruct.charBounties}
                    );
                    break;
                case 'AmmoType':
                    IncrementProp(propNames[prop], AmmoType, true, 
                        {bounty: bounty, charB: userStruct.charBounties}
                    );
                    break;
                case 'KillType':
                    IncrementProp(propNames[prop], KillType, true, 
                        {bounty: bounty, charB: userStruct.charBounties}
                    );
                    break;
            };
        };
    };
    userStruct['propCounts'] = propCounts;
};


export { CountProps, propCounts, bin };