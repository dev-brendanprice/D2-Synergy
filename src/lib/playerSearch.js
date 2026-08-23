
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


// search the Bungie.net API for the submitted username
export async function SearchForPlayer_old(submittedString) {

    const [ submittedUsername, submittedID ] = submittedString.split('#'); // ignore when user submits ID

    // create request data and query API to search for player
    const requestConfig = {
        method: 'POST',
        headers: {
            'X-Api-Key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
            "displayNamePrefix": submittedUsername
        })
    };

    const response = await fetch('https://www.bungie.net/Platform/User/Search/GlobalName/0/', requestConfig);
    const parsed = await response.json();
    let bungieNetUsersFound = parsed?.Response?.searchResults;

    // if no results found
    if (bungieNetUsersFound.length === 0) {
        return [];
    }

    // save destiny membership type and membership id
    const memshipType = parsed?.Response?.searchResults[0]?.destinyMemberships[0]?.membershipType;
    const memshipId = parsed?.Response?.searchResults[0]?.destinyMemberships[0]?.membershipId;

    // returns an array of memberships (profiles)
    return await FetchMemberships(memshipType, memshipId);
}


/*
    UI, for each profile:
    - Show equipped emblem from primary character
    - Show "last played" timestamp

    Functionality
    - Don't use ?showAllMemberships=true in URL
    - Exclude Destiny 1 profiles from search results
        - how to filter these?
        - exclude results with lastPlayed before Destiny 2 release
    - If ID is used, take #0000 ID and find profile directly
    - If only one result in list, skip selector and load the profile
        - take zero-indexed profile from memberships list
    - If no results, show warning

    - use RaidHub user search API - Yes
*/

/*
    States for a bungie.net profile
    - multiple Destiny accounts, no cross save
    - multiple Destiny accounts, with cross save
    - only one Destiny account, no cross save
        - could also have a Destiny 1 account tied to this profile
 */

// searches API for profiles with matching username
export async function SearchForPlayer_getrid(submittedString) {

    const [ submittedUsername, submittedID ] = submittedString.split('#');
    const requestConfig = {
        method: 'POST',
        headers: { 'X-Api-Key': import.meta.env.VITE_API_KEY },
        body: JSON.stringify({
            "displayNamePrefix": submittedUsername
        })
    }

    return fetch('https://www.bungie.net/Platform/User/Search/GlobalName/0/', requestConfig)
        .then(res => res.json())
        .then(({Response}) => {
            return {Response, submittedUsername, submittedID};
        })
}


// in preparation to use RaidHubs' API
export async function SearchForPlayer(submittedString) {

    const [ username, displayNameCode ] = submittedString.split('#');
    const requestConfig = { method: 'GET' }

    const searchResults = await fetch(`http://localhost:3001/api/search?query=${username}&count=50`, requestConfig)
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