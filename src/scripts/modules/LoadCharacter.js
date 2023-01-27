import { 
    CacheAuditItem, 
    ReturnSeasonPassLevel,
    AddValueToElementInner,
    InsertSeperators,
    GetProgressionalItems,
    StopLoad,
    ParseChar } from './ModuleScript';
import { 
    itemDefinitions,
    destinyUserProfile, 
    CurrentSeasonHash,
    seasonDefinitions,
    seasonPassDefinitions,
    progressionDefinitions,
    ProfileProgressions } from '../user.js';

const log = console.log.bind(console);

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

    log(characterLoadToggled, typeof characterLoadToggled);
    if (!characterLoadToggled) {

        log('LoadPrimaryCharacter START');

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
        for (let entry in destinyUserProfile.characters.data) {

            let character = destinyUserProfile.characters.data[entry];
            if (character.classType === classType) {
                characterId = character.characterId;
                primaryCharacter = character;
            };
        };

        // Save character to localStorage
        CacheAuditItem('currentChar', primaryCharacter);

        // Do character selects
        log(primaryCharacter.classType);
        document.getElementById('topCharacterTypeField').innerHTML = ParseChar(primaryCharacter.classType);
        document.getElementById('topCharacterSelectImg').src = `https://www.bungie.net${primaryCharacter.emblemBackgroundPath}`;
        document.getElementById('topCharacterPowerLevelField').innerHTML = primaryCharacter.light;

        let otherCharacters = Object.keys(characters).filter(v => v!==characterId);
        for (let id of otherCharacters) {
            
            let char = characters[id],
                emblemLargeBg = itemDefinitions[char.emblemHash].secondarySpecial;

            if (!document.getElementById('middleCharacterTypeField').innerHTML) {
                document.getElementById('middleCharacterTypeField').innerHTML = ParseChar(char.classType);
                document.getElementById('middleCharacterContainer').style.backgroundImage = `url(https://www.bungie.net${emblemLargeBg})`;
                document.getElementById('middleCharacterIconImg').src = `https://www.bungie.net${char.emblemPath}`;
                document.getElementById('middleCharacterPowerLevelField').innerHTML = char.light;
            }
            else if (!document.getElementById('bottomCharacterTypeField').innerHTML) {
                document.getElementById('bottomCharacterTypeField').innerHTML = ParseChar(char.classType);
                document.getElementById('bottomCharacterContainer').style.backgroundImage = `url(https://www.bungie.net${emblemLargeBg})`;
                document.getElementById('bottomCharacterIconImg').src = `https://www.bungie.net${char.emblemPath}`;
                document.getElementById('bottomCharacterPowerLevelField').innerHTML = char.light;
            };
        };

        // Get character-specific data from destinyUserProfile cache
        CharacterProgressions = destinyUserProfile.characterProgressions.data[characterId].progressions;
        CharacterEquipment = destinyUserProfile.characterEquipment.data[characterId].items;
        CharacterObjectives = destinyUserProfile.itemComponents.objectives.data;
        CharacterInventories = destinyUserProfile.characterInventories.data;
        characterRecords = destinyUserProfile.characterRecords.data[characterId].records;
        ItemSockets = destinyUserProfile.itemComponents.sockets.data;

        // Ghost experience mod bonus
        let ghostModBonusXp = 0;

        // Fetch equipped ghost mods
        CharacterEquipment.forEach(v => {
            if (v.bucketHash === 4023194814) { // Ghost bucket hash

                let itemPlugSet = ItemSockets[v.itemInstanceId].sockets;
                Object.keys(itemPlugSet).forEach(v => {

                    let plugHash = itemPlugSet[v].plugHash;
                    log(plugHash);
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
        log(seasonDefinitions[CurrentSeasonHash], CurrentSeasonHash)
        seasonProgressionInfo = CharacterProgressions[seasonDefinitions[CurrentSeasonHash].seasonPassProgressionHash];
        seasonPassInfo = seasonPassDefinitions[seasonDefinitions[CurrentSeasonHash].seasonPassHash];
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
        log(ProfileProgressions);
        if (ProfileProgressions.seasonalArtifact) {

            // Change corresponding HTML elements to display stats
            artifact = ProfileProgressions.seasonalArtifact;

            if (artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel !== 0) {
                AddValueToElementInner('artifactXpToNextUnlock', InsertSeperators(artifact.pointProgression.nextLevelAt - artifact.pointProgression.progressToNextLevel));
            }
            else {
                document.getElementById('artifactStatsSecondContainer').style.display = 'none';
            };

            AddValueToElementInner('artifactStatsArtifactBonus', `+${artifact.powerBonus}`);
            AddValueToElementInner('artifactXpToNextPowerBonus', InsertSeperators(artifact.powerBonusProgression.nextLevelAt - artifact.powerBonusProgression.progressToNextLevel));
        }
        else if (!ProfileProgressions.seasonalArtifact) {

            // Change corresponding HTML elements to display stats
            document.getElementById('artifactStatsFirstContainer').style.display = 'none';
            document.getElementById('artifactStatsSecondContainer').style.display = 'none';
            document.getElementById('artifactStatsThirdMetricContainer').style.display = 'none';
            document.getElementById('artifactStatsNoArtifactIsPresent').style.display = 'block';
        };

        // Get all progressional items
        GetProgressionalItems(CharacterObjectives, CharacterInventories, characterId, characterRecords, seasonProgressionInfo, prestigeProgressionSeasonInfo, rewardsTrack, ghostModBonusXp);

        // Stop loading sequence
        CacheAuditItem('lastChar', classType);
        characterLoadToggled = false;
        StopLoad();
    };
    log('LoadPrimaryCharacter END');
};
