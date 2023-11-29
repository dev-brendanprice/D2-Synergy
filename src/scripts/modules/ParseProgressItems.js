import {
    vendorKeys,
    itemTypeKeys,
    baseYields,
    petraYields,
    rewardsBasedOnChallengerXP,
    rewardsBasedOnSingularItems } from './SynergyDefinitions.js'
import {
    recordDefinitions,
    itemDefinitions,
    objectiveDefinitions,
    UserProfileProgressions,
    UserProfile,
    profileWideData,
    userTrasistoryData,
    seasonPassLevelStructure, accentColor, log } from '../user.js';
import { MakeBountyElement } from './MakeBountyElement.js';
import { ParseSeasonalChallenges } from './ParseSeasonalChallenges.js';
import { ReturnSeasonPassProgressionStats } from './ReturnSeasonPassProgressionStats.js';
import { ParseBounties } from './ParseBounties.js';
import { CalcXpYield } from './CalcXpYield.js';
import { AddValueToElementInner } from './AddValueToElementInner.js';
import { ReplaceStringVariables } from './ReplaceStringVariables.js';
import { SortBountiesByType } from './SortBountiesByType.js';
import { SortByType } from './SortByType.js';
import { SortByGroup } from './SortByGroup.js';
import { AddListener } from './Events.js';
import { CacheReturnItem } from './CacheReturnItem.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { AddYieldValues } from './AddYieldValues.js';
import { ParseStatistics } from './ParseStatistics.js';
import { CreateSeasonalChallenge } from './CreateSeasonalChallenge.js';

export let seasonPassProgressionStats = {};

let challengesCounter = 0;
let completeChallengesCounter = 0;


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
    returnObj.challenges = {};

    // Build group containers and seasonal challenges UI section
    let groupNames = []; log(currentSeasonalChallenges);
    for (let weekString in currentSeasonalChallenges) {
        
        // Get week data 
        let weekData = currentSeasonalChallenges[weekString];

        // Get current groups from modal and store
        let modalButtons = document.getElementsByClassName('groupsDropdownButtonTextSections');
        for (let button of modalButtons) {
            groupNames.push(button.getAttribute('data-groupname'));
        };

        // log(weekString, weekData.challenges);
        if (!groupNames.includes(weekString)) {

            // Create div elements
            const listItemContainer = document.createElement('div');
            const listItemContent = document.createElement('div');
            listItemContent.setAttribute('data-groupname', weekString); // Set data attr
            listItemContent.innerHTML = weekString; // Add innerHTML

            // Add classes an ids
            listItemContainer.classList.add('dropdownButton');
            listItemContent.classList.add('groupsDropdownButtonTextSections');
            listItemContent.id = `${weekString.split(' ')[0]}_${weekString.split(' ')[1]}`;

            // Append hierarchy
            listItemContainer.appendChild(listItemContent);
            document.getElementById('groupsDropdownForChallenges').appendChild(listItemContainer);

            // Containers for groups and data attr
            const compactChallengesGroupContainer = document.createElement('div');
            compactChallengesGroupContainer.id = `compact_${weekString}`;
            const wideChallengesGroupContainer = document.createElement('div');
            wideChallengesGroupContainer.id = `wide_${weekString}`;

            // TEMPORARY
            if (weekString !== 'Week 1') {
                compactChallengesGroupContainer.style.display = 'none';
                wideChallengesGroupContainer.style.display = 'none';
            };

            // Append group containers to DOM
            document.getElementsByClassName('gridCompact')[0].appendChild(compactChallengesGroupContainer);
            document.getElementsByClassName('gridWide')[0].appendChild(wideChallengesGroupContainer);

            // Build each challenge in group
            for (let challengeData of weekData.challenges) {

                challengesCounter++; // Increment counter

                // Push objectives to challenge
                let objectivesDat = characterRecords[challengeData.hash];
                challengeData.objectives = [];

                // Check if challenge is redacted
                if (challengeData.redacted) {
                    CreateSeasonalChallenge(challengeData, weekString, true);
                    break;
                };
                
                Array.prototype.push.apply(challengeData.objectives, objectivesDat.objectives);

                // Get progress of combined (all) challenge objectives
                let completionValue = 0;
                let progressionValue = 0;

                for (const obj of challengeData.objectives) {
                    completionValue += obj.completionValue;
                    progressionValue += obj.progress;
                };

                // Calculate percentage and change width of bar
                const percent = Math.trunc((progressionValue / completionValue) * 100);

                // Push values to challenge
                challengeData.progressionPercent = percent;
                challengeData.isComplete = false;
                if (percent >= 100) {

                    challengeData.isComplete = true;
                    challengeData.progressionPercent = 100;
                    completeChallengesCounter++; // Increment completed challengers counter

                    // Get claimed state
                    let stateInfo = characterRecords[challengeData.hash];

                    if (stateInfo) {

                        // Get enum val from state enum
                        let state = Boolean(stateInfo.state & 1);

                        challengeData.isClaimed = false;
                        if (state) { // Compare
                            challengeData.isClaimed = true;
                        };
                    };
                };

                // Create challenge
                CreateSeasonalChallenge(challengeData, weekString);
            };
            
        };

        // Push HTML fields for challenges header stats
        document.getElementById('challengesTotalField').innerHTML = `${challengesCounter}`;
        document.getElementById('challengesCompletedField').innerHTML = `${completeChallengesCounter}`;

    };


    // Sort challenges by completion percentage, in ascending order (so the completed ones are at the end)
    // let sortedChallenges = Object.values(allSeasonalChallengesAndTheirDivs).sort((a, b) => a.challenge.completionPercentage - b.challenge.completionPercentage);

    // // Push challenges to UserProfile (global scope usage)
    // UserProfile.AssignProgressions('challenges', sortedChallenges.map(v => v.challenge));

    // // Find out how many "chunks" (pages) we need to display all the challenges
    // let chunkCount = sortedChallenges.length / 6;

    // // If there is a remainder
    // if (chunkCount % 1 !== 0) {

    //     // Add one and truncate number (account for overflow)
    //     chunkCount++;
    //     chunkCount = Math.trunc(chunkCount);
    // };

    // // Seperate and push challenges into chunks of 6
    // let tempChallengesArray = sortedChallenges;
    // for (let i=0; i < chunkCount; i++) { // Loop over chunks

    //     // Create chunk DOM container
    //     let chunkContainer = document.createElement('div');
    //     chunkContainer.className = 'chunkPage';
    //     chunkContainer.id = `challengeChunk${i}`;
    //     chunkContainer.style.display = 'none';

    //     // If first chunk - show
    //     if (i===0) chunkContainer.style.display = 'grid';

    //     /*
    //         Append challenges to chunks in group of 6
    //         Push those chunks to the DOM

    //         Iterate 6 times, appending items each time, checking to see if it exists before appending
    //     */
    //     for (let z=0; z < 6; z++) {
    //         if (tempChallengesArray[z]) {
    //             chunkContainer.appendChild(tempChallengesArray[z].container);
    //         };
    //     };

    //     // Remove first 6 items of array
    //     tempChallengesArray = tempChallengesArray.slice(6);

    //     // Append chunk to the DOM
    //     document.getElementById('seasonalChallengeItems').appendChild(chunkContainer);
    // };

    // [ -- END OF SEASONAL CHALLENGES -- ]



    // [ -- BOUNTIES -- ]
    // Iterate over CharacterInventories[characterId].items
    let charInventory = CharacterInventories[characterId].items;
    let amountOfBounties = 0;

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

    // Add one to make it 1.x
    // let xpModifier = (((seasonPassProgressionStats.bonusXpValue + seasonPassProgressionStats.sharedWisdomBonusValue + ghostModBonusXp) * wellRestedBonus) / 100) + 1;
    let xpModifier = ((seasonPassProgressionStats.bonusXpValue + ghostModBonusXp) / 100) + 1;
    
    // get headroom for well-rested
    let wellRestedLimit = 500_000;
    let wellRestedLeft = 500_000 - (weeklyProgress + totalXpYield);

    // Check for progress
    if (wellRestedLimit > wellRestedLeft) {
        
        // Check if well-rested is active
        if (wellRestedLeft / 2 < 0) {

            log('📚 Well rested expired');
            // do normal modifier
            totalXpYieldWithModifiers = totalXpYield * xpModifier;
        }
        else {

            log('📚 Well rested active');
            // do modifier + plus well-rested remainder
            if (totalXpYield > 0 && wellRestedLeft > totalXpYield) {
                totalXpYieldWithModifiers = (totalXpYield * xpModifier) * 2;
            };
        };
    };

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

        /*
            if the upper limit is being met with the current xp on hand, do else
            if the upper limit is NOT being met, then double xp, within the upper limit
        */

        let wellRestedLimit = (500_000 - weeklyProgress) / 2;

        // check for well rested upper and lower limit
        if (wellRestedLimit >= (totalXpYield * xpModifier) * 2) {
            totalXpYieldWithModifiers = totalXpYieldWithModifiers * 2;
        }
        else {
            totalXpYieldWithModifiers = (totalXpYield * xpModifier) + ((500_000 - weeklyProgress) / 2);
        };


        document.getElementById('wellRestedCheckmarkIcon').src = './static/ico/checkmark.svg';
        document.getElementById('wellRestedCheckmarkIcon').style.filter = filterToMakeCheckmarkGreen;
        AddValueToElementInner('wellRestedBonusField', `+100%`);
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
            document.getElementById('checkboxUseModifiersSlider').style.backgroundColor = accentColor.currentAccentColor; // Change slider color
            return;
        };

        CacheChangeItem('useModifiers', false);
        yieldsData.useModifiers = false;
        document.getElementById('checkboxUseModifiersSlider').style.backgroundColor = '#1b1c1c';
        await AddYieldValues(yieldsData);
    });

    // Check for cache item
    await CacheReturnItem('useModifiers')
    .then((result) => {
        
        // Check of result is true or undefined (hasnt been set yet)
        if (result || result === undefined) {
            CacheChangeItem('useModifiers', true); // Default
            document.getElementById('checkboxUseModifiers').checked = true;
            document.getElementById('checkboxUseModifiersSlider').style.backgroundColor = accentColor.currentAccentColor; // Change slider color
            yieldsData.useModifiers = true;
            return;
        };

        // Else, set to false
        document.getElementById('checkboxUseModifiersSlider').style.backgroundColor = '#1b1c1c'; // Change slider color
        document.getElementById('checkboxUseModifiers').checked = false;
        yieldsData.useModifiers = false;
    })
    .catch((error) => {
        console.error(error);
    });

    /*
        Profile-Wide Checkbox
        1. Changes local storage value
        2. Value is checked on load to see if all characters should be loaded (True) or just the primary one (False)
        i. When value is changed > passive reloading
        ii. The checkbox won't be in the DOM before this scripts is run, but is present (sometime) before it's run
    */

    // Listen for checkbox change
    AddListener('checkboxUseProfileWide', 'change', async function() {

        // if checked
        if (this.checked) {
            CacheChangeItem('useProfileWide', true);
            return;
        };

        // else
        CacheChangeItem('useProfileWide', false);
    });

    // Check for cache item
    let useProfilewide = false;
    await CacheReturnItem('useProfileWide')
    .then((res) => {
        
        // Check if val doesnt exist
        if (!res) {
            CacheChangeItem('useProfileWide', false); // Default
            document.getElementById('checkboxUseProfileWide').checked = false;
            return;
        };

        // else
        useProfilewide = res;
        document.getElementById('checkboxUseProfileWide').checked = res;
    })
    .catch((error) => {
        console.error(error);
    });
    
    // Add metrics to statistics page
    await ParseStatistics();

    // Check if useProfilewide is active
    if (useProfilewide) {
        
        log('🧵 Profile-wide Checked');

        let data = profileWideData.allYieldData;
        // ..
        let totalArtifactPowerBonusXp = yieldsData.artifact.powerBonusProgression.progressToNextLevel + yieldsData.modified;
        let totalArtifactModLevelsXp = yieldsData.artifact.pointProgression.progressToNextLevel + yieldsData.modified;

        AddYieldValues(yieldsData);

        // ..
        // AddValueToElementInner('xpWithModField', InsertSeperators(data.xp));
        // AddValueToElementInner('SeasonPassLevelsWithModField', InsertSeperators((data.xp / 100_000).toFixed(2)));
    
        // // ..
        // AddValueToElementInner('artifactPowerBonusProgressField', InsertSeperators(totalArtifactPowerBonusXp));
        // AddValueToElementInner('artifactPowerBonusCeilingField', InsertSeperators(yieldsData.artifact.powerBonusProgression.nextLevelAt));
    
        // // ..
        // AddValueToElementInner('artifactModLevelsProgressField', InsertSeperators(totalArtifactModLevelsXp));
        // if (yieldsData.artifact.pointProgression.level === yieldsData.artifact.pointProgression.levelCap) {
        //     AddValueToElementInner('artifactModLevelsCeilingField', 'Unlocked All!');
        // }
        // else {
        //     AddValueToElementInner('artifactModLevelsCeilingField', InsertSeperators(yieldsData.artifact.pointProgression.nextLevelAt));
        // };
    }
    else {

        // Check if there are no bounties
        if (amountOfBounties === 0) {

            // No items tooltip
            document.getElementById('noBountiesTooltip').style.display = 'block';

            AddYieldValues(yieldsData);

            // Season pass levels and total XP
            // AddValueToElementInner('xpWithModField', 0);
            // AddValueToElementInner('SeasonPassLevelsWithModField', 0);

            // // Artifact power bonus fraction fields
            // AddValueToElementInner('artifactPowerBonusProgressField', 'no stats');
            // AddValueToElementInner('artifactPowerBonusCeilingField', 0);

            // // Artifact mod levels fraction fields
            // AddValueToElementInner('artifactModLevelsProgressField', 'no stats');
            // AddValueToElementInner('artifactModLevelsCeilingField', 0);

        }
        else if (amountOfBounties > 0) {

            // No items tooltip
            document.getElementById('noBountiesTooltip').style.display = 'none';

            // add yield values
            await AddYieldValues(yieldsData);
        };
    };

    log('-> ParseProgressionalItems Done');
    return returnObj;
};