import { log } from '../user.js';
import { AddValueToElementInner } from './AddValueToElementInner.js';
import { InsertSeperators } from './InsertSeperators.js';
import { ChangeProgressBar } from './ChangeProgressBar.js';

export async function AddYieldValues (yieldsData) {
    
    // default to use modifiers
    let totalXp = yieldsData.modified;
    let totalArtifactPowerBonusXp = yieldsData.artifact.powerBonusProgression.progressToNextLevel + yieldsData.modified;
    let totalArtifactModLevelsXp = yieldsData.artifact.pointProgression.progressToNextLevel + yieldsData.modified;

    // check if we are using modifiers
    if (!yieldsData.useModifiers) {
        totalXp = yieldsData.base;
        totalArtifactPowerBonusXp = yieldsData.artifact.powerBonusProgression.progressToNextLevel + yieldsData.base;
        totalArtifactModLevelsXp = yieldsData.artifact.pointProgression.progressToNextLevel + yieldsData.base;
    };


    // Overall XP and season pass level
    AddValueToElementInner('xpWithModField', InsertSeperators(totalXp));
    AddValueToElementInner('SeasonPassLevelsWithModField', InsertSeperators((totalXp / 100_000).toFixed(2)));


    // Artifact-related levels
    // Get main percentages
    let powerBonusProgress = ((totalArtifactPowerBonusXp / yieldsData.artifact.powerBonusProgression.nextLevelAt) * 100).toFixed(0);
    let modBonusProgress = ((totalArtifactModLevelsXp / yieldsData.artifact.pointProgression.nextLevelAt) * 100).toFixed(0);

    // Check for power bonus overflow
    if (powerBonusProgress > 100) {

        // Find percentage overflows
        let powerBonusOverflow = powerBonusProgress / 100;
        let overflowPercentage = parseInt(powerBonusOverflow.toString().split('.')[1]);
        let overflowLevels = parseInt(powerBonusOverflow.toString().split('.')[0]);

        // Change dom content
        ChangeProgressBar('powerBonusProgressBar', overflowPercentage);
        AddValueToElementInner('powerBonusProgressPercent', `${overflowPercentage}% + ${overflowLevels}lvls`);
    }
    else {

        // Change dom content
        ChangeProgressBar('powerBonusProgressBar', powerBonusProgress);
        AddValueToElementInner('powerBonusProgressPercent', `${powerBonusProgress}%`);
    };

    // Check for max level cap on mod bonus
    if (yieldsData.artifact.pointProgression.level !== yieldsData.artifact.pointProgression.levelCap) {

        // Check mod bonus overflow
        if (modBonusProgress > 100) {

            // Find percentage overflows
            let modBonusOverflow = modBonusProgress / 100;
            let overflowPercentage = parseInt(modBonusOverflow.toString().split('.')[1]);
            let overflowLevels = parseInt(modBonusOverflow.toString().split('.')[0]);

            // Change dom content
            ChangeProgressBar('modLevelProgressBar', overflowPercentage);
            AddValueToElementInner('modLevelProgressPercent', `${overflowPercentage}% + ${overflowLevels}lvls`);
        }
        else {

            // Change dom content
            ChangeProgressBar('modLevelProgressBar', modBonusProgress);
            AddValueToElementInner('modLevelProgressPercent', `${modBonusProgress}%`);
        };
    }
    else {

        // Else, say all mods unlocked
        document.getElementById('modLevelProgressPercent').innerHTML = 'Unlocked all Mods!';
    };

    // AddValueToElementInner('artifactModLevelsProgressField', InsertSeperators(totalArtifactModLevelsXp));
    // if (yieldsData.artifact.pointProgression.level === yieldsData.artifact.pointProgression.levelCap) {
    //     AddValueToElementInner('artifactModLevelsCeilingField', 'Unlocked All!');
    // }
    // else {
    //     AddValueToElementInner('artifactModLevelsCeilingField', InsertSeperators(yieldsData.artifact.pointProgression.nextLevelAt));
    // };
};

