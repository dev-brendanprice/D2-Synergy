
// search for player via username or memshipId
export async function SearchForPlayer(submittedString, isMid = false) {

    const requestConfig = { method: 'GET' }
    const searchResults = await fetch(`${import.meta.env.VITE_API_BASEURL}/api/search?q=${submittedString}`,
        requestConfig)
        .then(res => res.json())
        .then(response => { return response })

    // if membershipId was passed in, return first item
    if (isMid) return searchResults.players[0]

    return searchResults
}