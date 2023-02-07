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
import { ParseChar } from './ParseChar.js';

var characterLoadToggled = false, // Used to lockout character select during a load
    characterRecords;

// Profile data
var seasonPassInfo = {},
    seasonPassLevel = 0,
    prestigeProgressionSeasonInfo,
    seasonProgressionInfo = {};


// Load character from specific index
// @int {classType}, @boolean {isRefresh}
export async function LoadCharacter(classType, characters) {

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
            characterId,
            primaryCharacter,
            ItemSockets;


        // Clear (emtpy fields that are going to change) DOM content
        document.getElementById('noItemsTooltip').style.display = 'none';
        document.getElementById('bountyItems').innerHTML = '';
        document.getElementById('overlays').innerHTML = '';
        document.getElementById('filters').innerHTML = '';
        document.getElementById('ctgDestination').innerHTML = 'There are no (specific) relations for destinations.';
        document.getElementById('ctgActivityMode').innerHTML = 'There are no (specific) relations for activities.';
        document.getElementById('ctgItemCategory').innerHTML = 'There are no (specific) relations for weapon types.';
        document.getElementById('ctgKillType').innerHTML = 'There are no (specific) relations for kill types.';

        // Get chosen character via classType
        for (let entry in UserProfile.characters) {

            let character = UserProfile.characters[entry];
            if (character.classType === classType) {
                characterId = character.characterId;
                primaryCharacter = character;
            };
        };

        // Save character to localStorage
        CacheChangeItem('currentChar', primaryCharacter);

        // Do character selects
        document.getElementById('topCharacterTypeField').innerHTML = ParseChar(primaryCharacter.classType);
        document.getElementById('topCharacterSelectImg').src = `https://www.bungie.net${primaryCharacter.emblemBackgroundPath}`;
        document.getElementById('topCharacterPowerLevelField').innerHTML = primaryCharacter.light;

        let otherCharacters = Object.keys(characters).filter(v => v!==characterId);
        for (let id of otherCharacters) {
            
            let char = characters[id];
            let emblemLargeBg = itemDefinitions[char.emblemHash].secondarySpecial;
            let emblemPath = itemDefinitions[char.emblemHash].secondaryOverlay;

            if (!document.getElementById('middleCharacterTypeField').innerHTML) {
                document.getElementById('middleCharacterTypeField').innerHTML = ParseChar(char.classType);
                document.getElementById('middleCharacterContainer').style.backgroundImage = `url(https://www.bungie.net${emblemLargeBg})`;
                document.getElementById('middleCharacterIconImg').src = `https://www.bungie.net${emblemPath}`;
                document.getElementById('middleCharacterPowerLevelField').innerHTML = char.light;
            }
            else if (!document.getElementById('bottomCharacterTypeField').innerHTML) {
                document.getElementById('bottomCharacterTypeField').innerHTML = ParseChar(char.classType);
                document.getElementById('bottomCharacterContainer').style.backgroundImage = `url(https://www.bungie.net${emblemLargeBg})`;
                document.getElementById('bottomCharacterIconImg').src = `https://www.bungie.net${emblemPath}`;
                document.getElementById('bottomCharacterPowerLevelField').innerHTML = char.light;
            };
        };
        
        // Hide containers dependant on how many characters a user has (1, 2 or 3)
        if (otherCharacters.length === 0) {
            document.getElementById('middleCharacterContainer').style.display = 'none';
            document.getElementById('bottomCharacterContainer').style.display = 'none';
        }
        else if (otherCharacters.length === 1) {
            document.getElementById('bottomCharacterContainer').style.display = 'none';
        };

        // Get character-specific data from destinyUserProfile cache
        log(UserProfile);
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

        // Get season pass info
        seasonProgressionInfo = CharacterProgressions[seasonDefinitions[UserProfile.CurrentSeasonHash].seasonPassProgressionHash];
        seasonPassInfo = seasonPassDefinitions[seasonDefinitions[UserProfile.CurrentSeasonHash].seasonPassHash];
        prestigeProgressionSeasonInfo = CharacterProgressions[seasonPassInfo.prestigeProgressionHash];
        seasonPassLevel = await ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo);

        let seasonPassRewardsTrack = progressionDefinitions[seasonPassInfo.rewardProgressionHash].rewardItems, rewardsTrack = {};

        // Iterate through rewards track and formalize into a clean(er) array structure
        seasonPassRewardsTrack.forEach(v => {

            if (!rewardsTrack[v.rewardedAtProgressionLevel]) {
                rewardsTrack[v.rewardedAtProgressionLevel] = [];
            };
            rewardsTrack[v.rewardedAtProgressionLevel].push(v.itemHash);
        });


        // Push subheading statistics
        AddValueToElementInner('currentSeasonNameField', seasonPassInfo.displayProperties.name);

        // Get artifact info -- check if profile has artifact
        let artifact;
        if (UserProfileProgressions.ProfileProgressions.seasonalArtifact) {

            // Change corresponding HTML elements to display stats
            artifact = UserProfileProgressions.ProfileProgressions.seasonalArtifact;

            if (artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel !== 0) {
                AddValueToElementInner('artifactXpToNextUnlock', InsertSeperators(artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel));
            }
            else {
                document.getElementById('artifactStatsSecondContainer').style.display = 'none';
            };

            AddValueToElementInner('artifactStatsArtifactBonus', `+${artifact.powerBonus}`);
            AddValueToElementInner('artifactXpToNextPowerBonus', InsertSeperators(artifact.powerBonusProgression.nextLevelAt - artifact.powerBonusProgression.progressToNextLevel));
        }
        else if (!UserProfileProgressions.ProfileProgressions.seasonalArtifact) {

            // Change corresponding HTML elements to display stats
            document.getElementById('artifactStatsFirstContainer').style.display = 'none';
            document.getElementById('artifactStatsSecondContainer').style.display = 'none';
            document.getElementById('artifactStatsThirdMetricContainer').style.display = 'none';
            document.getElementById('artifactStatsNoArtifactIsPresent').style.display = 'block';
        };

        // Get progressional items
        var progressionalItemsObj = await ParseProgressionalItems(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp);

        // Get relations for progressional items
        var relations = await ParseProgressionalRelations(progressionalItemsObj);

        // Clear table and declare table div
        let table = document.getElementById('myTable');
        relationsTable.div = table;
        relationsTable.ClearTable();

        // Populate relations objects in global relationsTable object
        relationsTable.relations.bounties = relations.bounties;
        relationsTable.relations.challenges = relations.challenges;
        relationsTable.relations.all = relations.all;

        // Append allRelations to table
        for (let index in relations.all) {
            
            // Find the category that the relation corresponds to
            let relation = relations.all[index];
            let category;
            for (let item in progressionPropertyKeyValues) {

                // If relation is in category, store in category
                if (progressionPropertyKeyValues[item].includes(ParsePropertyNameIntoWord(relation[0], true))) {
                    category = item;
                };
            };

            if (category) {
                AddTableRow(table, [relation[0], ParsePropertyNameIntoWord(category), `${relation[1]}pts`]);
            };
        };

        // Stop loading sequence
        CacheChangeItem('lastChar', classType);
        characterLoadToggled = false;
        StopLoad();
    };
    log('-> LoadCharacter Done');
};
