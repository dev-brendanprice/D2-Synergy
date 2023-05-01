import { seasonPassLevelStructure, itemDefinitions } from "../user";

// @rewardsTrack {object}
export function GetSeasonPassRewardsStructure(rewardsTrack) {

    let sharedWisdomRanks = [];

    // Loop over ranks
    for (let index in rewardsTrack) {

        let rank = rewardsTrack[index];

        // Loop over rank rewards
        for (let itemHash of rank) {
            
            let itemName = itemDefinitions[itemHash].displayProperties.name;
            
            // Check for shared wisdom ranks
            if (itemName === 'Small Fireteam XP Boost') {
                sharedWisdomRanks.push(index);
            };
        };
    };

    seasonPassLevelStructure.AssignLevelStructure('sharedWisdomLevels', sharedWisdomRanks);
};