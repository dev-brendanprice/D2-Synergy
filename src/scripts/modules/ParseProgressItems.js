import {
    vendorKeys,
    itemTypeKeys,
    baseYields,
    petraYields,
    rewardsBasedOnChallengerXP,
    rewardsBasedOnSingularItems } from './SynergyDefinitions.js'
import {
    seasonDefinitions,
    recordDefinitions,
    presentationNodeDefinitions,
    itemDefinitions,
    objectiveDefinitions,
    UserProfileProgressions, 
    progressionDefinitions, 
    UserProfile,
    userTrasistoryData,
    seasonPassLevelStructure, log } from '../user.js';
import { MakeBountyElement } from './MakeBountyElement.js';
import { ParseSeasonalChallenges } from './ParseSeasonalChallenges.js';
import { ReturnSeasonPassProgressionStats } from './ReturnSeasonPassProgressionStats.js';
import { ParseBounties } from './ParseBounties.js';
import { CalcXpYield } from './CalcXpYield.js';
import { AddValueToElementInner } from './AddValueToElementInner.js';
import { ReplaceStringVariables } from './ReplaceStringVariables.js';
import { PushToDOM } from './PushToDOM.js';
import { SortBountiesByType } from './SortBountiesByType.js';
import { SortByType } from './SortByType.js';
import { SortByGroup } from './SortByGroup.js';
import { InsertSeperators } from './InsertSeperators.js';
import { AddListener } from './Events.js';
import { CacheReturnItem } from './CacheReturnItem.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { AddYieldValues } from './AddYieldValues.js';
import { ParseStatistics } from './ParseStatistics.js';

export let seasonPassProgressionStats = {};


// Function to fetch all progressional items
export async function ParseProgressionalItems(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp, seasonalArtifactInfo) {

    let returnObj = {
        charBounties: [],
        challenges: []
    };

    // Call function to get progressions for season pass XP and bonus stats
    seasonPassProgressionStats = await ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack);
    const artifact = UserProfileProgressions.ProfileProgressions.seasonalArtifact;

    // Season Pass innerHTML changes
    // AddValueToElementInner('seasonPassXpToNextRank', InsertSeperators(seasonPassProgressionStats.progressToNextLevel));
    // AddValueToElementInner('seasonPassXpToMaxRank', InsertSeperators(seasonPassProgressionStats.xpToMaxSeasonPassRank));
    // AddValueToElementInner('seasonPassFireteamBonus', `${seasonPassProgressionStats.sharedWisdomBonusValue}%`);
    // AddValueToElementInner('seasonPassRankLevel', seasonPassProgressionStats.seasonPassLevel);
    // AddValueToElementInner('seasonPassXpBonus', `${seasonPassProgressionStats.bonusXpValue}%`); // +12 for bonus large xp modifier


    // [ -- SEASONAL CHALLENGES -- ]
    // Clear HTML fields
    const filterToMakeCheckmarkGreen = 'invert(70%) sepia(96%) saturate(4644%) hue-rotate(84deg) brightness(126%) contrast(117%)',
          filterToResetCheckmark = 'invert(100%) brightness(50%)';

    document.getElementById('seasonPassBonusField').innerHTML = '--';
    document.getElementById('sharedWisdomBonusField').innerHTML = '--';
    document.getElementById('wellRestedBonusField').innerHTML = '--';
    document.getElementById('ghostModBonusField').innerHTML = '--';

    document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
    document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToResetCheckmark;

    // Get all seasonal challenges
    let currentSeasonalChallenges = await ParseSeasonalChallenges(UserProfile.currentSeasonHash, seasonProgressionInfo);
    let totalSeasonalChallenges = 0;
    returnObj.challenges = {};

    // Separate challenges based on their completion status
    let completedChallenges = {};
    let notCompletedChallenges = {};
    let allSeasonalChallengesAndTheirDivs = {};
    let completedChallengesCount = 0;
    let notCompletedChallengesCount = 0;


    // Add objectives to (all) seasonal challenges
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

    for (let item in currentSeasonalChallenges) {
        
        let week = currentSeasonalChallenges[item];
        let fubar = currentSeasonalChallenges[item].challenges;
        totalSeasonalChallenges += fubar.length;

        for (let challenge of fubar) {
            log(challenge);
            let challengeHash = challenge.hash;

            // Create HTML element for challenge
            let challengeContainer = document.createElement('div');
            let challengeHeadingContainer = document.createElement('div');
            let challengeHeadingAttributeContainer = document.createElement('div');
            let challengeIcon = document.createElement('img');
            let challengeName = document.createElement('div');
            let challengeDescription = document.createElement('div');
            let challengeProgressContainer = document.createElement('div');
            let challengeProgressTrack = document.createElement('div');
            let challengeProgressPercentBar = document.createElement('div');
            let challengeRewardsContainer = document.createElement('div');
            let challengeProgressAttributesContainer = document.createElement('div');

            // Set attributes for challenge container
            challengeContainer.className = 'challengeContainer';
            challengeHeadingContainer.className = 'challengeHeadingContainer';
            challengeHeadingAttributeContainer.className = 'challengeHeadingAttributeContainer';
            challengeContainer.id = `${challengeHash}`;
            challengeIcon.className = 'challengeIcon';
            challengeName.className = 'challengeName';
            challengeDescription.className = 'challengeDescription';
            challengeProgressContainer.className = 'challengeProgressContainer';
            challengeProgressTrack.className = 'challengeProgressTrack';
            challengeProgressPercentBar.className = 'challengeProgressPercentBar';
            challengeRewardsContainer.className = 'challengeRewardsContainer';
            challengeProgressAttributesContainer.className = 'challengeProgressAttributesContainer';

            // Set attributes for content
            challengeDescription.innerHTML = challenge.displayProperties.description;
            challengeName.innerHTML = challenge.displayProperties.name;
            challengeIcon.src = `https://www.bungie.net${challenge.displayProperties.icon}`;
            challengeContainer.style.userSelect = 'none';

            // Check if challenge is completed
            if (completedChallenges[challengeHash]) {

                challengeContainer.classList.add('challengeContainerComplete');
                challenge.isComplete = true;

                // Check if challenge has been claimed
                let destinyProfileRecords = UserProfile.destinyUserProfile.characterRecords.data[characterId].records;
                if (destinyProfileRecords[challengeHash]) {

                    if (destinyProfileRecords[challengeHash].state === 0) {
                        challenge.isClaimed = false;
                        challengeContainer.classList.remove('challengeContainerComplete');
                        challengeContainer.classList.add('challengeContainerCompletedNotClaimed');
                    }
                    else if (destinyProfileRecords[challengeHash].state === 1) {
                        challenge.isClaimed = true;
                    };
                };

            }
            else {
                challengeContainer.classList.add('challengeContainerNotComplete');
                challenge.isComplete = false;
            };

            // Append all the content together
            challengeHeadingContainer.append(challengeIcon, challengeHeadingAttributeContainer);
            challengeHeadingAttributeContainer.append(challengeName, challengeDescription);
            challengeContainer.appendChild(challengeHeadingContainer);

            // Store the challenge and its div
            allSeasonalChallengesAndTheirDivs[challengeHash] = {};
            allSeasonalChallengesAndTheirDivs[challengeHash].container = challengeContainer;
            allSeasonalChallengesAndTheirDivs[challengeHash].challenge = challenge;

            // Append objectives to the challenge
            allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives = [];
            if (notCompletedChallenges[challengeHash] || completedChallenges[challengeHash]) {

                let challengeObjectives;

                // Parse non-completed objectives
                if (Object.keys(notCompletedChallenges).includes(challengeHash)) {

                    challengeObjectives = notCompletedChallenges[challengeHash].objectives;
                    for (let objective in challengeObjectives) {
                        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(notCompletedChallenges[challengeHash].objectives[objective]);
                    };
                };

                // Parse completed objectives
                if (Object.keys(completedChallenges).includes(challengeHash)) {

                    challengeObjectives = completedChallenges[challengeHash].objectives;
                    for (let objective in challengeObjectives) {
                        allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives.push(completedChallenges[challengeHash].objectives[objective]);
                    };
                };
            };

            // Add objective element to challenge
            for (let objective of challenge.objectives) {

                // Objective container
                let objectiveContainer = document.createElement('div');

                // Checkbox
                let objectiveCheckboxOuter = document.createElement('div');
                let objectiveCheckboxMiddle = document.createElement('div');
                let objectiveCheckboxInner = document.createElement('div');

                // Checkbox style
                objectiveCheckboxOuter.className = 'objectiveCheckboxOuter';
                objectiveCheckboxMiddle.className = 'objectiveCheckboxMiddle';
                objectiveCheckboxInner.className = 'objectiveCheckboxInner';

                // Progress bar (objectiveAttributes doubles as a container)
                let objectiveAttributes = document.createElement('div');
                let objectiveName = document.createElement('div');
                let objectiveProgress = document.createElement('div');

                // Progress bar style
                objectiveAttributes.className = 'objectiveAttributes';
                objectiveContainer.className = 'objectiveContainer';
                objectiveName.className = 'objectiveName';
                objectiveProgress.className = 'objectiveProgress';

                // InnerHTML values etc
                objectiveName.innerHTML = objectiveDefinitions[objective.objectiveHash].progressDescription || 'Completed';
                objectiveProgress.innerHTML = `${objective.progress}/${objective.completionValue}`;

                // If objective is complete
                if (objective.complete) {

                    // Change innerHTML to avoid overflow values
                    objectiveProgress.innerHTML = `${objective.completionValue}/${objective.completionValue}`;

                    // Change checkbox style
                    objectiveCheckboxOuter.style.borderColor = 'var(--challengeCompletedCheckboxOuter)';
                    objectiveCheckboxMiddle.style.borderColor = 'var(--challengeCompletedCheckboxMiddle)';
                    objectiveCheckboxInner.style.backgroundColor = 'var(--challengeCompletedCheckboxInner)';
                    
                    // Change attribute container style (to children too)
                    objectiveName.style.color = '#BABABA';
                    objectiveProgress.style.color = '#BABABA';
                    objectiveAttributes.style.color = '#494949';
                };

                // Append elements to their parents
                objectiveCheckboxOuter.appendChild(objectiveCheckboxMiddle);
                objectiveCheckboxMiddle.appendChild(objectiveCheckboxInner);
                objectiveAttributes.append(objectiveName, objectiveProgress);

                // Push elements to top-most parent
                objectiveContainer.append(objectiveCheckboxOuter, objectiveAttributes);

                // Push objectives to parent container
                challengeProgressAttributesContainer.appendChild(objectiveContainer);

            };
            challengeContainer.appendChild(challengeProgressAttributesContainer);

            // Add reward items to the challenge
            if (challenge.rewardItems) {

                // Loop over challenge reward items
                let challengeRewardItems = challenge.rewardItems;
                for (let i=0; i<challengeRewardItems.length; i++) {

                    // root reward from current iteration
                    let reward = challengeRewardItems[i];
                    
                    // Create DOM elements
                    let rewardContainer = document.createElement('div');
                    let rewardName = document.createElement('div');
                    let rewardIcon = document.createElement('img');

                    // Get corresponding reward values, based on the reward name
                    let rewardUiName = itemDefinitions[reward.itemHash].displayProperties.name;
                    let previousRewardUiName;

                    // Check the next reward is bright dust, if so go to the previous iteration to get the corresponding reward value
                    if (challengeRewardItems[i-1]) {

                        previousRewardUiName = itemDefinitions[challengeRewardItems[i-1].itemHash].displayProperties.name;
                        let currentRewardName = itemDefinitions[challengeRewardItems[i].itemHash].displayProperties.name;

                        // Bright dust reward value
                        if (previousRewardUiName.includes('Challenger XP')) {
                            let rewardValue = InsertSeperators(rewardsBasedOnChallengerXP[previousRewardUiName]);
                            rewardName.innerHTML = `${currentRewardName} (${rewardValue})`;
                        };

                        // Singular challenger XP reward value
                        if (currentRewardName.includes('Challenger XP')) {
                            let rewardValue = InsertSeperators(rewardsBasedOnSingularItems[currentRewardName]);
                            rewardName.innerHTML = `${currentRewardName} (${rewardValue})`;
                        };
                    }

                    // Else, use reward values based on singular items
                    else {
                        let rewardValue = InsertSeperators(rewardsBasedOnSingularItems[rewardUiName]);
                        rewardName.innerHTML = `${rewardUiName} (${rewardValue})`;

                        // ..
                        if (rewardUiName.includes('Challenger XP')) {
                            // log(rewardUiName, rewardValue);
                        };
                    };

                    rewardContainer.className = 'singleChallengeRewardContainer';
                    rewardIcon.src = `https://www.bungie.net${itemDefinitions[reward.itemHash].displayProperties.icon}`;
                    rewardName.className = 'challengeRewardName';
                    rewardIcon.className = 'challengeRewardIcon';

                    rewardContainer.append(rewardIcon, rewardName);
                    challengeRewardsContainer.appendChild(rewardContainer);
                };

                challengeContainer.appendChild(challengeRewardsContainer);
            };

            // Check if the challenge is completed, set isComplete to true in guard statement, otherwise false by default
            // This is to make it easier to check if the challenge is complete, as opposed to comparing with completedChallenges
            if (completedChallenges[challengeHash]) {
                completedChallengesCount++;
                allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = true;
            }
            else {
                notCompletedChallengesCount++;
                allSeasonalChallengesAndTheirDivs[challengeHash].challenge.isComplete = false;
            };

            // Sort challenge completion progress as a percentage of the total completion value
            let challengeObjectiveProgressTotal = 0;
            let challengeObjectiveCompletionTotal = 0;
            let challengeObjectives = allSeasonalChallengesAndTheirDivs[challengeHash].challenge.objectives;

            for (const objective in challengeObjectives) {
                challengeObjectiveProgressTotal += challengeObjectives[objective].progress;
                challengeObjectiveCompletionTotal += challengeObjectives[objective].completionValue;
            };

            // Calculate progress as a percentage, if objective is "0/1" then it is a boolean,
            // so set progress (if not complete) or 100% (if complete, avoid overflow)
            allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage = (challengeObjectiveProgressTotal / challengeObjectiveCompletionTotal) * 100;

            // Change width of challengeProgressPercentBar based on completion percentage
            if (allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage >= 100) {
                challengeProgressPercentBar.style.width = '100%';
            }
            else {
                challengeProgressPercentBar.style.width = `${allSeasonalChallengesAndTheirDivs[challengeHash].challenge.completionPercentage}%`;
            };
        };
    };


    // Sort challenges by completion percentage, in ascending order (so the completed ones are at the end)
    let sortedChallenges = Object.values(allSeasonalChallengesAndTheirDivs).sort((a, b) => a.challenge.completionPercentage - b.challenge.completionPercentage);

    // Push challenges to UserProfile (global scope usage)
    UserProfile.AssignProgressions('challenges', sortedChallenges.map(v => v.challenge));

    // Find out how many "chunks" we need to display all the challenges
    let chunkCount = sortedChallenges.length / 6;

    // If there is a remainder
    if (chunkCount % 1 !== 0) {

        // Add one and truncate number (account for overflow)
        chunkCount++;
        chunkCount = Math.trunc(chunkCount);
    };

    // Seperate and push challenges into chunks of 6
    let tempChallengesArray = sortedChallenges;
    for (let i=0; i < chunkCount; i++) { // Loop over chunks

        // Create chunk DOM container
        let chunkContainer = document.createElement('div');
        chunkContainer.className = 'chunkPage';
        chunkContainer.id = `challengeChunk${i}`;
        chunkContainer.style.display = 'none';

        // If first chunk - show
        if (i===0) chunkContainer.style.display = 'grid';

        /*
            Append challenges to chunks in group of 6
            Push those chunks to the DOM

            Iterate 6 times, appending items each time, checking to see if it exists before appending
        */
        for (let z=0; z < 6; z++) {
            if (tempChallengesArray[z]) {
                chunkContainer.appendChild(tempChallengesArray[z].container);
            };
        };

        // Remove first 6 items of array
        tempChallengesArray = tempChallengesArray.slice(6);

        // Append chunk to the DOM
        document.getElementById('seasonalChallengeItems').appendChild(chunkContainer);
    };

    // Push HTML fields for challenges header stats
    document.getElementById('challengesTotalField').innerHTML = `${Object.keys(currentSeasonalChallenges).length}`;
    document.getElementById('challengesCompletedField').innerHTML = completedChallengesCount;
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
    let parsedBountiesResponse = ParseBounties(charInventory, CharacterObjectives, itemDefinitions, objectiveDefinitions);
    let characterBounties = parsedBountiesResponse.charBounties;
    amountOfBounties = parsedBountiesResponse.amountOfBounties;

    // Add bounties to return object
    returnObj.charBounties = characterBounties;

    if (amountOfBounties === 0) {
        document.getElementById('recommendationTooltip').style.display = 'none';
    }
    else if (amountOfBounties < 20) {
        document.getElementById('recommendationTooltip').style.display = 'block';
    };

    // Translate objective hashes to objective strings
    Object.keys(characterBounties).forEach(bounty => {
        
        let objHashes = characterBounties[bounty].objectives.objectiveHashes;
        characterBounties[bounty].objectiveDefinitions = [];

        // Push objective definitions to bounty
        for (let objHash of objHashes) {

            // Replace string variables
            objectiveDefinitions[objHash].progressDescription = ReplaceStringVariables(objectiveDefinitions[objHash].progressDescription);
            characterBounties[bounty].objectiveDefinitions.push(objectiveDefinitions[objHash]);
        };
    });

    // Sort bounties by group (vanguard, gunsmith etc)
    bountyArr = SortByGroup(characterBounties, bountyArr, vendorKeys);

    // Sort bounties by type (weekly, daily etc)
    bountyArr = SortByType(bountyArr, SortBountiesByType);

    // Seperate bounties from category array and sort via completion status
    let newBountyArr = [];
    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        if (group.length !== 0) {
            group.forEach(item => {
                newBountyArr.push(item);
            });
        };
    });

    // Sort bounties by completion status
    newBountyArr.sort((a,b) => {
        if (a.isComplete === b.isComplete) {
            return 0;
        }
        else {
            if (a.isComplete) {
                return -1;
            }
            else {
                return 1;
            };
        };
    });
    newBountyArr.reverse();

    // Clear innerHTML and push items to DOM
    document.getElementById('bountyItems').innerHTML = '';
    newBountyArr.forEach(item => MakeBountyElement(item));


    // Get statistics for subheadings
    let amountOfExpiredBounties = 0;
    let amountOfCompletedBounties = 0;

    // Count completed and expired bounties
    for (let bounty of characterBounties) {
        if (bounty.isComplete) {
            amountOfCompletedBounties++;
        }
        else if (bounty.isExpired) {
            amountOfExpiredBounties++;
        };
    };

    // Get weekly progress -- If player is >= level 100 then it means they have "prestiged"
    let weeklyProgress;
    if (seasonPassProgressionStats.seasonPassLevel >= 100) {
        weeklyProgress = prestigeProgressionSeasonInfo.weeklyProgress;
    }
    else {
        weeklyProgress = seasonProgressionInfo.weeklyProgress;
    };

        
    // Check if ghost mods are slotted, turn off checkmark if not
    if (ghostModBonusXp) {
        document.getElementById('ghostModsCheckmarkIcon').src = './static/ico/checkmark.svg';
        document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        AddValueToElementInner('ghostModBonusField', `+${ghostModBonusXp}%`);
        document.getElementById('ghostModsBonusText').style.textDecoration = 'unset';
    }
    else {
        document.getElementById('ghostModsCheckmarkIcon').src = './static/ico/crossmark.svg';
        document.getElementById('ghostModsCheckmarkIcon').style.filter = filterToResetCheckmark;
        AddValueToElementInner('ghostModBonusField', `--`);
        document.getElementById('ghostModsBonusText').style.textDecoration = 'line-through';
    };

    // Check if bonus xp is not equal to 0, turn off checkmark if not
    if (seasonPassProgressionStats.bonusXpValue) {
        document.getElementById('seasonPassBonusCheckmarkIcon').src = './static/ico/checkmark.svg';
        document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        AddValueToElementInner('seasonPassBonusField', `+${seasonPassProgressionStats.bonusXpValue}%`);
        document.getElementById('seasonPassBonusText').style.textDecoration = 'unset';
    }
    else {
        document.getElementById('seasonPassBonusCheckmarkIcon').src = './static/ico/crossmark.svg';
        document.getElementById('seasonPassBonusCheckmarkIcon').style.filter = filterToResetCheckmark;
        AddValueToElementInner('seasonPassBonusField', `--`);
        document.getElementById('seasonPassBonusText').style.textDecoration = 'line-through';
    };

    // Calculate XP yield from (active) bounties
    let totalXpYield = 0;
    let totalXpYieldWithModifiers = 0;
    totalXpYield = await CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields);

    // Format to 1.n
    // const xpModifier = (((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp) * wellRestedBonus) / 100) + 1;
    let xpModifier = (((seasonPassProgressionStats.bonusXpValue + ghostModBonusXp)) / 100) + 1;

    // Check if weekly progress surpasses that of the well-rested buff
    // weeklyProgress = 450_000; -- bonus xp in this case will 25_000
    if (((500_000 - weeklyProgress) / 2) < 0) {
        log('📚 Well rested expired');
        totalXpYieldWithModifiers = (totalXpYield * xpModifier);
        document.getElementById('wellRestedCheckmarkIcon').src = './static/ico/crossmark.svg';
        document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToResetCheckmark;
        AddValueToElementInner('wellRestedBonusField', `--`);
        document.getElementById('wellRestedBonusText').style.textDecoration = 'line-through';
    }
    else {
        log('📚 Well rested active');
        totalXpYieldWithModifiers = (totalXpYield * xpModifier) + ((500_000 - weeklyProgress) / 2);
        document.getElementById('wellRestedCheckmarkIcon').src = './static/ico/checkmark.svg';
        document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        AddValueToElementInner('wellRestedBonusField', `2x`);
        document.getElementById('wellRestedBonusText').style.textDecoration = 'unset';
    };

    // Truncate the result
    totalXpYieldWithModifiers = Math.trunc(totalXpYieldWithModifiers);

    // Push subheading statistics
    AddValueToElementInner('bountiesTotalField', amountOfBounties);
    AddValueToElementInner('bountiesExpiredField', amountOfExpiredBounties);
    AddValueToElementInner('bountiesCompletedField', amountOfCompletedBounties);


    // User transistory (shared wisdom mainly)
    let highestSeasonPassRankInFireteam = userTrasistoryData.highestSeasonPassRankInFireteam;
    let sharedWisdomLevels = seasonPassLevelStructure.sharedWisdomLevels;
    let sharedWisdomPercentage = 0;
    
    // Find the highest shared wisdom modifier via fireteam members
    for (let level of sharedWisdomLevels) {
        if (highestSeasonPassRankInFireteam > level) {
            sharedWisdomPercentage += 2;
        };
    };

    // Change shared wisdom modifier elements
    if (sharedWisdomPercentage > 0) {
        document.getElementById('sharedWisdomCheckmarkIcon').src = './static/ico/checkmark.svg';
        document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        AddValueToElementInner('sharedWisdomBonusField', `+${sharedWisdomPercentage}%`);
        document.getElementById('sharedWisdomBonusText').style.textDecoration = 'unset';
    }
    else {
        document.getElementById('sharedWisdomCheckmarkIcon').src = './static/ico/crossmark.svg';
        document.getElementById('sharedWisdomCheckmarkIcon').style.filter = filterToResetCheckmark;
        AddValueToElementInner('sharedWisdomBonusField', `--`);
        document.getElementById('sharedWisdomBonusText').style.textDecoration = 'line-through';
    };


    // Use modifiers toggle
    let yieldsData = {
        artifact: artifact,
        base: totalXpYield,
        modified: totalXpYieldWithModifiers,
        useModifiers: true // Default
    };

    // Listen for checkbox change
    AddListener('checkboxUseModifiers', 'change', async function() {

        if (this.checked) {
            CacheChangeItem('useModifiers', true);
            yieldsData.useModifiers = true;
            await AddYieldValues(yieldsData);
            return;
        };

        CacheChangeItem('useModifiers', false);
        yieldsData.useModifiers = false;
        await AddYieldValues(yieldsData);
    });

    // Check for cache item
    await CacheReturnItem('useModifiers')
    .then((res) => {
        
        // Check if val doesnt exist
        if (res === undefined) {
            CacheChangeItem('useModifiers', true); // Default
            document.getElementById('checkboxUseModifiers').checked = true;
            yieldsData.useModifiers = true;
            return;
        };

        document.getElementById('checkboxUseModifiers').checked = res;
        yieldsData.useModifiers = res;
    })
    .catch((error) => {
        console.error(error);
    });

    
    // Add metrics to statistics page
    await ParseStatistics();


    // Check if there are no bounties
    if (amountOfBounties === 0) {

        // No items tooltip
        document.getElementById('noBountiesTooltip').style.display = 'block';

        // Artifact power bonus fraction fields
        AddValueToElementInner('artifactPowerBonusProgressField', 0);
        AddValueToElementInner('artifactPowerBonusCeilingField', 0);

        // Artifact mod levels fraction fields
        AddValueToElementInner('artifactModLevelsProgressField', 0);
        AddValueToElementInner('artifactModLevelsCeilingField', 0);

        // Season pass levels and total XP
        AddValueToElementInner('xpWithModField', 0);
        AddValueToElementInner('SeasonPassLevelsWithModField', 0);

    }
    else if (amountOfBounties > 0) {

        // No items tooltip
        document.getElementById('noBountiesTooltip').style.display = 'none';

        // add yield values
        await AddYieldValues(yieldsData);

    };
    // [ -- END OF BOUNTIES -- ]

    log('-> ParseProgressionalItems Done');
    return returnObj;
};