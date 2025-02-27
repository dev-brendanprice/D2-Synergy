import { CacheReturnItem } from './CacheReturnItem.js';

// Calculate total XP gain from (active) bounties
// @array {bountyArr}, @array {itemTypeKeys}, @object {baseYields}, @object {petraYields}
export async function CalcXpYield(bountyArr, itemTypeKeys, baseYields, petraYields) {

    var totalXP = 0;
    var includeExpiredBounties = await CacheReturnItem('includeExpiredBountiesInTable');

    // Get corresponding xp
    function DiffXP(bounty, bountyType) {
        // console.log(bounty, bountyType);
        // Dreaming city bounties grant half xp
        if (bounty.inventory.stackUniqueLabel.includes('dreaming_city')) {
            totalXP += petraYields[bountyType];
            return;
        };

        // Else do normal calculation
        totalXP += baseYields[bountyType];
        return;
    };

    // Loop through bounty categories
    for (let bountyCtg in bountyArr) {
        
        // Check if category has any bounties
        let group = bountyArr[bountyCtg];
        if (group.length !== 0) {

            // Loop through bounties in category
            group.forEach((bounty) => {

                // Get bounty type
                var bountyType = itemTypeKeys.filter(v => bounty.inventory.stackUniqueLabel.includes(v))[0];

                // Check if bounty is none of the ctgs (daily, weekly, repetable, etc)
                if (bountyType === undefined || bountyType.length === 0) {
                    return;
                };

                // Check if bounty does not conform to required stackUniqueLabel format
                if (bountyType === undefined) {
                    bountyType = itemTypeKeys.filter(v => (bounty.itemTypeAndTierDisplayName).toLowerCase().includes(v));
                };

                // If true
                if (includeExpiredBounties) {
                    DiffXP(bounty, bountyType);
                    return;
                };

                // If false
                if (bounty.isComplete || !bounty.isExpired) {
                    DiffXP(bounty, bountyType);
                    return; 
                };

            });
        };
    };

    // Return total XP
    return totalXP;
};