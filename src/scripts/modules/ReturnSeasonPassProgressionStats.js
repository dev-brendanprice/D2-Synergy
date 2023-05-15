import { itemDefinitions, log } from '../user.js';

// Return season pass progressional statistics
// @object {seasonProgressionInfo}, @object {prestigeInfo}, @object {rewardsTrack}, @object {itemDefinitions}
export async function ReturnSeasonPassProgressionStats(seasonProgressionInfo, prestigeInfo, rewardsTrack) {

    const seasonRank = seasonProgressionInfo.level + prestigeInfo.level;
    
    let returnObject = {},
        earntSeasonPassTrackRewards;

    earntSeasonPassTrackRewards = Object.keys(rewardsTrack);

    if (seasonRank < 100) {

        // returnObject keys when under 100
        returnObject.xpToMaxSeasonPassRank = (seasonProgressionInfo.levelCap - seasonProgressionInfo.level) * 100000 + seasonProgressionInfo.progressToNextLevel;
        returnObject.progressToNextLevel = seasonProgressionInfo.progressToNextLevel;

        // Specify rewards track if under 100
        earntSeasonPassTrackRewards = Object.keys(rewardsTrack).splice(0, seasonRank);

        // Weekly progress
        returnObject.weeklyProgress = seasonProgressionInfo.weeklyProgress;
    }
    else {

        // returnObject keys when over 100
        returnObject.progressToNextLevel = prestigeInfo.progressToNextLevel;
        returnObject.xpToMaxSeasonPassRank = 0;

        // Hide if rank is 100+
        // document.getElementById('seasonPassSecondContainer').style.display = 'none';

        // Weekly progress
        returnObject.weeklyProgress = prestigeInfo.weeklyProgress;
    };


    let fireteamBonusXpPercent = 0, // Shared wisdom
        bonusXpPercent = 0; // Bonus XP (personal)

    // Check unlocked ranks for XP bonuses
    earntSeasonPassTrackRewards.forEach(column => {
        rewardsTrack[column].forEach(itemHash => {

            const itemDisplayProperties = itemDefinitions[itemHash].displayProperties;

            if (itemDisplayProperties.name === 'Small Fireteam XP Boost') {
                fireteamBonusXpPercent = fireteamBonusXpPercent + 2;
            }
            else if (itemDisplayProperties.name === 'Small XP Boost') {
                bonusXpPercent = bonusXpPercent + 2;
            };
        });
    });

    // Push results to return object
    returnObject.sharedWisdomBonusValue = fireteamBonusXpPercent;
    returnObject.bonusXpValue = bonusXpPercent + 12; // You get 12% for owning the season
    returnObject.seasonPassLevel = seasonRank;

    // Return the object
    return returnObject;
};