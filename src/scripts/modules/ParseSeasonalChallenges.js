import { stringMatchProgressionItem } from './StringMatchProgressionItem.js';
import { ReplaceStringVariables } from './ReplaceStringVariables.js';
import {
    seasonDefinitions,
    recordDefinitions,
    presentationNodeDefinitions,
    progressionDefinitions,
    UserProfile 
} from '../user.js';

/*
    Return recordDefinition of current the seasons' challenges
    weekNumber: 1-xx where 0 is the "Complete all seasonal challenges" record
    Modular function, if weekNumber is passed, then it will only return challenges in that week, otherwise it will return all challenges
*/
// @int {seasonHash}, @object {seasonDefinitions}, @object {recordDefinitions}, @object {presentationNodeDefinitions}, @object {DestinyPresentationNodeDefinition}
export async function ParseSeasonalChallenges(seasonHash, seasonProgressionInfo) {

    // Self function to add props onto a challenge
    function addPropsToChallengeItem(seasonalChallenges) {
        for (let challenge in seasonalChallenges) {
            if (!seasonalChallenges[challenge].props) {
                seasonalChallenges[challenge].props = [];
            };
            seasonalChallenges[challenge].props = stringMatchProgressionItem(seasonalChallenges[challenge]);
        };
    };

    // Get the presentation node hash for the weekly challenges node
    let seasonalChallengesNodeHash = presentationNodeDefinitions[seasonDefinitions[seasonHash].seasonalChallengesPresentationNodeHash].children.presentationNodes[0].presentationNodeHash;
    let seasonalChallenges = {};

    // Get all the child presentation node hashes for the weekly challenges (upto current week)
    let seasonPresentationNodes = presentationNodeDefinitions[seasonalChallengesNodeHash].children.presentationNodes;
    let availableSeasonalChallenges = [];
    
    // Store the amount of available seasonal challenges in UserProfile (global)
    UserProfile.AssignMisc('challengesCount', availableSeasonalChallenges.length);

    let startDate = new Date(seasonProgressionInfo.startDate).getTime();
    let todayDate = new Date().getTime();
    let weeksPassed = Math.trunc(todayDate - startDate) / (24*3600*1000*7);

    // Find the current (within the current week) seasonal challenges
    for (let i=0; i<weeksPassed; i++) {

        // Get current week based on index
        let week = presentationNodeDefinitions[seasonPresentationNodes[i].presentationNodeHash];

        // Push each challenge hash into availableSeasonalChallenges
        for (let record of week.children.records) {
            availableSeasonalChallenges.push(record.recordHash);
        };
    };
    
    // Loop through each weekly challenge node
    for (let node in seasonPresentationNodes) {
        
        // Get the presentation node hash for each weekly challenges node
        let presentationNodeHash = seasonPresentationNodes[node].presentationNodeHash;
        let weekPresentationNodeDefinition = presentationNodeDefinitions[presentationNodeHash].children.records;

        // Loop through each challenge in that week and add it to the seasonalChallenges object
        for (let v in weekPresentationNodeDefinition) {

            // Get record definition
            let recordHash = weekPresentationNodeDefinition[v].recordHash;
            let recordDefinition = recordDefinitions[recordHash];
            let recordDescription = recordDefinitions[recordHash].displayProperties.description;

            if (availableSeasonalChallenges.includes(recordHash)) {

                // Check if progressionDescriptor has string variables to replace
                if (recordDescription.includes('{')) {
                    recordDefinitions[recordHash].displayProperties.description = ReplaceStringVariables(recordDescription);
                };

                seasonalChallenges[recordHash] = recordDefinition;
            };
        };
    };

    // Add props to each challenge
    addPropsToChallengeItem(seasonalChallenges);

    return seasonalChallenges;
};