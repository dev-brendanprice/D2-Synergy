import { LoadCharacter } from './LoadCharacter.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { CacheReturnItem } from './CacheReturnItem.js';

// Load first character on profile
// @object {characters}
export async function LoadPrimaryCharacter(characters) {
    
    CacheReturnItem('lastChar')
        .then(async (data) => {
            
            if (data === undefined) {
                let fallbackCharacter = characters[Object.keys(characters)[0]].classType;
                CacheChangeItem('lastChar', fallbackCharacter);
                await LoadCharacter(fallbackCharacter, characters);
                return;
            };
            await LoadCharacter(data, characters);
        })
        .catch((error) => {
            console.error(error);
        });
};