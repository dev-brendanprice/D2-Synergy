import { LoadCharacter } from './LoadCharacter.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { CacheReturnItem } from './CacheReturnItem.js';

// Load first character on profile
// @object {characters}
export async function LoadPrimaryCharacter(characters) {

    // Make promise for asynchronousy
    return new Promise(async (resolve, reject) => {

        // Returns characterId
        CacheReturnItem('lastChar')
            .then(async (characterId) => {

                // If character is false or characterId does not exist in current character list
                if (!(!characterId in Object.keys(characters)) || characterId === undefined) {

                    // Find the most recently played character
                    let charactersSortedByRecentlyPlayed = Object.entries(characters).sort((a,b) => new Date(a.dateLastPlayed) > new Date(b.dateLastPlayed));
                    let fallbackCharacterId = charactersSortedByRecentlyPlayed[0][1].characterId;

                    // Change localStorage references and load character
                    CacheChangeItem('lastChar', fallbackCharacterId);
                    await LoadCharacter(fallbackCharacterId, characters);
                }

                // Else, load the last-stored character
                else {
                    await LoadCharacter(characterId, characters);
                };

                // Resolve the promise
                resolve();

            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });

    });
};