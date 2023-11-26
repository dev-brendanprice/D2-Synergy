
// Get current userCache and return specified key:value pair using key
// @string {key}
export async function CacheReturnItem(key) {
    const userCache = JSON.parse(window.localStorage.getItem('userCache'));
    if (userCache) {
        return userCache[key];
    };
    return undefined;
};