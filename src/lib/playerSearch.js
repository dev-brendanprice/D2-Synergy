
// take the memshipId + type and find the main memberships associated with this account => show user these memberships
export async function FetchMemberships(memshipType, memshipId) {

    // create request data and query API to fetch user profiles
    const requestConfig = {
        method: 'GET',
        headers: {
            'X-Api-Key': import.meta.env.VITE_API_KEY
        }
    };

    const url = `https://www.bungie.net/Platform/Destiny2/${memshipType}/Profile/${memshipId}/LinkedProfiles/?getAllMemberships=true`;
    const response = await fetch(url, requestConfig);
    const parsed = await response.json();
    return parsed?.Response?.profiles;
}

// in preparation to use RaidHubs' API
export async function SearchForPlayer(submittedString) {

    const [ username, displayNameCode ] = submittedString.split('#');
    const requestConfig = { method: 'GET' }

    const searchResults = await fetch(`${import.meta.env.VITE_API_BASEURL}/api/search?query=${username}&count=50`, requestConfig)
        .then(res => res.json())
        .then(response => { return response })

    // filter out profiles with null displayName, displayNameCode and Stadia profiles (R.I.P)
    searchResults.response.results = searchResults.response.results.filter(p =>
        (p.bungieGlobalDisplayName !== null && p.bungieGlobalDisplayNameCode !== null) &&
        p.membershipType !== 5
    );

    // only filter by displayNameCode if supplied by user
    let profilesFilteredByNameCode;
    if (displayNameCode) {
        profilesFilteredByNameCode =
            searchResults?.response?.results?.filter(p => p.bungieGlobalDisplayNameCode === displayNameCode);
    }

    return profilesFilteredByNameCode ? profilesFilteredByNameCode : searchResults?.response?.results;
} // no lie this function took me over 2 weeks to get it working successfully