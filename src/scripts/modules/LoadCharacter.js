import { 
    itemDefinitions,
    seasonDefinitions,
    seasonPassDefinitions,
    progressionDefinitions,
    UserXpModifiers,
    UserProfile, log } from '../user.js';
import { ParseProgressionalItems } from './ParseProgressItems.js';
import { ReturnSeasonPassLevel } from './ReturnSeasonPassLevel.js';
import { ParseProgressionalRelations } from './ParseProgressRelations.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { StopLoad } from './StopLoad.js';
import { ParseClass } from './ParseClass.js';
import { ParseRace } from './ParseRace.js';
import { MakeCharacterSelect } from './MakeCharacterSelect.js';
import { FetchUserTransistory } from './FetchUserTransistory.js';
import { GetSeasonPassRewardsStructure } from './GetSeasonPassRewardsStructure.js';
import { relationsTable } from './relationsTable.js';
import { ReturnSeasonPassLevelProgress } from './ReturnSeasonPassLevelProgress.js';
import { artifactSteps } from './SynergyDefinitions.js';
import { CacheReturnItem } from './CacheReturnItem.js';

let characterLoadToggled = false; // Used to lockout character select during a load
let characterRecords;

// Profile data
export let seasonPassLevel = 0;
export let seasonalArtifactInfo = {};
export let pastSeasonLevels;
export let pastSeasonPowerBonuses = [];
export let pastTotalXpValues = [];
export let totalSeasonXpEarnt = 0;
export let lifetimeXpEarnt = 0;
let seasonPassInfo = {};
let prestigeProgressionSeasonInfo;
let seasonProgressionInfo = {};
let seasonInfo = {};


// Load character from specific index
// @string {characterId}, @obj {characters}, @boolean {isFirstTimeLoad}
export async function LoadCharacter(characterId, characters, isFirstTimeLoad = true) {

    if (!characterLoadToggled) {

        // Toggle character load
        characterLoadToggled = true;

        log('-> LoadCharacter Called');

        // Highlight selected character, in the character selection menu
        let charactersFromDom = document.getElementsByClassName('characterSelect');
        for (let element of charactersFromDom) {

            let charId = element.getAttribute('data-character-id');
            if (charId === characterId) {
                element.style.border = '1px solid #ffea9f';
            }
            else {
                element.style.border = '1px solid transparent';
            };
        };

        // Change notification label content
        document.getElementById('notificationTitle').innerHTML = 'Loading User Data';
        document.getElementById('notificationMessage').innerHTML = 'Parsing user data..';

        // Globals in this scope
        let CharacterProgressions,
            CharacterInventories,
            CharacterObjectives,
            CharacterEquipment,
            primaryCharacter,
            ItemSockets;


        // Clear (emtpy fields that are going to change) DOM content
        document.getElementById('seasonalChallengeItems').innerHTML = '';
        document.getElementById('overlays').innerHTML = '';

        // Get chosen character via characterId
        for (let v in characters) {

            let char = characters[v];
            if (char.characterId === characterId) {
                primaryCharacter = char;
            };
        };

        // Save character to localStorage
        CacheChangeItem('currentChar', primaryCharacter);

        // Check if first time load (build character selects if so etc)
        if (isFirstTimeLoad) {

            // Clear character selects
            document.getElementById('defaultCharacterSelect').innerHTML = '';

            // Add characters to DOM
            for (let i=0; i<Object.keys(characters).length; i++) {
                
                let characterId = Object.keys(characters)[i];
                let character = characters[characterId];

                let characterInfo = {};
                characterInfo.emblemIco = itemDefinitions[character.emblemHash].secondaryOverlay;
                characterInfo.characterClass = ParseClass(character.classType);
                characterInfo.characterRace = ParseRace(character.raceType);
                characterInfo.characterPower = character.light;
                characterInfo.characterId = character.characterId;

                MakeCharacterSelect(characterInfo);
            };
        };

        // Get character-specific data from destinyUserProfile cache
        CharacterProgressions = UserProfile.destinyUserProfile.characterProgressions.data[characterId].progressions;
        CharacterEquipment = UserProfile.destinyUserProfile.characterEquipment.data[characterId].items;
        CharacterObjectives = UserProfile.destinyUserProfile.itemComponents.objectives.data;
        CharacterInventories = UserProfile.destinyUserProfile.characterInventories.data;
        characterRecords = UserProfile.destinyUserProfile.characterRecords.data[characterId].records;
        ItemSockets = UserProfile.destinyUserProfile.itemComponents.sockets.data;

        // Ghost experience mod bonus
        let ghostModBonusXp = 0;

        // Fetch equipped ghost mods
        CharacterEquipment.forEach(v => {
            if (v.bucketHash === 4023194814) { // Ghost bucket hash

                let itemPlugSet = ItemSockets[v.itemInstanceId].sockets;
                Object.keys(itemPlugSet).forEach(v => {

                    let plugHash = itemPlugSet[v].plugHash;
                    if (plugHash === 1820053069) { // Flickering Light - 2%
                        ghostModBonusXp = 2;
                    }
                    else if (plugHash === 1820053068) { // Little Light - 3%
                        ghostModBonusXp = 3;
                    }
                    else if (plugHash === 1820053071) { // Hopeful Light - 5%
                        ghostModBonusXp = 5;
                    }
                    else if (plugHash === 1820053070) { // Burning Light - 8%
                        ghostModBonusXp = 8;
                    }
                    else if (plugHash === 1820053065) { // Guiding Light - 10%
                        ghostModBonusXp = 10;
                    }
                    else if (plugHash === 1820053064) { // Blinding Light - 12%
                        ghostModBonusXp = 12;
                    };
                });
            };
        });

        // Loop over season from definitions to get the highest statistics across all seasons
        pastSeasonLevels = [];
        for (let hash in seasonDefinitions) {

            // Check if season >= season 8
            if (seasonDefinitions[hash].seasonNumber >= 8) {

                let season = seasonDefinitions[hash];

                // Get season pass hash
                let seasonPassHash = season.seasonPassHash;
                let seasonPass = seasonPassDefinitions[seasonPassHash];

                // Get season pass normal and prestige progression hash
                let seasonPassProgressionHash = season.seasonPassProgressionHash;
                let seasonPassProgressionPrestigeHash = seasonPass.prestigeProgressionHash;

                // Get info from each progression
                let seasonProgression = CharacterProgressions[seasonPassProgressionHash];
                let seasonProgressionPrestige = CharacterProgressions[seasonPassProgressionPrestigeHash];

                // Push season level to array
                let seasonPassLevel = await ReturnSeasonPassLevel(seasonProgression, seasonProgressionPrestige);
                pastSeasonLevels.push(seasonPassLevel);

                // Get season progress - next level and cap
                let seasonProgress = await ReturnSeasonPassLevelProgress(seasonProgression, seasonProgressionPrestige);
                let seasonTotalXp;
                if (seasonProgress.progress !== 0) {
                    seasonTotalXp = (seasonPassLevel * 100_000) + seasonProgress.progress;
                };
                pastTotalXpValues.push(`${seasonTotalXp}`);

                // Get (Estimate) artifact level
                let powerBonus = 0;
                for (let i=0; i<artifactSteps.length; i++) {

                    // Take current artifact level step off total xp to get progress
                    seasonTotalXp = seasonTotalXp - artifactSteps[i];

                    // If step is higher than progress and progress !negative
                    if (artifactSteps[i] >= seasonTotalXp && seasonTotalXp > 0) {
                        powerBonus = i;
                    };
                };
                pastSeasonPowerBonuses.push(powerBonus);

            };
            
            // Check if hash is the current season
            if (hash == UserProfile.currentSeasonHash) {

                // Pull info from the current season
                seasonProgressionInfo = CharacterProgressions[seasonDefinitions[hash].seasonPassProgressionHash];
                seasonPassInfo = seasonPassDefinitions[seasonDefinitions[hash].seasonPassHash];
                prestigeProgressionSeasonInfo = CharacterProgressions[seasonPassInfo.prestigeProgressionHash];
                seasonPassLevel = await ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo);
                seasonalArtifactInfo = itemDefinitions[seasonDefinitions[hash].artifactItemHash];
                seasonalArtifactInfo.powerBonusProgression = progressionDefinitions[1656313730]; // hash is for XP
                seasonInfo = seasonDefinitions[hash];

                let seasonProgress = await ReturnSeasonPassLevelProgress(seasonProgressionInfo, prestigeProgressionSeasonInfo);
                totalSeasonXpEarnt = (seasonPassLevel * 100_000) + seasonProgress.progress;
            };
        };

        // Store season start date
        seasonProgressionInfo.startDate = seasonInfo.startDate;

        // Sort levels in descending order to get highest season pass level
        pastSeasonLevels = pastSeasonLevels.sort((a,b) => b-a);
        pastSeasonPowerBonuses = pastSeasonPowerBonuses.sort((a,b) => b-a);

        // Remove undefined values and sort in descending order
        pastTotalXpValues = pastTotalXpValues.filter((val) => { return val !== 'undefined'; });
        pastTotalXpValues = pastTotalXpValues.sort((a,b) => b-a);

        // Find lifetime XP earnt
        let seasonProgress = await ReturnSeasonPassLevelProgress(seasonProgressionInfo, prestigeProgressionSeasonInfo);
        let totalSeasonRanks = pastSeasonLevels.reduce((step, a) => step + a, 0);
        lifetimeXpEarnt = (totalSeasonRanks * 100_000) + seasonProgress.progress;
        
        // Re-structure season pass rewards into a cleaner array structure
        let seasonPassRewardsTrack = progressionDefinitions[seasonPassInfo.rewardProgressionHash].rewardItems;
        let rewardsTrack = {};

        // Loop over season pass rewards
        seasonPassRewardsTrack.forEach(v => {

            if (!rewardsTrack[v.rewardedAtProgressionLevel]) {
                rewardsTrack[v.rewardedAtProgressionLevel] = [];
            };
            rewardsTrack[v.rewardedAtProgressionLevel].push(v.itemHash);
        });

        // Get season pass rewards structure (rewards and their corresponding ranks)
        GetSeasonPassRewardsStructure(rewardsTrack);
        
        // Get shared wisdom value (if any) from transistory data
        await FetchUserTransistory();

        // Get progressional items
        var progressionalItemsObj = await ParseProgressionalItems(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp, seasonalArtifactInfo);

        // Get relations for progressional items
        var relations = await ParseProgressionalRelations(progressionalItemsObj);

        // Populate relations objects in global relationsTable object
        relationsTable.relations.bounties = relations.bounties;
        relationsTable.relations.challenges = relations.challenges;
        relationsTable.relations.all = relations.all;
        relationsTable.relations.averageRelationCount = relations.averageRelationCount;

        // Declare table div then build the table
        relationsTable.div = document.getElementById('relationsTable');
        relationsTable.BuildTable();

        // Stop loading sequence
        CacheChangeItem('lastChar', characterId);
        characterLoadToggled = false;
        StopLoad();
    };
    log('-> LoadCharacter Done');
};