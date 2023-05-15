
// Return level progress and details from a season
// @object {seasonProgressionInfo}, @object {prestigeProgressionSeasonInfo}
export async function ReturnSeasonPassLevelProgress(seasonProgressionInfo, prestigeProgressionSeasonInfo) {

    // Obj to return
    let seasonProgress = {
        progress: 0,
        cap: 0
    };

    // no prestige
    seasonProgress.progress = seasonProgressionInfo.progressToNextLevel;
    seasonProgress.cap = seasonProgressionInfo.nextLevelAt;

    // if prestige
    if (prestigeProgressionSeasonInfo.level !== 0) {
        seasonProgress.progress = prestigeProgressionSeasonInfo.progressToNextLevel;
        seasonProgress.cap = prestigeProgressionSeasonInfo.nextLevelAt;
    };

    return seasonProgress;
};