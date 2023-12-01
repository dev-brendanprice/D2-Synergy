import { AddValueToElementInner } from './AddValueToElementInner.js';
import { InsertSeperators } from './InsertSeperators.js';
const log = console.log.bind(console);

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

    // Calculate percentages
    let pbProgress = parseInt(pb.progressToNextLevel / pb.nextLevelAt * 100).toFixed(0);
    let pbYieldProgress = parseInt(gain / pb.nextLevelAt * 100).toFixed(0);

    // Cap value and store any overhead
    if (pbYieldProgress > 100 - pbProgress) {
        pbYieldProgress = 100 - pbProgress; // Cap value
    };

    
    // Change ratio bar
    document.getElementById('powerBonusProgressBar').style.width = `${pbProgress}%`;
    document.getElementById('powerBonusYieldProgressBar').style.width = `${pbYieldProgress}%`;

    if (pbYieldProgress) {

        // Ratio bar styles
        document.getElementById('powerBonusProgressBar').style.borderTopRightRadius = '0px';
        document.getElementById('powerBonusProgressBar').style.borderBottomRightRadius = '0px';
        document.getElementById('powerBonusYieldProgressBar').style.borderTopLeftRadius = '0px';
        document.getElementById('powerBonusYieldProgressBar').style.borderBottomLeftRadius = '0px';

        // Ratio bar subtext styles
        document.getElementById('powerBonusYieldProgressPercent').style.display = 'block';
        document.getElementById('powerBonusProgressPercent').style.width = `${pbProgress}%`;
        document.getElementById('powerBonusYieldProgressPercent').style.width = `${pbYieldProgress}%`;
        document.getElementById('powerBonusProgressPercent').innerHTML = `${pbProgress}%`;
        document.getElementById('powerBonusYieldProgressPercent').innerHTML = `+${pbYieldProgress}%`;
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

    // Calculate percentages
    let mbProgress = parseInt(mb.progressToNextLevel / mb.nextLevelAt * 100).toFixed(0);
    let mbYieldProgress = parseInt(gain / mb.nextLevelAt * 100).toFixed(0);

    // Cap value and store any overhead
    let overheadxp = 0;
    if (mbYieldProgress > 100 - mbProgress) {

        let xpLeft = mb.nextLevelAt - mb.progressToNextLevel;
        overheadxp = gain - xpLeft; // Store overhead
        mbYieldProgress = 100 - mbProgress; // Cap value
    };

    // Use overheadxp to calculate how many levels are earned, past the current one
    log(overheadxp);


    // Change ratio bar
    document.getElementById('modLevelProgressBar').style.width = `${mbProgress}%`;
    document.getElementById('modLevelYieldProgressBar').style.width = `${mbYieldProgress}%`;

    if (mbYieldProgress) {

        // Ratio bar styles
        document.getElementById('modLevelProgressBar').style.borderTopRightRadius = '0px';
        document.getElementById('modLevelProgressBar').style.borderBottomRightRadius = '0px';
        document.getElementById('modLevelYieldProgressBar').style.borderTopLeftRadius = '0px';
        document.getElementById('modLevelYieldProgressBar').style.borderBottomLeftRadius = '0px';

        // Ratio bar subtext styles
        document.getElementById('modLevelYieldProgressPercent').style.display = 'block';
        document.getElementById('modLevelProgressPercent').style.width = `${mbProgress}%`;
        document.getElementById('modLevelYieldProgressPercent').style.width = `${mbYieldProgress}%`;
        document.getElementById('modLevelProgressPercent').innerHTML = `${mbProgress}%`;
        document.getElementById('modLevelYieldProgressPercent').innerHTML = `+${mbYieldProgress}%`;
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