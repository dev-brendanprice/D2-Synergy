import { AddValueToElementInner } from './AddValueToElementInner.js';
import { InsertSeperators } from './InsertSeperators.js';

// Add yield values to all required fields in the yield section (under character selection)
export async function AddYieldValues (yieldsData) {

    // Check if we should use modifiers
    let gain = yieldsData.base;
    if (yieldsData.useModifiers) {
        gain = yieldsData.modified;
    };

    // Restrict level to one decimal place, without rounding
    let seasonLevels = gain / 100_000;
    if (seasonLevels % 1 !== 0) {
        
        let int = Math.trunc(seasonLevels);
        let decimal = `${seasonLevels}`.split('.')[1].split('')[0];
        seasonLevels = `${int}.${decimal}`;
    };

    // Push values for total XP gain and season pass levels
    AddValueToElementInner('xpWithModField', InsertSeperators(gain));
    AddValueToElementInner('SeasonPassLevelsWithModField', seasonLevels);


    // Get all required values for power bonus
    let pb = yieldsData.artifact.powerBonusProgression;

    // Idek what this math is just dont question it
    let pbCurrentProgressPct = parseInt(((pb.progressToNextLevel / pb.nextLevelAt) * 100).toFixed(0));
    let pbProgressLeft = pb.nextLevelAt - pb.progressToNextLevel;
    let pbProgressLeftPct = 100 - pbCurrentProgressPct;
    let pbYieldProgressPct = parseInt(((parseInt(((gain / pbProgressLeft) * 100).toFixed(0)) / 100) * pbProgressLeftPct).toFixed(0)); // holy jesus


    // Change ratio bar
    document.getElementById('powerBonusProgressBar').style.width = `${pbCurrentProgressPct}%`;
    document.getElementById('powerBonusYieldProgressBar').style.width = `${pbYieldProgressPct}%`;

    if (pbYieldProgressPct) {

        // Ratio bar styles
        document.getElementById('powerBonusProgressBar').style.borderTopRightRadius = '0px';
        document.getElementById('powerBonusProgressBar').style.borderBottomRightRadius = '0px';
        document.getElementById('powerBonusYieldProgressBar').style.borderTopLeftRadius = '0px';
        document.getElementById('powerBonusYieldProgressBar').style.borderBottomLeftRadius = '0px';

        // Ratio bar subtext styles
        document.getElementById('powerBonusYieldProgressPercent').style.display = 'block';
        document.getElementById('powerBonusProgressPercent').style.width = `${pbCurrentProgressPct}%`;
        document.getElementById('powerBonusYieldProgressPercent').style.width = `${pbYieldProgressPct}%`;
        document.getElementById('powerBonusProgressPercent').innerHTML = `${pbCurrentProgressPct}%`;
        document.getElementById('powerBonusYieldProgressPercent').innerHTML = `+${pbYieldProgressPct}%`;
    }
    else {

        // Ratio bar styles
        document.getElementById('powerBonusProgressBar').style.borderTopRightRadius = '5px';
        document.getElementById('powerBonusProgressBar').style.borderBottomRightRadius = '5px';
        document.getElementById('powerBonusYieldProgressBar').style.borderTopLeftRadius = '5px';
        document.getElementById('powerBonusYieldProgressBar').style.borderBottomLeftRadius = '5px';

        // Ratio bar subtext styles
        document.getElementById('powerBonusYieldProgressPercent').style.display = 'none';
    };


    // Get all required values for mod bonus
    let mb = yieldsData.artifact.pointProgression;

    // Idek what this math is just dont question it
    let mbCurrentProgressPct = parseInt(((mb.progressToNextLevel / mb.nextLevelAt) * 100).toFixed(0));
    let mbProgressLeft = mb.nextLevelAt - mb.progressToNextLevel;
    let mbProgressLeftPct = 100 - mbCurrentProgressPct;
    let mbYieldProgressPct = parseInt(((parseInt(((gain / mbProgressLeft) * 100).toFixed(0)) / 100) * mbProgressLeftPct).toFixed(0)); // holy jesus

    // Change ratio bar
    document.getElementById('modLevelProgressBar').style.width = `${mbCurrentProgressPct}%`;
    document.getElementById('modLevelYieldProgressBar').style.width = `${mbYieldProgressPct}%`;

    if (mbYieldProgressPct) {

        // Ratio bar styles
        document.getElementById('modLevelProgressBar').style.borderTopRightRadius = '0px';
        document.getElementById('modLevelProgressBar').style.borderBottomRightRadius = '0px';
        document.getElementById('modLevelYieldProgressBar').style.borderTopLeftRadius = '0px';
        document.getElementById('modLevelYieldProgressBar').style.borderBottomLeftRadius = '0px';

        // Ratio bar subtext styles
        document.getElementById('modLevelYieldProgressPercent').style.display = 'block';
        document.getElementById('modLevelProgressPercent').style.width = `${mbCurrentProgressPct}%`;
        document.getElementById('modLevelYieldProgressPercent').style.width = `${mbYieldProgressPct}%`;
        document.getElementById('modLevelProgressPercent').innerHTML = `${mbCurrentProgressPct}%`;
        document.getElementById('modLevelYieldProgressPercent').innerHTML = `+${mbYieldProgressPct}%`;
    }
    else {

        // Ratio bar styles
        document.getElementById('modLevelProgressBar').style.borderTopRightRadius = '5px';
        document.getElementById('modLevelProgressBar').style.borderBottomRightRadius = '5px';
        document.getElementById('modLevelYieldProgressBar').style.borderTopLeftRadius = '5px';
        document.getElementById('modLevelYieldProgressBar').style.borderBottomLeftRadius = '5px';

        // Ratio bar subtext styles
        document.getElementById('modLevelYieldProgressPercent').style.display = 'none';
    };

    // Check for mod level cap
    if (yieldsData.artifact.pointProgression.level === yieldsData.artifact.pointProgression.levelCap) {
        document.getElementById('modLevelYieldProgressPercent').style.display = 'none';
        document.getElementById('modLevelProgressPercent').innerHTML = 'All mods unlocked!';
    };
};

// OLD FUNCTION
// export async function AddYieldValues (yieldsData) {
    
//     // default to use modifiers
//     let totalXp = yieldsData.modified;
//     let totalArtifactPowerBonusXp = yieldsData.artifact.powerBonusProgression.progressToNextLevel + yieldsData.modified;
//     let totalArtifactModLevelsXp = yieldsData.artifact.pointProgression.progressToNextLevel + yieldsData.modified;

//     // check if we are using modifiers
//     if (!yieldsData.useModifiers) {
//         totalXp = yieldsData.base;
//         totalArtifactPowerBonusXp = yieldsData.artifact.powerBonusProgression.progressToNextLevel + yieldsData.base;
//         totalArtifactModLevelsXp = yieldsData.artifact.pointProgression.progressToNextLevel + yieldsData.base;
//     };


//     // Overall XP and season pass level
//     AddValueToElementInner('xpWithModField', InsertSeperators(totalXp));
//     AddValueToElementInner('SeasonPassLevelsWithModField', InsertSeperators((totalXp / 100_000).toFixed(2)));


//     // Artifact-related levels
//     // Get main percentages
//     let powerBonusProgress = ((totalArtifactPowerBonusXp / yieldsData.artifact.powerBonusProgression.nextLevelAt) * 100).toFixed(0);
//     let modBonusProgress = ((totalArtifactModLevelsXp / yieldsData.artifact.pointProgression.nextLevelAt) * 100).toFixed(0);

//     // Check for power bonus overflow
//     if (powerBonusProgress > 100) {

//         // Find percentage overflows
//         let powerBonusOverflow = powerBonusProgress / 100;
//         let overflowPercentage = parseInt(powerBonusOverflow.toString().split('.')[1]);
//         let overflowLevels = parseInt(powerBonusOverflow.toString().split('.')[0]);

//         // Change dom content
//         ChangeProgressBar('powerBonusProgressBar', overflowPercentage);
//         AddValueToElementInner('powerBonusProgressPercent', `${overflowPercentage}% + ${overflowLevels}lvls`);
//     }
//     else {

//         // Change dom content
//         ChangeProgressBar('powerBonusProgressBar', powerBonusProgress);
//         AddValueToElementInner('powerBonusProgressPercent', `${powerBonusProgress}%`);
//     };

//     // Check for max level cap on mod bonus
//     if (yieldsData.artifact.pointProgression.level !== yieldsData.artifact.pointProgression.levelCap) {

//         // Check mod bonus overflow
//         if (modBonusProgress > 100) {

//             // Find percentage overflows
//             let modBonusOverflow = modBonusProgress / 100;
//             let overflowPercentage = parseInt(modBonusOverflow.toString().split('.')[1]);
//             let overflowLevels = parseInt(modBonusOverflow.toString().split('.')[0]);

//             // Change dom content
//             ChangeProgressBar('modLevelProgressBar', overflowPercentage);
//             AddValueToElementInner('modLevelProgressPercent', `${overflowPercentage}% + ${overflowLevels}lvls`);
//         }
//         else {

//             // Change dom content
//             ChangeProgressBar('modLevelProgressBar', modBonusProgress);
//             AddValueToElementInner('modLevelProgressPercent', `${modBonusProgress}%`);
//         };
//     }
//     else {

//         // Else, say all mods unlocked
//         document.getElementById('modLevelProgressPercent').innerHTML = 'Unlocked all Mods!';
//     };

//     // AddValueToElementInner('artifactModLevelsProgressField', InsertSeperators(totalArtifactModLevelsXp));
//     // if (yieldsData.artifact.pointProgression.level === yieldsData.artifact.pointProgression.levelCap) {
//     //     AddValueToElementInner('artifactModLevelsCeilingField', 'Unlocked All!');
//     // }
//     // else {
//     //     AddValueToElementInner('artifactModLevelsCeilingField', InsertSeperators(yieldsData.artifact.pointProgression.nextLevelAt));
//     // };
// };