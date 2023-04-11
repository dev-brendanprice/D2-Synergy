import { log } from '../user.js';
import { progressionItemGroupTypes } from './SynergyDefinitions.js';

// Function to find all the relations between progressional items
// @obj {progressionalItems}
export async function ParseProgressionalRelations(progressionalItems) {

    let bountyRelations = {},
        challengeRelations = {},
        allRelations = {};
    
    // Used to find percentage
    let relationCount = 0;

    // // Increment the relation every time there is another bounty that has the same prop
    // for (let firstBounty of progressionalItems.charBounties) {
    //     for (let secondBounty of progressionalItems.charBounties) {
    //         if (firstBounty.hash !== secondBounty.hash) {

    //             let groupFirstBounty;
    //             let groupSecondBounty;

    //             // Find group for both bounties
    //             progressionItemGroupTypes.forEach(group => {

    //                 if (firstBounty.props.includes(group)) {
    //                     groupFirstBounty = group;
    //                 };

    //                 if (secondBounty.props.includes(group)) {
    //                     groupSecondBounty = group;
    //                 };

    //             });

    //             if (groupFirstBounty !== undefined && groupSecondBounty !== undefined && groupFirstBounty === groupSecondBounty) {
    //                 log(groupFirstBounty, groupSecondBounty);
    //             };

    //             // ..
    //             if (groupFirstBounty === groupSecondBounty) {

    //                 firstBounty.props.forEach(v => {
    //                     if (!bountyRelations[v]) {
    //                         bountyRelations[v] = 1;
    //                     }
    //                     else {
    //                         bountyRelations[v]++;
    //                     };
    //                 });

    //                 secondBounty.props.forEach(z => {
    //                     if (!bountyRelations[z]) {
    //                         bountyRelations[z] = 1;
    //                     }
    //                     else {
    //                         bountyRelations[z]++;
    //                     };
    //                 });

    //                 relationCount++;
    //             };

    //         };
    //     };
    // };

    // Loop through character bounties
    for (let bounty of progressionalItems.charBounties) {

        // Check if bounty is incomplete before adding relation
        if (!bounty.isComplete) {

            // Loop through props and add to bountyRelations
            bounty.props.forEach((prop) => {

                // Check if prop exists in bountyRelations, if so add 1
                if (bountyRelations[prop]) {
                    bountyRelations[prop]++;
                }
                else { // if not create it
                    bountyRelations[prop] = 1;
                };
                relationCount++;
            });
        };
    };

    // Loop through challenges
    for (let index in progressionalItems.challenges) {
        
        let challenge = progressionalItems.challenges[index];

        // Check if challenge is incomplete before adding relation
        if (!challenge.isComplete) {

            // Loop through challenge props
            challenge.props.forEach((prop) => {

                // Check if props exists in challengeRelations, if so add 1
                if (challengeRelations[prop]) {
                    challengeRelations[prop]++;
                }
                else { // if not create it
                    challengeRelations[prop] = 1;
                };
                relationCount++;
            });
        };
    };

    // Remove values that are 1 or less
    bountyRelations = Object.fromEntries(Object.entries(bountyRelations).filter(([key, value]) => value > 1));
    challengeRelations = Object.fromEntries(Object.entries(challengeRelations).filter(([key, value]) => value > 1));

    // Add relation count to table subheading
    document.getElementById('relationsTotalField').innerHTML = relationCount;

    // Loop through bounty relations
    for (let key in bountyRelations) {
        
        // Find value from pair
        let value = bountyRelations[key];

        // Store pair -- check if exists to create new key:value
        if(allRelations[key]) {
            allRelations[key] += value;
        }
        else {
            allRelations[key] = value;
        };
    };

    // Loop through challenge relations
    for (let key in challengeRelations) {
        
        // Find value from pair
        let value = challengeRelations[key];

        // Store pair -- check if exists to create new key:value
        if(allRelations[key]) {
            allRelations[key] += value;
        }
        else {
            allRelations[key] = value;
        };
    };

    // Sort allRelations by relation count, in descending order
    // Turn each object intro key:value with arrays
    allRelations = Object.entries(allRelations).sort((a, b) => b[1] - a[1]);
    bountyRelations = Object.entries(bountyRelations).sort((a, b) => b[1] - a[1]);
    challengeRelations = Object.entries(challengeRelations).sort((a, b) => b[1] - a[1]);

    // Find average relation count
    let averageRelationCount = relationCount / allRelations.length;
    if (!relationCount || !isFinite(averageRelationCount)) {
        averageRelationCount = 0;
    };

    // Return each relations object
    return {
        bounties: bountyRelations, 
        challenges: challengeRelations, 
        all: allRelations, 
        averageRelationCount: averageRelationCount
    };
};