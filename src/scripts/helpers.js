const log = console.log.bind(console);

// Returns corresponding class name using classType
// @int {classType}
export var parseChar = (classType) => {
    var r;
    if (classType === 0) {
        r='Titan'
    }else if (classType === 1) {
        r='Hunter'
    }else if (classType === 2) {
        r='Warlock'
    }else{ console.error('could not parse character, parseChar() @function'); };
    return r;
};


// Returns size of data that currently resides in localStorage
// @window.obj {localStorage}
export var GetLsSize = async (localStorage) => {
    var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;

    while (i--) { values.push(localStorage.getItem(keys[i])); };

    log('[Usage Bytes]: ', encodeURI(JSON.stringify(values)).split(/%..|./).length - 1);
};


// Query item against manifest via an itemHash
// @int {itemHash}
export var QueryItemHash = async (itemHash) => {
    var res = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('accessToken')).value}` }});
    return res;
};

