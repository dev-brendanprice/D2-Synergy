import { UserProfile, seasonDefinitions, UserProfileProgressions } from '../user.js';
import { seasonPassLevel, pastSeasonLevels, seasonalArtifactInfo, pastSeasonPowerBonuses, pastTotalXpValues, totalSeasonXpEarnt, lifetimeXpEarnt } from './LoadCharacter.js';
import { seasonPassProgressionStats } from './ParseProgressItems.js';
import { InsertSeperators } from './InsertSeperators.js';

export async function ParseStatistics () {

    // ..
    let currentSeason = seasonDefinitions[UserProfile.currentSeasonHash];
    let artifact = UserProfileProgressions.ProfileProgressions.seasonalArtifact;

    // season number and name
    document.getElementById('seasonNumberMetric').innerHTML = `Season ${currentSeason.seasonNumber}`;
    document.getElementById('seasonNameMetric').innerHTML = currentSeason.displayProperties.name;

    // rank, rank prg, highest rank
    document.getElementById('seasonRankMetric').innerHTML = seasonPassLevel;
    document.getElementById('seasonPassRankProgressMetric').innerHTML = InsertSeperators(seasonPassProgressionStats.progressToNextLevel);
    document.getElementById('highestSeasonPassRankMetric').innerHTML = pastSeasonLevels[0];
    if (seasonPassLevel >= 100) {
        document.getElementById('seasonRankBackplate').src = './static/images/UI/season_rank_prestige_backplate.svg';
    };

    // name, bonus, mods, highest bonus
    document.getElementById('seasonArtifactNameMetric').innerHTML = seasonalArtifactInfo.displayProperties.name;
    document.getElementById('artifactBonusMetric').innerHTML = `+${artifact.powerBonus}`;
    document.getElementById('artifactPowerBonusProgressMetric').innerHTML = InsertSeperators(artifact.powerBonusProgression.progressToNextLevel);
    document.getElementById('artifactPowerBonusCeilingMetric').innerHTML = `/${InsertSeperators(artifact.powerBonusProgression.nextLevelAt)}`;
    document.getElementById('artifactModUnlocksMetric').innerHTML = artifact.pointProgression.level;
    document.getElementById('artifactModUnlocksCeilingMetric').innerHTML = `/${artifact.pointProgression.levelCap}`;
    document.getElementById('artifactModUnlockProgressMetric').innerHTML = InsertSeperators(artifact.pointProgression.progressToNextLevel);
    document.getElementById('artifactModUnlockProgressCeilingMetric').innerHTML = `/${InsertSeperators(artifact.pointProgression.nextLevelAt)}`;
    document.getElementById('highestPowerBonusMetric').innerHTML = pastSeasonPowerBonuses[0];
    if (artifact.powerBonus >= 20) {
        document.getElementById('artifactBonusBackplate').src = './static/images/UI/season_rank_prestige_backplate.svg';
    };
    if (artifact.pointProgression.progressToNextLevel===0 && artifact.pointProgression.nextLevelAt===0) {
        document.getElementById('perkProgressTextContainer').style.display = 'none';
        document.getElementById('allModSlotsUnlockedTextContainer').style.display = 'block';
    }
    else {
        document.getElementById('allModSlotsUnlockedTextContainer').style.display = 'none';
        document.getElementById('perkProgressTextContainer').style.display = 'block';
    };

    // .. bright engrams


    // current season xp progress, highest xp progress
    document.getElementById('seasonProgressXpMetric').innerHTML = `${InsertSeperators(totalSeasonXpEarnt)}`;
    document.getElementById('highestSeasonProgressXpMetric').innerHTML = `${InsertSeperators(pastTotalXpValues[0])}`;
    document.getElementById('lifetimeProgressXpMetric').innerHTML = `${InsertSeperators(lifetimeXpEarnt)}`;

};