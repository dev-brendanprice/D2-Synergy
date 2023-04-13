import { 
    itemDefinitions,
    seasonDefinitions,
    seasonPassDefinitions,
    progressionDefinitions,
    progressionPropertyKeyValues,
    relationsTable, 
    UserProfile,
    UserProfileProgressions, log } from '../user.js';
import { ParseProgressionalItems } from './ParseProgressItems.js';
import { ReturnSeasonPassLevel } from './ReturnSeasonPassLevel.js';
import { ParseProgressionalRelations } from './ParseProgressRelations.js';
import { ParsePropertyNameIntoWord } from './ParsePropertyNameIntoWord.js';
import { AddValueToElementInner } from './AddValueToElementInner.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { AddTableRow } from './AddTableRow.js';
import { InsertSeperators } from './InsertSeperators.js';
import { StopLoad } from './StopLoad.js';
import { ParseClass } from './ParseClass.js';
import { ParseRace } from './ParseRace.js';
import { MakeCharacterSelect } from './MakeCharacterSelect.js';

var characterLoadToggled = false, // Used to lockout character select during a load
    characterRecords;

// Profile data
var seasonPassInfo = {},
    seasonPassLevel = 0,
    prestigeProgressionSeasonInfo,
    seasonProgressionInfo = {},
    seasonalArtifactInfo = {},
    seasonInfo = {};


// Load character from specific index
// @int {characterId}, @obj {characters}, @boolean {isFirstTimeLoad}
export async function LoadCharacter(characterId, characters, isFirstTimeLoad = true) {

    if (!characterLoadToggled) {

        log('-> LoadCharacter Called');

        // Change notification label content
        document.getElementById('notificationTitle').innerHTML = 'Loading User Data';
        document.getElementById('notificationMessage').innerHTML = 'Parsing user data..';

        // Toggle character load
        characterLoadToggled = true;

        // Globals in this scope
        let CharacterProgressions,
            CharacterInventories,
            CharacterObjectives,
            CharacterEquipment,
            primaryCharacter,
            ItemSockets;


        // Clear (emtpy fields that are going to change) DOM content
        document.getElementById('bountyItems').innerHTML = '';
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

            // Make characterInfo object
            let characterInfo = {};
            characterInfo.emblemIco = itemDefinitions[primaryCharacter.emblemHash].secondaryOverlay;
            characterInfo.characterClass = ParseClass(primaryCharacter.classType);
            characterInfo.characterRace = ParseRace(primaryCharacter.raceType);
            characterInfo.characterPower = primaryCharacter.light;
            characterInfo.characterId = primaryCharacter.characterId;

            // Add main character to DOM
            MakeCharacterSelect(characterInfo);

            // Filter out character that is the main one
            let otherCharacters = Object.keys(characters).filter(v => v!==characterId);

            // Add other characters to DOM
            for (let id of otherCharacters) {

                // Make characterInfo obj for each character
                let character = characters[id];
                let characterInfo = {};
                characterInfo.emblemIco = itemDefinitions[character.emblemHash].secondaryOverlay;
                characterInfo.characterClass = ParseClass(character.classType);
                characterInfo.characterRace = ParseRace(character.raceType);
                characterInfo.characterPower = character.light;
                characterInfo.characterId = character.characterId;

                // Add character to DOM
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
                    if (plugHash === 1820053069) { // Flickering Ligt - 2%
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
        let pastSeasonLevels = [];
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
                pastSeasonLevels.push(await ReturnSeasonPassLevel(seasonProgression, seasonProgressionPrestige));
                
            };
            
            // Check if hash is the current season
            if (hash == UserProfile.currentSeasonHash) {

                // Pull info from the current season
                seasonProgressionInfo = CharacterProgressions[seasonDefinitions[hash].seasonPassProgressionHash];
                seasonPassInfo = seasonPassDefinitions[seasonDefinitions[hash].seasonPassHash];
                prestigeProgressionSeasonInfo = CharacterProgressions[seasonPassInfo.prestigeProgressionHash];
                seasonPassLevel = await ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo);
                seasonalArtifactInfo = itemDefinitions[seasonDefinitions[hash].artifactItemHash];
                seasonalArtifactInfo.powerBonusProgression = {};
                seasonalArtifactInfo.powerBonusProgression = progressionDefinitions[1656313730];
                seasonInfo = seasonDefinitions[hash];

            };
        };

        // Store season start date
        seasonProgressionInfo.startDate = seasonInfo.startDate;

        // Sort levels in descending order to get highest season pass level
        pastSeasonLevels = pastSeasonLevels.sort((a,b) => b-a);
        let highestSeasonPassLevel = pastSeasonLevels[0];
        let seasonPassLevelsTotal = pastSeasonLevels.reduce((a,b) => a+b, 0);
        
        // Re-structure season pass rewards into a cleaner array structure
        let seasonPassRewardsTrack = progressionDefinitions[seasonPassInfo.rewardProgressionHash].rewardItems;
        let rewardsTrack = {};

        seasonPassRewardsTrack.forEach(v => {

            if (!rewardsTrack[v.rewardedAtProgressionLevel]) {
                rewardsTrack[v.rewardedAtProgressionLevel] = [];
            };
            rewardsTrack[v.rewardedAtProgressionLevel].push(v.itemHash);
        });


        // Push subheading statistics
        // AddValueToElementInner('currentSeasonNameField', seasonPassInfo.displayProperties.name);

        // Get artifact info -- check if profile has artifact
        // let artifact;
        // if (UserProfileProgressions.ProfileProgressions.seasonalArtifact) {

        //     // Change corresponding HTML elements to display stats
        //     artifact = UserProfileProgressions.ProfileProgressions.seasonalArtifact;

        //     if (artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel !== 0) {
        //         AddValueToElementInner('artifactXpToNextUnlock', InsertSeperators(artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel));
        //     }
        //     else {
        //         document.getElementById('artifactStatsSecondContainer').style.display = 'none';
        //     };

        //     AddValueToElementInner('artifactStatsArtifactBonus', `+${artifact.powerBonus}`);
        //     AddValueToElementInner('artifactXpToNextPowerBonus', InsertSeperators(artifact.powerBonusProgression.nextLevelAt - artifact.powerBonusProgression.progressToNextLevel));
        // }
        // else if (!UserProfileProgressions.ProfileProgressions.seasonalArtifact) {

        //     // Change corresponding HTML elements to display stats
        //     document.getElementById('artifactStatsFirstContainer').style.display = 'none';
        //     document.getElementById('artifactStatsSecondContainer').style.display = 'none';
        //     document.getElementById('artifactStatsThirdMetricContainer').style.display = 'none';
        //     document.getElementById('artifactStatsNoArtifactIsPresent').style.display = 'block';
        // };

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


        // Append allRelations to table
        // for (let index in relations.all) {
            
        //     // Find the category that the relation corresponds to
        //     let relation = relations.all[index];
        //     let category;
        //     for (let item in progressionPropertyKeyValues) {

        //         // If relation is in category, store in category
        //         if (progressionPropertyKeyValues[item].includes(ParsePropertyNameIntoWord(relation[0], true))) {
        //             category = item;
        //         };
        //     };

        //     if (category) {
        //         AddTableRow(table, [relation[0], ParsePropertyNameIntoWord(category), `${relation[1]}pts`]);
        //     };
        // };

        // Stop loading sequence
        CacheChangeItem('lastChar', characterId);
        characterLoadToggled = false;
        StopLoad();
    };
    log('-> LoadCharacter Done');
};
