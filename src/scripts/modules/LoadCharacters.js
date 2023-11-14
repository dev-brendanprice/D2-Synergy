import { LoadCharacter } from './LoadCharacter.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { CacheReturnItem } from './CacheReturnItem.js';

// Load first character on profile
// @object {characters}
export async function LoadCharacters(characters) {

    // Make promise for asynchronousy
    return new Promise(async (resolve, reject) => {

        let primaryCharacterId;

        // Sort by the most recently played character
        await CacheReturnItem('lastChar')
        .then(async (characterId) => {

            // If character is false or characterId does not exist in current character list
            if (characterId in Object.keys(characters) || characterId === undefined) {

                // Find the most recently played character
                let charactersSortedByRecentlyPlayed = Object.entries(characters).sort((a,b) => new Date(b[1].dateLastPlayed) - new Date(a[1].dateLastPlayed));
                let fallbackCharacterId = charactersSortedByRecentlyPlayed[0][1].characterId;

                primaryCharacterId = fallbackCharacterId;

                // Change localStorage references and load character
                CacheChangeItem('lastChar', fallbackCharacterId);
                await LoadCharacter(fallbackCharacterId, characters);
            }

            // Else, load the last-stored character
            else {
                await LoadCharacter(characterId, characters);
                primaryCharacterId = characterId;
            };

            // Resolve the promise
            resolve();

        })
        .catch((error) => {
            reject(error);
        });

        
        // Load the other characters (only stores yield data)
        for (let index in characters) {

            let characterId = characters[index].characterId;
            if (characterId !== primaryCharacterId) {
                await LoadCharacter(characterId, characters, false, true);
            };
        };
    });
};