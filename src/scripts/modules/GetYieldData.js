import { vendorKeys, itemTypeKeys, baseYields, petraYields } from './SynergyDefinitions.js'
import {
    itemDefinitions,
    objectiveDefinitions,
    profileWideData,
    UserProfileProgressions, log } from '../user.js';
import { ReturnSeasonPassProgressionStats } from './ReturnSeasonPassProgressionStats.js';
import { ParseBounties } from './ParseBounties.js';
import { CalcXpYield } from './CalcXpYield.js';
import { SortByGroup } from './SortByGroup.js';
import { SortByType } from './SortByType.js';
import { SortBountiesByType } from './SortBountiesByType.js';

export let seasonPassProgressionStats = {};


// Function to fetch all progressional items
export async function GetYieldData(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp, seasonalArtifactInfo) {

    // Call function to get progressions for season pass XP and bonus stats
    seasonPassProgressionStats = await ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack);
    const artifact = UserProfileProgressions.ProfileProgressions.seasonalArtifact;
    log(artifact);

    // Iterate over CharacterInventories[characterId].items
    let charInventory = CharacterInventories[characterId].items;
    let amountOfBounties = 0;

    // Loop over inventory items and emit bounties
    let parsedBountiesResponse = ParseBounties(charInventory, CharacterObjectives, itemDefinitions, objectiveDefinitions);
    let characterBounties = parsedBountiesResponse.charBounties;
    amountOfBounties = parsedBountiesResponse.amountOfBounties;

    // Make array with specified groups
    let bountyArr = {};
    vendorKeys.forEach(key => {
        bountyArr[key] = [];
    });

    // Sort bounties by group (vanguard, gunsmith etc)
    bountyArr = SortByGroup(characterBounties, bountyArr, vendorKeys);

    // Sort bounties by type (weekly, daily etc)
    bountyArr = SortByType(bountyArr, SortBountiesByType);

    // Calculate XP yield from (active) bounties
    let totalXpYield = 0;
    let totalXpYieldWithModifiers = 0;
    totalXpYield = await CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields);

    // Format decimal to 1.x
    let xpModifier = ((seasonPassProgressionStats.bonusXpValue + ghostModBonusXp) / 100) + 1;

    // Get weekly progress -- If player is >= level 100 then it means they have "prestiged"
    let weeklyProgress;
    if (seasonPassProgressionStats.seasonPassLevel >= 100) {
        weeklyProgress = prestigeProgressionSeasonInfo.weeklyProgress;
    }
    else {
        weeklyProgress = seasonProgressionInfo.weeklyProgress;
    };
    
    // Get headroom for well-rested
    let wellRestedLimit = 500_000;
    let wellRestedLeft = 500_000 - (weeklyProgress + totalXpYield);

    // Check for progress
    if (wellRestedLimit > wellRestedLeft) {
        
        // Check if well-rested is active
        if (wellRestedLeft / 2 < 0) {

            log('🧵📚 Well rested expired');
            // do normal modifier
            totalXpYieldWithModifiers = totalXpYield * xpModifier;
        }
        else {

            log('🧵📚 Well rested active');
            // do modifier + plus well-rested remainder
            if (totalXpYield > 0 && wellRestedLeft > totalXpYield) {
                totalXpYieldWithModifiers = (totalXpYield * xpModifier) * 2;
            };
        };
    };

    // Truncate the result
    // totalXpYieldWithModifiers = Math.trunc(totalXpYieldWithModifiers);


    // Use modifiers toggle
    // let yieldsData = {
    //     artifact: artifact,
    //     base: totalXpYield,
    //     modified: totalXpYieldWithModifiers,
    //     useModifiers: null // Default
    // };

    if (!profileWideData.storedChars.includes(characterId)) {

        profileWideData.AddStoredChar(characterId);

        profileWideData.AddYieldData('artifact', artifact);
        profileWideData.AddYieldData('xp', totalXpYield);
        profileWideData.AddYieldData('seasonPassLevels', totalXpYield / 100_000);
    };

    log('🧵 GetYieldData Done');
};