import { stringMatchProgressionItem } from './StringMatchProgressionItem.js';
import { ReplaceStringVariables } from './ReplaceStringVariables.js';
import {
    seasonDefinitions,
    recordDefinitions,
    presentationNodeDefinitions,
    progressionDefinitions,
    UserProfile } from '../user.js';

/*
    Return recordDefinition of current the seasons' challenges
    weekNumber: 1-xx where 0 is the "Complete all seasonal challenges" record
    Modular function, if weekNumber is passed, then it will only return challenges in that week, otherwise it will return all challenges
*/
// @int {seasonHash}, @object {seasonDefinitions}, @object {recordDefinitions}, @object {presentationNodeDefinitions}, @object {DestinyPresentationNodeDefinition}
export async function ParseSeasonalChallenges(seasonHash, seasonProgressionInfo) {

    // Self function to add props onto a challenge
    function addPropsToChallengeItem(challenge) {
        if (!challenge.props) {
            challenge.props = [];
        };
        challenge.props = stringMatchProgressionItem(challenge);
    };

    /*
        - Get seasonal challenge weekly structure
            -> season definition > seasonalChallengesPresentationNodeHash > children.presentationNodes[0] >
            children.presentationNodes

        - Boolean check on each week number if that number of weeks has passed since the season startDate

        - Push all this into a formatted array for easy use
    */

    let challenges = {};
    let seasonDefinition = seasonDefinitions[seasonHash];
    let seasonStartDate = new Date(seasonDefinition.startDate);
    let challengesNodeHash = seasonDefinition.seasonalChallengesPresentationNodeHash;
    let challengeWeeklyNodeHash = presentationNodeDefinitions[challengesNodeHash].children.presentationNodes[0].presentationNodeHash;
    let challengePresentation = presentationNodeDefinitions[challengeWeeklyNodeHash].children.presentationNodes;

    for (let node of challengePresentation) {

        let nodeDefinition = presentationNodeDefinitions[node.presentationNodeHash];

        // node may be named "Seasonal" instead of "Week 1"
        // offset by -one week to count the first week
        let weekNumber = parseInt(nodeDefinition.displayProperties.name.split(' ')[1]) - 1;

        // check if this week has passed, relative to season season startDate
        let isPassed = new Date() > new Date(new Date(seasonDefinition.startDate).setDate(new Date(seasonDefinition.startDate).getDate() + weekNumber * 7));
        challenges[nodeDefinition.displayProperties.name] = {
            weekNumber: weekNumber,
            isPassed: isPassed,
            challenges: []
        };

        // push each challenge in this presentation node to array
        for (let record of nodeDefinition.children.records) {

            let recordDefinition = recordDefinitions[record.recordHash];
            addPropsToChallengeItem(recordDefinition); // add synergy properties to seasonal challenge
            challenges[nodeDefinition.displayProperties.name].challenges.push(recordDefinition);
        };

        // wild card for "Seasonal" node
        if (nodeDefinition.displayProperties.name === 'Seasonal') {
            challenges[nodeDefinition.displayProperties.name].isPassed = true;
            challenges[nodeDefinition.displayProperties.name].weekNumber = null;
        };
    };
    
    return challenges;
};