
// take the memshipId + type and find the main memberships associated with this account => show user these memberships
export async function FetchMemberships(memshipType, memshipId) {

    // create request data and query API to fetch user profiles
    const requestConfig = {
        method: 'GET',
        headers: {
            'X-Api-Key': import.meta.env.VITE_KEY
        }
    };

    const url = `https://www.bungie.net/Platform/Destiny2/${memshipType}/Profile/${memshipId}/LinkedProfiles/?getAllMemberships=true`;
    const response = await fetch(url, requestConfig);
    const parsed = await response.json();
    return parsed?.Response?.profiles;
}


// search the Bungie.net API for the submitted username
export async function SearchPlayer(submittedString) {

    const [ submittedUsername, submittedID ] = submittedString.split("#"); // ignore when user submits ID
    console.log(submittedUsername, submittedID);

    // create request data and query API to search for player
    const requestConfig = {
        method: 'POST',
        headers: {
            'X-Api-Key': import.meta.env.VITE_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "displayNamePrefix": submittedUsername
        })
    };

    const response = await fetch('https://www.bungie.net/Platform/User/Search/GlobalName/0/', requestConfig);
    const parsed = await response.json(); // parse the response to JSON
    const foundPlayers = parsed?.Response?.searchResults;
    console.log(foundPlayers);

    // if no results found
    if (foundPlayers.length === 0) {
        return [];
    }

    // save destiny membership type and membership id
    const memshipType = parsed?.Response?.searchResults[0]?.destinyMemberships[0]?.membershipType;
    const memshipId = parsed?.Response?.searchResults[0]?.destinyMemberships[0]?.membershipId;

    // returns an array of memberships (profiles)
    return await FetchMemberships(memshipType, memshipId);
};