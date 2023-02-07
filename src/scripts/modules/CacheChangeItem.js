
// Change item in userCache, add if it doesn't exist
// @string {key}, @int {value}
export async function CacheChangeItem(key, value) {

    // Configure userCache if it does not exist
    if (!window.localStorage.getItem('userCache')) {
        if (value) {
            window.localStorage.setItem('userCache', JSON.stringify({key: value}));
        }
        else {
            window.localStorage.setItem('userCache', JSON.stringify({}));
        };
    };

    // Get current userCache and append new key:value pair
    let userCache = JSON.parse(window.localStorage.getItem('userCache'));
    userCache[key] = value;
    window.localStorage.setItem('userCache', JSON.stringify(userCache));
};