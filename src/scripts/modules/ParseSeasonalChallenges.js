import { stringMatchProgressionItem } from './StringMatchProgressionItem.js';
import { ReplaceStringVariables } from './ReplaceStringVariables.js';

// Return recordDefinition of current the seasons' challenges
// weekNumber: 1-xx where 0 is the "Complete all seasonal challenges" record
// Modular function, if weekNumber is passed, then it will only return challenges in that week, otherwise it will return all challenges
// @int {seasonHash}, @object {recordDefinitions}, @object {DestinyPresentationNodeDefinition}, @int {weekNumber}
export async function ParseSeasonalChallenges(seasonHash, seasonDefinitions, recordDefinitions, presentationNodeDefinitions, weekNumber) {

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
    let seasonalChallengesNodeHash = presentationNodeDefinitions[seasonDefinitions[seasonHash].seasonalChallengesPresentationNodeHash].children.presentationNodes[0].presentationNodeHash,
        seasonalChallenges = {};

    // Check if weekNumber is passed
    if (weekNumber) {

        // Get the presentation node hash for the specified weekly challenges node
        // Then get all the child record hashes for the challenges in that node
        let specifiedSeasonWeekNodeHash = presentationNodeDefinitions[seasonalChallengesNodeHash].children.presentationNodes[weekNumber].presentationNodeHash;
        let specifiedSeasonalChallengesInThatWeek = presentationNodeDefinitions[specifiedSeasonWeekNodeHash].children.records;
        
        // Loop through each challenge in that week and add it to the seasonalChallenges object
        for (let record in specifiedSeasonalChallengesInThatWeek) {
            let recordHash = specifiedSeasonalChallengesInThatWeek[record].recordHash;
            let recordDescription = recordDefinitions[recordHash].displayProperties.description;

            // Check if progressionDescriptor has string variables to replace
            if (recordDescription.includes('{')) {
                recordDefinitions[recordHash].displayProperties.description = ReplaceStringVariables(recordDescription);
            };
            seasonalChallenges[recordHash] = recordDefinitions[recordHash];
        };

        // Add props to each challenge
        addPropsToChallengeItem(seasonalChallenges);
        
        return seasonalChallenges;
    };

    // Get all the child presentation node hashes for the weekly challenges
    let seasonPresentationNodes = presentationNodeDefinitions[seasonalChallengesNodeHash].children.presentationNodes;
    
    // Loop through each weekly challenge node
    for (let node in seasonPresentationNodes) {
        
        // Get the presentation node hash for each weekly challenges node
        let presentationNodeHash = seasonPresentationNodes[node].presentationNodeHash;
        let weekPresentationNodeDefinition = presentationNodeDefinitions[presentationNodeHash].children.records;

        // Loop through each challenge in that week and add it to the seasonalChallenges object
        for (let v in weekPresentationNodeDefinition) {
            let recordHash = weekPresentationNodeDefinition[v].recordHash;
            let recordDefinition = recordDefinitions[recordHash];
            let recordDescription = recordDefinitions[recordHash].displayProperties.description;

            // Check if progressionDescriptor has string variables to replace
            if (recordDescription.includes('{')) {
                recordDefinitions[recordHash].displayProperties.description = ReplaceStringVariables(recordDescription);
            };
            seasonalChallenges[recordHash] = recordDefinition;
        };
    };

    // Add props to each challenge
    addPropsToChallengeItem(seasonalChallenges);

    return seasonalChallenges;
};