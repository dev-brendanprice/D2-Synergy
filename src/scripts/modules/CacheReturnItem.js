
// Get current userCache and return specified key:value pair using key
// @string {key}
export async function CacheReturnItem(key) {
    let userCache = JSON.parse(window.localStorage.getItem('userCache'));
    return userCache[key];
};