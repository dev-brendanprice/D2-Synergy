import {FetchMemberships} from "./playerSearch.js";
import getPlayerSeals from "./playerSeals.js";

// pulls profile information from URL paths /:profiles
async function HandleUrlPathing() {

    // NOTE: use localStorage instead, I can't figure out how to use state here
    const pathname = location.pathname;
    const profileKeys = pathname?.slice(1)?.split(",");

    // if no URL path, anything after / is considered ""
    if (profileKeys[0] === "") return;
    const profilesObject = {};

    // fetch memberships and save new userPair
    for (let profileKey of profileKeys) {
        const [ type, id ] = profileKey.split("-");
        const profileMemberships = await FetchMemberships(type, id);
        const profileSeals = await getPlayerSeals(type, id);

        profilesObject[profileKey] = {
            profile: profileMemberships.find((memship) => memship.membershipId === id), // get matching
            seals: profileSeals
        };
    }

    return profilesObject;
}

export default HandleUrlPathing;