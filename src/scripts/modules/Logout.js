
// Log user out on request
export function Logout() {
    window.localStorage.clear();
    window.sessionStorage.clear();
    indexedDB.deleteDatabase('keyval-store');
    window.location.href = import.meta.env.HOME_URL;
};