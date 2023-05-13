import { log } from '../user.js';
import { AddValueToElementInner } from './AddValueToElementInner.js';
import { InsertSeperators } from './InsertSeperators.js';

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


    // ..
    AddValueToElementInner('xpWithModField', InsertSeperators(totalXp));
    AddValueToElementInner('SeasonPassLevelsWithModField', InsertSeperators((totalXp / 100_000).toFixed(2)));

    // ..
    AddValueToElementInner('artifactPowerBonusProgressField', InsertSeperators(totalArtifactPowerBonusXp));
    AddValueToElementInner('artifactPowerBonusCeilingField', InsertSeperators(yieldsData.artifact.powerBonusProgression.nextLevelAt));

    // ..
    AddValueToElementInner('artifactModLevelsProgressField', InsertSeperators(totalArtifactModLevelsXp));
    if (yieldsData.artifact.pointProgression.level === yieldsData.artifact.pointProgression.levelCap) {
        AddValueToElementInner('artifactModLevelsCeilingField', 'Unlocked All!');
    }
    else {
        AddValueToElementInner('artifactModLevelsCeilingField', InsertSeperators(yieldsData.artifact.pointProgression.nextLevelAt));
    };
};

