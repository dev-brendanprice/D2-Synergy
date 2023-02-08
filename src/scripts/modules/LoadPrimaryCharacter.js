import { LoadCharacter } from './LoadCharacter.js';
import { CacheChangeItem } from './CacheChangeItem.js';
import { CacheReturnItem } from './CacheReturnItem.js';
import { ClearApplicationData } from '../oauth/ClearApplicationData.js';
import { clientId } from '../user.js';
import { GenerateRandomString } from './GenerateRandomString.js';

// Load first character on profile
// @object {characters}
export async function LoadPrimaryCharacter(characters) {
    
    CacheReturnItem('lastChar')
        .then(async (data) => {
            
            // If no character is found, load first character in list
            if (data === undefined) {

                let fallbackCharacter = characters[Object.keys(characters)[0]].classType;
                CacheChangeItem('lastChar', fallbackCharacter);
                await LoadCharacter(fallbackCharacter, characters);
                return;

                // Get first character in list, otherwise loop through until we find one
                // let fallbackCharacter = characters[Object.keys(characters)[0]].classType;
                // let fallbackCharacter;
                // if (characters[Object.keys(characters)[0]]) {
                //     fallbackCharacter = characters[Object.keys(characters)[0]].classType;
                //     CacheChangeItem('lastChar', fallbackCharacter);
                //     await LoadCharacter(fallbackCharacter, characters);
                //     return;
                // }
                // else {
                //     // Clear user data
                //     ClearApplicationData();

                //     // Make new state code and redirect to bungie.net
                //     const stateCode = GenerateRandomString(128);
                //     localStorage.setItem('stateCode', stateCode);
                //     window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code&state=${stateCode}&randomqueryparam=${GenerateRandomString(128)}`;
                // };
            };
            await LoadCharacter(data, characters);
        })
        .catch((error) => {
            console.error(error);
        });
};