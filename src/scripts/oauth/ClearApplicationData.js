
// Log user out on request
// @deleteDefinitions {boolean}, @authorizeAgain {boolean}
export async function ClearApplicationData(deleteDefinitions = false, authorizeAgain = false) {
    
    window.localStorage.clear();
    window.sessionStorage.clear();

    if (deleteDefinitions) {
        indexedDB.deleteDatabase('keyval-store');
    };

    if (authorizeAgain) {
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${import.meta.env.CLIENT_ID}&response_type=code`;
    };
};