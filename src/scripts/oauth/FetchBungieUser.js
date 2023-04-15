import { CheckUserTokens } from "./CheckUserTokens";
import { axiosHeaders, log, UserProfile, UserProfileProgressions } from '../user.js';
import { MakeRequest } from "../modules/MakeRequest";

// Fetch bungie user data
// @checkTokens {boolean}
export async function FetchBungieUser(checkTokens = true) {

    log('-> FetchBungieUser Called');

    // Check user tokens, as we need to use the access token to fetch the user data
    if (checkTokens) {
        await CheckUserTokens();
    };

    // Get components
    const components = JSON.parse(window.localStorage.getItem('components'));
    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
            "X-API-Key": `${axiosHeaders.ApiKey}`
        }
    };


    // Check membershipType
    let membershipType = window.sessionStorage.getItem('membershipType');
    let destinyMembershipId = window.sessionStorage.getItem('destinyMembershipId');

    // Fetch linked profiles if memshipType or destinyMemshipId don't exist -- 254 as membershipType
    if (!membershipType || !destinyMembershipId) {
        await MakeRequest(`https://www.bungie.net/Platform/Destiny2/254/Profile/${components.membership_id}/LinkedProfiles/?getAllMemberships=true`, axiosConfig)
        .then((response) => {

            // Find the most recently played on profile
            let mostRecent = new Date(0);
            let mostRecentIndex = 0;
            for (let i = 0; i < response.data.Response.profiles.length; i++) {
                if (new Date(response.data.Response.profiles[i].dateLastPlayed) > new Date(mostRecent)) {
                    mostRecent = new Date(response.data.Response.profiles[i].dateLastPlayed);
                    mostRecentIndex = i;
                };
            };
    
            // Store response
            membershipType = response.data.Response.profiles[mostRecentIndex].membershipType;
            destinyMembershipId = response.data.Response.profiles[mostRecentIndex].membershipId;
    
            // Session storage
            window.sessionStorage.setItem('membershipType', membershipType);
            window.sessionStorage.setItem('destinyMembershipId', destinyMembershipId);
        })
        .catch((error) => {
            console.error(error);
        });
    };


    // Fetch profile
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=100,104,200,201,202,205,300,301,305,900,1200`, axiosConfig)
    .then((response) => {

        // Assign user profile and progression data
        UserProfile.AssignDestinyUserProfile(response.data.Response);
        UserProfile.AssignCharacters(response.data.Response.characters.data);
        UserProfile.AssignCurrentSeasonHash(response.data.Response.profile.data.currentSeasonHash);
        UserProfileProgressions.AssignProfileProgressions(response.data.Response.profileProgression.data);

        // Session storage
        window.sessionStorage.setItem('destinyUserProfile', JSON.stringify(response.data.Response));
    })
    .catch((error) => {
        console.error(error);
    });

    UserProfile.AssignDestinyMembershipId(destinyMembershipId);
    UserProfile.AssignMembershipType(membershipType);
    
    log(`-> FetchBungieUser Finished`);
};