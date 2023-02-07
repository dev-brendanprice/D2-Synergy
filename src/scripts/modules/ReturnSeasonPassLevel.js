
// Return season pass level, even when prestige level
// @object {seasonProgressionInfo}, @object {prestigeProgressionSeasonInfo}
export async function ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo) {

    let levelToReturn = 0;
    levelToReturn += seasonProgressionInfo.level;

    // If the season pass level is more than 100
    if (prestigeProgressionSeasonInfo.level !== 0) {
        levelToReturn += prestigeProgressionSeasonInfo.level;
    };
    return levelToReturn;
};