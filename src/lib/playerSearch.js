
// take the memshipId + type and find the main memberships associated with this account => show user these memberships
export async function FetchMemberships(mtype, mid) {

    // create request data and query API to fetch user profiles
    const requestConfig = {
        method: 'GET',
        headers: {
            'X-Api-Key': import.meta.env.VITE_API_KEY
        }
    };

    const url =
        `https://www.bungie.net/Platform/Destiny2/${mtype}/Profile/${mid}/LinkedProfiles/?getAllMemberships=true`;
    const response = await fetch(url, requestConfig);
    const parsed = await response.json();
    return parsed?.Response?.profiles;
}

export async function GetPlayer(mtype, mid) {

    const requestConfig = {
        method: 'GET',
        headers: {
            'X-Api-Key': import.meta.env.VITE_API_KEY
        }
    };

    const url =
        `https://www.bungie.net/Platform/Destiny2/${mtype}/Profile/${mid}/LinkedProfiles/?getAllMemberships=true`;
    const response = await fetch(url, requestConfig);
    const searchResults = await response.json();
    const playerProfile = searchResults.Response.profiles.filter(p => p.membershipId === mid)[0];

    // change key names
    delete Object.assign(playerProfile, {"mtype": playerProfile.membershipType }).membershipType
    delete Object.assign(playerProfile, {"mid": playerProfile.membershipId }).membershipId
    delete Object.assign(playerProfile, {"name": playerProfile.bungieGlobalDisplayName }).bungieGlobalDisplayName
    delete Object.assign(playerProfile, {"code": playerProfile.bungieGlobalDisplayNameCode }).bungieGlobalDisplayNameCode

    // filter entry by mid and mtype
    return searchResults.Response.profiles.filter(p => p.mid === mid)[0]
}

// in preparation to use RaidHubs' API
export async function SearchForPlayer(submittedString) {

    const [ username, displayNameCode ] = submittedString.split('#');
    const requestConfig = { method: 'GET' }
    const searchResults = await fetch(`${import.meta.env.VITE_API_BASEURL}/api/search?q=${username}`,
        requestConfig)
        .then(res => res.json())
        .then(response => { return response })

    // filter entry by displayNameCode, if supplied
    if (displayNameCode) {
        searchResults.players = searchResults.players.filter(p => p.code === parseInt(displayNameCode))
        return searchResults
    }

    return searchResults
}