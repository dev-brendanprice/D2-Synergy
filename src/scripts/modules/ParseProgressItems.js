import {
    vendorKeys,
    itemTypeKeys,
    baseYields,
    petraYields } from './SynergyDefinitions.js'
import { 
    ReturnSeasonPassProgressionStats,
    ParseSeasonalChallenges,
    InsertSeperators,
    AddValueToElementInner,
    CalcXpYield,
    PushToDOM,
    SortByType,
    SortByGroup,
    ParseBounties,
    SortBountiesByType,
    MakeBountyElement } from './ModuleScript.js';
import {
    seasonDefinitions,
    recordDefinitions,
    presentationNodeDefinitions,
    itemDefinitions,
    objectiveDefinitions } from '../user.js';

const log = console.log.bind(console);


// Function to fetch all progressional items
export async function ParseProgressionalItems(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp) {

    let returnObj = {
        charBounties: [],
        challenges: []
    };

    // Call function to get progressions for season pass XP and bonus stats
    const seasonPassProgressionStats = await ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack);

    // Season Pass innerHTML changes
    // AddValueToElementInner('seasonPassXpToNextRank', InsertSeperators(seasonPassProgressionStats.progressToNextLevel));
    // AddValueToElementInner('seasonPassXpToMaxRank', InsertSeperators(seasonPassProgressionStats.xpToMaxSeasonPassRank));
    // AddValueToElementInner('seasonPassFireteamBonus', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
    // AddValueToElementInner('seasonPassRankLevel', seasonPassProgressionStats.seasonPassLevel);
    // AddValueToElementInner('seasonPassXpBonus', `${seasonPassProgressionStats.bonusXpValue}%`); // +12 for bonus large xp modifier

    // // Pass in stats for the net breakdown section
    // AddValueToElementInner('sharedWisdomValue', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
    // AddValueToElementInner('ghostModValue', `${ghostModBonusXp}%`);
    // AddValueToElementInner('bonusXpValue', `${seasonPassProgressionStats.bonusXpValue}%`);


    // [ -- SEASONAL CHALLENGES -- ]
    // Clear HTML fields
    const filterToMakeCheckmarkGreen = 'invert(70%) sepia(96%) saturate(4644%) hue-rotate(84deg) brightness(126%) contrast(117%)',
          filterToResetCheckmark = 'invert(100%) brightness(50%)';

    document.getElementById('seasonPassBonusField').innerHTML = '--';
    // document.getElementById('sharedWisdomBonusField').innerHTML = '--';
    // document.getElementById('wellRestedBonusField').innerHTML = '--';
    document.getElementById('ghostModBonusField').innerHTML = '--';

    document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToResetCheckmark;

    // Get all seasonal challenges
    let allSeasonalChallenges = await ParseSeasonalChallenges(2809059433, seasonDefinitions, recordDefinitions, presentationNodeDefinitions, null);
    returnObj.challenges = allSeasonalChallenges; // Add to return object
    log('Seasonal Challenges:', allSeasonalChallenges);

    // Parse seasonal challenges into corresponding objects
    let completedChallenges = {},
        notCompletedChallenges = {},
        allSeasonalChallengesAndTheirDivs = {};

    for (const recordHash in characterRecords) {

        const objectives = characterRecords[recordHash].objectives;
        if (objectives && objectives.length > 0) {

            if (objectives.every((objective) => objective.complete)) {
                completedChallenges[recordHash] = {};
                completedChallenges[recordHash].displayProperties = recordDefinitions[recordHash].displayProperties;
                completedChallenges[recordHash].objectives = objectives;
            }
            else {
                notCompletedChallenges[recordHash] = {};
                notCompletedChallenges[recordHash].displayProperties = recordDefinitions[recordHash].displayProperties;
                notCompletedChallenges[recordHash].objectives = objectives;
            };
        };
    };


    // Create HTML elements for seasonal challenges
    for (const challengeHash in allSeasonalChallenges) {

        // Create HTML element for challenge
        let challengeContainer = document.createElement('div'),
            challengeIcon = document.createElement('img'),
            challengeName = document.createElement('div'),
            challengeBreakline = document.createElement('hr'),
            challengeDescription = document.createElement('div'),
            challengeProgressContainer = document.createElement('div'),
            challengeProgressTrack = document.createElement('div'),
            challengeProgressPercentBar = document.createElement('div');

        // Set attributes for challenge container
        challengeContainer.className = 'challengeContainer';
        challengeContainer.id = `${challengeHash}`;
        challengeIcon.className = 'challengeIcon';
        challengeName.className = 'challengeName';
        challengeBreakline.className = 'challengeBreakline';
        challengeDescription.className = 'challengeDescription';
        challengeProgressContainer.className = 'challengeProgressContainer';
        challengeProgressTrack.className = 'challengeProgressTrack';
        challengeProgressPercentBar.className = 'challengeProgressPercentBar';

        // Set attributes for content
        challengeDescription.innerHTML = allSeasonalChallenges[challengeHash].displayProperties.description;
        challengeName.innerHTML = allSeasonalChallenges[challengeHash].displayProperties.name;
        challengeIcon.src = `https://www.bungie.net${allSeasonalChallenges[challengeHash].displayProperties.icon}`;
        challengeContainer.style.userSelect = 'none';

        // Check if challenge is completed
        if (completedChallenges[challengeHash]) {
            challengeContainer.style.border = '1px solid #b39a36';
        };

        // Append all the content together
        challengeProgressContainer.appendChild(challengeProgressTrack);
        challengeProgressContainer.appendChild(challengeProgressPercentBar);
        challengeContainer.appendChild(challengeIcon);
        challengeContainer.appendChild(challengeName);
        challengeContainer.appendChild(challengeBreakline);
        challengeContainer.appendChild(challengeDescription);
        challengeContainer.appendChild(challengeProgressContainer);

        // Store the challenge and its div
        allSeasonalChallengesAndTheirDivs[challengeHash] = {};
        allSeasonalChallengesAndTheirDivs[challengeHash].container = challengeContainer;
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge = allSeasonalChallenges[challengeHash];

        // Append objectives to the challenge
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives = [];

        if (notCompletedChallenges[challengeHash] || completedChallenges[challengeHash]) {

            let challengeObjectives;

            // Parse non-completed objectives
            if (Object.keys(notCompletedChallenges).includes(challengeHash)) {

                challengeObjectives = notCompletedChallenges[challengeHash].objectives;
                for (const objective in challengeObjectives) {
                    allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(notCompletedChallenges[challengeHash].objectives[objective]);
                };
            };

            // Parse completed objectives
            if (Object.keys(completedChallenges).includes(challengeHash)) {

                challengeObjectives = completedChallenges[challengeHash].objectives;
                for (const objective in challengeObjectives) {
                    allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(completedChallenges[challengeHash].objectives[objective]);
                };
            };
        };

        // Check if the challenge is completed, set isComplete to true in guard statement, otherwise false by default
        // This is to make it easier to check if the challenge is complete, as opposed to comparing with completedChallenges
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = false;
        if (completedChallenges[challengeHash]) {
            allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = true;
        };

        // Sort challenge completion progress as a percentage of the total completion value
        let challengeObjectiveProgressTotal = 0,
            challengeObjectiveCompletionTotal = 0,
            challengeObjectives = allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives;

        for (const objective of challengeObjectives) {
            challengeObjectiveProgressTotal += objective.progress;
            challengeObjectiveCompletionTotal += objective.completionValue;
        };

        // Calculate progress as a percentage, if objective is "0/1" then it is a boolean, 
        // so set progress to 0% (if not complete) or 100% (if complete)
        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage = (challengeObjectiveProgressTotal / challengeObjectiveCompletionTotal) * 100;

        // Change width of challengeProgressPercentBar based on completion percentage
        if (allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage >= 100) {
            challengeProgressPercentBar.style.width = '100%';
        }
        else {
            challengeProgressPercentBar.style.width = `${allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage}%`;
        };
    };

    // Sort challenges by completion percentage, in ascending order
    let sortedChallenges = Object.values(allSeasonalChallengesAndTheirDivs).sort((a, b) => a.challenge.completionPercentage - b.challenge.completionPercentage);
    log(Object.entries(sortedChallenges));

    // Slice the array of challenges into chunks of 6
    let chunkedChallenges = [];
    for (let i=0; i<Object.keys(sortedChallenges).length; i+=6) {
        chunkedChallenges.push(sortedChallenges.slice(i, i+6));
    };

    // Create HTML elements for each chunk of challenges
    for (let i=0; i<chunkedChallenges.length; i++) {
        
        // Create container thath olds the current chunk of 6 challenges
        let chunkContainer = document.createElement('div');
        chunkContainer.className = 'chunkPage';
        chunkContainer.id = `challengeChunk${i}`;
        
        // If it's the first iteration then, show the container, otherwise hide it
        if (i === 0) {
            chunkContainer.style.display = 'grid';
        }
        else {
            chunkContainer.style.display = 'none';
        };

        // Append each challenge, from the chunk, to the chunk container
        for (const chunk of chunkedChallenges[i]) {
            chunkContainer.appendChild(chunk.container);
        };

        // Append the chunk container to seasonalChallengeItems
        document.getElementById('seasonalChallengeItems').appendChild(chunkContainer);
    };

    // Push HTML fields for challenges header stats
    document.getElementById('outstandingChallengesAmountField').innerHTML = `${Object.keys(notCompletedChallenges).length}`;
    document.getElementById('completedChallengesAmountField').innerHTML = `${Object.keys(completedChallenges).length}`;
    document.getElementById('challengesAmountField').innerHTML = `${Object.keys(allSeasonalChallenges).length}`;
    // [ -- END OF SEASONAL CHALLENGES -- ]



    // [ -- BOUNTIES -- ]
    // Iterate over CharacterInventories[characterId].items
    let charInventory = CharacterInventories[characterId].items, 
        amountOfBounties = 0;

    // Make array with specified groups
    let bountyArr = {};
    vendorKeys.forEach(key => {
        bountyArr[key] = [];
    });

    // Loop over inventory items and emit bounties
    log('loadCharacter parsing bounties');
    let parsedBountiesResponse = ParseBounties(charInventory, CharacterObjectives, itemDefinitions, objectiveDefinitions);
    let characterBounties = parsedBountiesResponse.charBounties;
    amountOfBounties = parsedBountiesResponse.amountOfBounties;
    returnObj.charBounties = characterBounties; // Add bounties to return object

    if (amountOfBounties < 20) {
        document.getElementById('recommendationTooltip').style.display = 'block';
    };

    // Translate objective hashes to objective strings
    Object.keys(characterBounties).forEach(bounty => {
        
        let objHashes = characterBounties[bounty].objectives.objectiveHashes;
        characterBounties[bounty].objectiveDefinitions = [];

        for (let objHash of objHashes) {
            characterBounties[bounty].objectiveDefinitions.push(objectiveDefinitions[objHash]);
        };
    });

    // Sort bounties by group (vanguard, gunsmith etc)
    bountyArr = SortByGroup(characterBounties, bountyArr, vendorKeys);

    // Sort bounties by type (weekly, daily etc)
    bountyArr = SortByType(bountyArr, SortBountiesByType);

    // Push sorted bounties to the page
    PushToDOM(bountyArr, amountOfBounties, MakeBountyElement);

    // Get statistics for subheadings
    let amountOfExpiredBounties = 0, 
        amountOfCompletedBounties = 0;

    // Count completed and expired bounties
    for (let bounty of characterBounties) {
        if (bounty.isComplete) {
            amountOfCompletedBounties++;
        }
        else if (bounty.isExpired) {
            amountOfExpiredBounties++;
        };
    };

    // Find well rested bonus
    let wellRestedBonus = 1;
    // if (seasonProgressionInfo.level === 100) {
    //     if (prestigeProgressionSeasonInfo.weeklyProgress <= 500_000) {
    //         document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
    //         document.getElementById('wellRestedBonusField').innerHTML = `2x`;
    //         wellRestedBonus = 2;
    //     }
    //     else {
    //         document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
    //     };
    // }
    // else if (seasonProgressionInfo.level < 100) {
    //     if (seasonProgressionInfo.weeklyProgress <= 500_000) {
    //         document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
    //         document.getElementById('wellRestedBonusField').innerHTML = `2x`;
    //         wellRestedBonus = 2;
    //     }
    //     else {
    //         document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
    //     };
    // };
        
    // Check if ghost mods are slotted, turn off checkmark if not
    if (ghostModBonusXp) {
        document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        document.getElementById('ghostModBonusField').innerHTML = `+${ghostModBonusXp}%`;
    }
    else {
        document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToResetCheckmark;
    };

    // Check if shared wisdom is not equal to 0, turn off checkmark if not
    // if (seasonPassProgressionStats.sharedWisdomBonusValue) {
    //     document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
    //     document.getElementById('sharedWisdomBonusField').innerHTML = `+${seasonPassProgressionStats.sharedWisdomBonusValue}%`;
    // }
    // else {
    //     document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToResetCheckmark;
    // };

    // Check if bonus xp is not equal to 0, turn off checkmark if not
    if (seasonPassProgressionStats.bonusXpValue) {
        document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        document.getElementById('seasonPassBonusField').innerHTML = `+${seasonPassProgressionStats.bonusXpValue}%`;
    }
    else {
        document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToResetCheckmark;
    };

    // Calculate XP yield from (active) bounties
    let totalXpYield = 0;
    let totalXpYieldWithModifiers = 0;
    await CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields)
    .then((xpYield) => {
        totalXpYield = xpYield;
    })
    .catch((err) => {
        console.error(err);
    });

    // Format to 1.n
    // const xpModifier = (((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp) * wellRestedBonus) / 100) + 1;
    const xpModifier = (((seasonPassProgressionStats.bonusXpValue + ghostModBonusXp)) / 100) + 1;
    
    // Subtract the difference between current weekly progress to the end of the well rested bonus
    // if (((totalXpYield * xpModifier) * 2) > (500_000 - seasonPassProgressionStats.weeklyProgress)) {

    //     log('Well-Rested Surpassed');

    //     // Ignore well rested bonus
    //     const xpModifier = (((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp)) / 100) + 1;

    //     // log([totalXpYield, xpModifier, (totalXpYield * xpModifier), (500_000 - seasonPassProgressionStats.weeklyProgress), (500_000 - seasonPassProgressionStats.weeklyProgress) / 2]);
    //     // log(`${totalXpYield} * ${xpModifier} + ((500_000 - ${seasonPassProgressionStats.weeklyProgress}) / 2)`);

    //     // Calculate XP yield where well rested bonus has no more overhead; will not be used on the overhead calculation
    //     totalXpYieldWithModifiers = (totalXpYield * xpModifier) + ((500_000 - seasonPassProgressionStats.weeklyProgress) / 2);
    // }
    // else {
    //     log('well rested bonus not surpassed');
    //     totalXpYieldWithModifiers = totalXpYield * xpModifier;
    // };
    totalXpYieldWithModifiers = totalXpYield * xpModifier;

    // Push subheading statistics
    AddValueToElementInner('bountiesTotalField', amountOfBounties);
    AddValueToElementInner('bountiesExpiredField', amountOfExpiredBounties);
    AddValueToElementInner('bountiesCompletedField', amountOfCompletedBounties);
    AddValueToElementInner('bountiesOutstandingField', amountOfBounties - amountOfCompletedBounties);

    // Check if there are no bounties
    if (amountOfBounties === 0) {

        // Toggle no items tooltip
        document.getElementById('noBountiesTooltip').style.display = 'block';

        // Set raw xp values to 0
        AddValueToElementInner('rawXpField', 0);
        AddValueToElementInner('artifactLevelsField', 0);
        AddValueToElementInner('SeasonPassLevelsField', 0);
        // Set modified xp values to 0
        AddValueToElementInner('xpWithModField', 0);
        AddValueToElementInner('artifactLevelsWithModField', 0);
        AddValueToElementInner('SeasonPassLevelsWithModField', 0);

    }
    else if (amountOfBounties > 0) {

        // Toggle no items tooltip
        document.getElementById('noBountiesTooltip').style.display = 'none';

        // Set raw xp values
        AddValueToElementInner('rawXpField', InsertSeperators(totalXpYield));
        AddValueToElementInner('artifactLevelsField', 0);
        AddValueToElementInner('SeasonPassLevelsField', InsertSeperators(totalXpYield / 100_000));
        // Set modified xp values
        AddValueToElementInner('xpWithModField', InsertSeperators(totalXpYieldWithModifiers));
        AddValueToElementInner('artifactLevelsWithModField', 0);
        AddValueToElementInner('SeasonPassLevelsWithModField', InsertSeperators(totalXpYieldWithModifiers / 100_000));
    };
    // [ -- END OF BOUNTIES -- ]

    log('-> ParseProgressionalItems Done');
    return returnObj;
};