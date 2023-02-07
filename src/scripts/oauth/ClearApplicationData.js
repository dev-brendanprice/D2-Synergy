
// Log user out on request
export async function ClearApplicationData() {
    window.localStorage.clear();
    window.sessionStorage.clear();
    indexedDB.deleteDatabase('keyval-store');
};